// Ensure Promise.withResolvers polyfill is available before importing @google/genai
if (typeof Promise.withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../config/env.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  enhanceSummarySchema,
  analyzeResumeSchema,
  generateCoverLetterSchema,
  tailorResumeSchema,
  skillGapSchema,
  selectionCriteriaSchema,
} from '../validators/schemas.js';
import { subscriptionDb } from '../services/database.js';

const router = Router();

// Initialize Gemini AI with API key from environment
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

// Prompt templates (same as frontend)
const PROMPT_TEMPLATES: Record<string, string> = {
  summary: `
    As an expert resume writer, rewrite the following professional summary to be more impactful, concise, and professional for a resume.
    Focus on highlighting key achievements and skills. Keep it to 3-4 sentences.

    Original Text:
    "{TEXT}"

    Rewritten Summary:
  `,
  experience: `
    As an expert resume writer, rewrite the following job description bullet points for a resume.
    Transform responsibilities into achievements using action verbs and quantifiable results where possible.
    Ensure the tone is professional and compelling. Format the output as a bulleted list (using '- ' for each point).

    Original Text:
    "{TEXT}"

    Rewritten Bullet Points:
  `,
  tailor: `
    As an expert resume writer and career coach, analyze the provided resume and job description.
    Your task is to rewrite the resume to be perfectly tailored for the job, enhancing its impact and alignment with the role.

    Follow these instructions:
    1.  **Professional Summary:** Rewrite the summary to immediately grab the recruiter's attention by highlighting the most relevant qualifications and experiences from the resume that match the job description.
    2.  **Experience Section:** For each role, revise the bullet points to be achievement-oriented. Use action verbs and quantify results where possible. Crucially, align these achievements with the key responsibilities and requirements mentioned in the job description.
    3.  **Keywords:** Naturally integrate relevant keywords from the job description throughout the resume.
    4.  **Skills Section:** Suggest a list of skills from the resume that are most relevant to the job.
    5.  **Tone and Formatting:** Maintain a professional tone. The output should be the complete, rewritten resume text.

    Original Resume:
    ---
    {RESUME}
    ---

    Job Description:
    ---
    {JOB_DESCRIPTION}
    ---

    Rewritten and Tailored Resume:
  `,
  coverLetter: `
    As an expert career coach and professional writer, create a compelling and tailored cover letter.

    **Instructions:**
    1.  **Analyze the Resume:** Use the provided resume to understand the candidate's skills, experience, and achievements.
    2.  **Align with Job Description:** Directly address the requirements and keywords mentioned in the job description.
    3.  **Structure and Tone:**
        *   Write in a professional, confident, and enthusiastic tone.
        *   Structure the letter with an introduction (stating the role and company), a body (2-3 paragraphs highlighting relevant qualifications and experiences), and a conclusion (reiterating interest and a call to action).
        *   Do not use placeholders like "[Your Name]" or "[Hiring Manager Name]". The letter should be ready to use as-is. Start with a professional salutation like "Dear Hiring Team,".
    4.  **Output:** Generate only the cover letter text, without any additional commentary or explanation.

    **Candidate's Resume:**
    ---
    {RESUME}
    ---

    **Job Title:**
    {JOB_TITLE}

    **Company Name:**
    {COMPANY}

    **Job Description:**
    ---
    {JOB_DESCRIPTION}
    ---

    **Generated Cover Letter:**
  `,
  resumeAnalysis: `
    You are an expert AI career coach and resume analyst with deep knowledge of Applicant Tracking Systems (ATS) and modern recruitment practices.
    Your task is to analyze the provided resume text and generate a detailed, constructive scorecard.

    **Instructions:**
    1.  **ATS Score (0-100):** Calculate a score based on ATS compatibility. Consider factors like standard formatting, clear headings (Summary, Experience, Education, Skills), use of keywords, and avoidance of complex elements like tables or images that ATS struggles with.
    2.  **Overall Feedback:** Provide a concise, high-level summary of the resume's main strengths and areas for improvement.
    3.  **Section-by-Section Analysis:**
        *   Evaluate each key section of a resume: **Overall Formatting**, **Professional Summary**, **Work Experience**, **Skills Section**, and **Education**.
        *   For each section, provide a qualitative **rating** ('Poor', 'Fair', 'Good', 'Excellent').
        *   Provide a list of specific, actionable **feedback points**. Frame feedback constructively (e.g., "Consider adding quantifiable achievements...").
    4.  **Recruiter's Summary:** Write a 3-4 sentence summary of the candidate's profile as a busy recruiter would perceive it, highlighting their most valuable qualifications.
    5.  **Output Format:** The output MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or explanations outside of the JSON object.

    **Resume Text to Analyze:**
    ---
    {RESUME_TEXT}
    ---
  `
};

const resumeAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    atsScore: { type: Type.INTEGER, description: "A score from 0 to 100 for ATS compatibility." },
    overallFeedback: { type: Type.STRING, description: "A brief summary of the resume's strengths and weaknesses." },
    sectionFeedback: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sectionName: { type: Type.STRING, description: "The name of the resume section being evaluated (e.g., 'Overall Formatting', 'Professional Summary')." },
          rating: { type: Type.STRING, description: "A qualitative rating: 'Poor', 'Fair', 'Good', or 'Excellent'." },
          feedbackPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of specific, actionable feedback points for this section."
          }
        },
        required: ["sectionName", "rating", "feedbackPoints"]
      }
    },
    recruiterSummary: { type: Type.STRING, description: "A 3-4 sentence summary from a recruiter's perspective." }
  },
  required: ["atsScore", "overallFeedback", "sectionFeedback", "recruiterSummary"]
};

// POST /api/gemini/enhance-summary
router.post('/enhance-summary', authMiddleware, enhanceSummarySchema, validate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if user has reached their limit BEFORE enhancing
    const subscription = await subscriptionDb.getCurrent(req.user.id);
    const plan = subscription?.plan || 'free';
    const currentUsage = subscription?.ai_enhancements_used || 0;

    // Define limits per plan
    const limits: Record<string, number> = {
      free: 10,
      weekly: Infinity,
      monthly: Infinity,
    };

    const limit = limits[plan];
    if (currentUsage >= limit) {
      res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your limit of ${limit} AI enhancements. Please upgrade to continue.`,
        limitReached: true,
        currentUsage,
        limit: limit === Infinity ? 'unlimited' : limit,
      });
      return;
    }

    const { text, section } = req.body;

    const prompt = PROMPT_TEMPLATES[section].replace('{TEXT}', text);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const enhancedText = response.text?.trim() || '';

    // Update usage counter for AI enhancement
    try {
      await subscriptionDb.updateFeatureUsage(req.user.id, {
        ai_enhancements_used: currentUsage + 1
      });
    } catch (dbError) {
      console.error('Failed to update AI enhancement usage counter:', dbError);
      // Don't fail the request if counter update fails
    }

    res.json({ enhancedText });
  } catch (error) {
    console.error('Error calling Gemini API for enhance-summary:', error);
    res.status(500).json({ error: 'Failed to enhance text. Please try again.' });
  }
});

// POST /api/gemini/generate-cover-letter
router.post('/generate-cover-letter', authMiddleware, generateCoverLetterSchema, validate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if user has reached their limit BEFORE generating
    const subscription = await subscriptionDb.getCurrent(req.user.id);
    const plan = subscription?.plan || 'free';
    const currentUsage = subscription?.cover_letters_generated || 0;

    // Define limits per plan
    const limits: Record<string, number> = {
      free: 3,
      weekly: Infinity,
      monthly: Infinity,
    };

    const limit = limits[plan];
    if (currentUsage >= limit) {
      res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your limit of ${limit} cover letters. Please upgrade to continue.`,
        limitReached: true,
        currentUsage,
        limit: limit === Infinity ? 'unlimited' : limit,
      });
      return;
    }

    const { resumeText, jobTitle, company, jobDescription } = req.body;

    const prompt = PROMPT_TEMPLATES['coverLetter']
      .replace('{RESUME}', resumeText)
      .replace('{JOB_TITLE}', jobTitle)
      .replace('{COMPANY}', company)
      .replace('{JOB_DESCRIPTION}', jobDescription);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    const coverLetter = response.text?.trim() || '';

    // Update usage counter for cover letter generation
    try {
      await subscriptionDb.updateFeatureUsage(req.user.id, {
        cover_letters_generated: currentUsage + 1
      });
    } catch (dbError) {
      console.error('Failed to update cover letter usage counter:', dbError);
      // Don't fail the request if counter update fails
    }

    res.json({ coverLetter });
  } catch (error) {
    console.error('Error calling Gemini API for cover letter:', error);
    res.status(500).json({ error: 'Failed to generate cover letter. Please try again.' });
  }
});

// POST /api/gemini/analyze-resume
router.post('/analyze-resume', authMiddleware, analyzeResumeSchema, validate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if user has reached their limit BEFORE analyzing
    const subscription = await subscriptionDb.getCurrent(req.user.id);
    const plan = subscription?.plan || 'free';
    const currentUsage = subscription?.resume_analyses_done || 0;

    // Define limits per plan
    const limits: Record<string, number> = {
      free: 3,
      weekly: 10,
      monthly: Infinity,
    };

    const limit = limits[plan];
    if (currentUsage >= limit) {
      res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your limit of ${limit === Infinity ? 'unlimited' : limit} resume analyses. Please upgrade to continue.`,
        limitReached: true,
        currentUsage,
        limit: limit === Infinity ? 'unlimited' : limit,
      });
      return;
    }

    const { resumeText } = req.body;

    const prompt = PROMPT_TEMPLATES['resumeAnalysis'].replace('{RESUME_TEXT}', resumeText);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeAnalysisSchema,
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const analysis = JSON.parse(jsonText);

    // Update usage counter for resume analysis
    try {
      await subscriptionDb.updateFeatureUsage(req.user.id, {
        resume_analyses_done: currentUsage + 1
      });
    } catch (dbError) {
      console.error('Failed to update resume analysis usage counter:', dbError);
      // Don't fail the request if counter update fails
    }

    // Add warning for weekly users approaching limit
    const newUsage = currentUsage + 1;
    let warningMessage: string | undefined;
    if (plan === 'weekly' && newUsage >= 8) {
      const remaining = limit - newUsage;
      warningMessage = remaining === 1
        ? `You have 1 resume analysis left this week.`
        : `You have ${remaining} resume analyses left this week.`;
    }

    res.json({ analysis, ...(warningMessage && { warningMessage }) });
  } catch (error) {
    console.error('Error calling Gemini API for resume analysis:', error);
    res.status(500).json({ error: 'Failed to analyze resume. Please try again.' });
  }
});

// POST /api/gemini/tailor-resume
router.post('/tailor-resume', authMiddleware, tailorResumeSchema, validate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if user has reached their limit BEFORE tailoring
    const subscription = await subscriptionDb.getCurrent(req.user.id);
    const plan = subscription?.plan || 'free';
    const currentUsage = (subscription as any)?.ai_tailoring_used || 0;

    // Define limits per plan
    const limits: Record<string, number> = {
      free: 3,
      weekly: Infinity,
      monthly: Infinity,
    };

    const limit = limits[plan];
    if (currentUsage >= limit) {
      res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your limit of ${limit} resume tailoring sessions. Please upgrade to continue.`,
        limitReached: true,
        currentUsage,
        limit: limit === Infinity ? 'unlimited' : limit,
      });
      return;
    }

    const { resumeText, jobDescription } = req.body;

    const prompt = PROMPT_TEMPLATES['tailor']
      .replace('{RESUME}', resumeText)
      .replace('{JOB_DESCRIPTION}', jobDescription);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    const tailoredResume = response.text?.trim() || '';

    // Update usage counter for resume tailoring
    try {
      await subscriptionDb.updateFeatureUsage(req.user.id, {
        ai_tailoring_used: currentUsage + 1
      } as any);
    } catch (dbError) {
      console.error('Failed to update tailoring usage counter:', dbError);
      // Don't fail the request if counter update fails
    }

    res.json({ tailoredResume });
  } catch (error) {
    console.error('Error calling Gemini API for tailoring:', error);
    res.status(500).json({ error: 'Failed to tailor resume. Please try again.' });
  }
});

// ─── Skill Gap Analysis structured output schema ────────────────────────────
const skillGapOutputSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.INTEGER,
      description: 'Overall match percentage between resume and job description, 0-100.',
    },
    matchSummary: {
      type: Type.STRING,
      description: 'A 2-3 sentence executive summary of how well the candidate matches the role.',
    },
    presentSkills: {
      type: Type.ARRAY,
      description: 'Skills the candidate already has that are relevant to the role.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: {
            type: Type.STRING,
            description: 'One of: technical, soft, certification, domain',
          },
          strength: {
            type: Type.STRING,
            description: 'One of: strong (explicitly proven), moderate (implied), mentioned (brief mention)',
          },
        },
        required: ['name', 'category', 'strength'],
      },
    },
    missingSkills: {
      type: Type.ARRAY,
      description: 'Skills required or desired by the JD that are absent from the resume.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: {
            type: Type.STRING,
            description: 'One of: technical, soft, certification, domain',
          },
          priority: {
            type: Type.STRING,
            description: 'One of: critical (must-have), important (strong preference), nice-to-have',
          },
          reason: {
            type: Type.STRING,
            description: 'One sentence explaining why this skill matters for the role.',
          },
        },
        required: ['name', 'category', 'priority', 'reason'],
      },
    },
    keywordGaps: {
      type: Type.ARRAY,
      description: 'Individual keywords or tools from the JD not found in the resume (e.g. "Kubernetes", "JIRA").',
      items: { type: Type.STRING },
    },
    recommendations: {
      type: Type.ARRAY,
      description: 'Concrete, actionable next steps the candidate can take.',
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          action: {
            type: Type.STRING,
            description: 'Specific action to take (e.g. "Add your AWS experience to the Skills section").',
          },
          type: {
            type: Type.STRING,
            description: 'One of: highlight (already have it, surface it), learn (acquire the skill), reframe (reword existing experience)',
          },
        },
        required: ['skill', 'action', 'type'],
      },
    },
    strengthAreas: {
      type: Type.ARRAY,
      description: 'Top 3 areas where the candidate is particularly well matched.',
      items: { type: Type.STRING },
    },
    improvementAreas: {
      type: Type.ARRAY,
      description: 'Top 3 areas the candidate should focus on to improve their match score.',
      items: { type: Type.STRING },
    },
  },
  required: [
    'matchScore',
    'matchSummary',
    'presentSkills',
    'missingSkills',
    'keywordGaps',
    'recommendations',
    'strengthAreas',
    'improvementAreas',
  ],
};

// ─── Selection Criteria structured output schema ─────────────────────────────
const selectionCriteriaOutputSchema = {
  type: Type.OBJECT,
  properties: {
    jobTitle: { type: Type.STRING },
    organization: { type: Type.STRING },
    criteria: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: 'One of: essential, desirable',
          },
          criterion: {
            type: Type.STRING,
            description: 'The exact criterion text as stated in (or inferred from) the job description.',
          },
          starResponse: {
            type: Type.OBJECT,
            properties: {
              situation: {
                type: Type.STRING,
                description: 'The context or background. Must be specific and drawn from the resume.',
              },
              task: {
                type: Type.STRING,
                description: 'The responsibility or challenge the candidate faced.',
              },
              action: {
                type: Type.STRING,
                description: 'Specific actions taken. Use assertive, first-person language with metrics where possible.',
              },
              result: {
                type: Type.STRING,
                description: 'Quantified outcome. Include percentages, dollar values, time saved, etc. where the resume provides them.',
              },
            },
            required: ['situation', 'task', 'action', 'result'],
          },
          fullResponse: {
            type: Type.STRING,
            description: 'A polished, 150-250 word prose paragraph combining the STAR components. Assertive, evidence-based tone.',
          },
          confidence: {
            type: Type.STRING,
            description: 'One of: high (strong evidence in resume), medium (partial evidence), low (limited evidence — flag to user)',
          },
        },
        required: ['type', 'criterion', 'starResponse', 'fullResponse', 'confidence'],
      },
    },
    generalNotes: {
      type: Type.STRING,
      description: 'Any overall tips or caveats for this application (e.g. gaps the candidate should address in an interview).',
    },
  },
  required: ['jobTitle', 'organization', 'criteria', 'generalNotes'],
};

// POST /api/gemini/skill-gap-analysis
router.post('/skill-gap-analysis', authMiddleware, skillGapSchema, validate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Skill gap analysis shares the resume_analyses_done counter
    const subscription = await subscriptionDb.getCurrent(req.user.id);
    const plan = subscription?.plan || 'free';
    const currentUsage = subscription?.resume_analyses_done || 0;

    const limits: Record<string, number> = {
      free: 3,
      weekly: 10,
      monthly: Infinity,
    };

    const limit = limits[plan];
    if (currentUsage >= limit) {
      res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your limit of ${limit === Infinity ? 'unlimited' : limit} career audits. Please upgrade to continue.`,
        limitReached: true,
        currentUsage,
        limit: limit === Infinity ? 'unlimited' : limit,
      });
      return;
    }

    const { resumeText, jobDescription } = req.body;

    const prompt = `You are an expert career coach and talent acquisition specialist with deep knowledge of ATS systems and modern hiring practices.

Your task is to perform a precise, evidence-based Skill Gap Analysis by comparing the candidate's resume against the provided job description.

**Critical Instructions:**
1. Base ALL findings strictly on the actual text provided. Do not invent skills or experiences.
2. Be specific — name exact tools, frameworks, certifications, and methodologies from the JD.
3. Prioritise "critical" missing skills that appear multiple times or are listed as essential in the JD.
4. For recommendations, be actionable: tell the user exactly what to do (add, reframe, highlight, or learn).
5. The matchScore should reflect genuine alignment — be realistic, not optimistic.
6. Output must be a single valid JSON object matching the provided schema exactly.

**Candidate's Resume:**
---
${resumeText}
---

**Job Description:**
---
${jobDescription}
---`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: skillGapOutputSchema,
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const analysis = JSON.parse(jsonText);

    try {
      await subscriptionDb.updateFeatureUsage(req.user.id, {
        resume_analyses_done: currentUsage + 1,
      });
    } catch (dbError) {
      console.error('Failed to update skill gap analysis usage counter:', dbError);
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Error in POST /skill-gap-analysis:', error);
    res.status(500).json({ error: 'Failed to run skill gap analysis. Please try again.' });
  }
});

// POST /api/gemini/selection-criteria
router.post('/selection-criteria', authMiddleware, selectionCriteriaSchema, validate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Selection criteria shares the cover_letters_generated counter
    const subscription = await subscriptionDb.getCurrent(req.user.id);
    const plan = subscription?.plan || 'free';
    const currentUsage = subscription?.cover_letters_generated || 0;

    const limits: Record<string, number> = {
      free: 3,
      weekly: Infinity,
      monthly: Infinity,
    };

    const limit = limits[plan];
    if (currentUsage >= limit) {
      res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your limit of ${limit} documents this period. Please upgrade to continue.`,
        limitReached: true,
        currentUsage,
        limit: limit === Infinity ? 'unlimited' : limit,
      });
      return;
    }

    const { resumeText, jobDescription } = req.body;

    const prompt = `You are an expert career coach specialising in government, corporate, and professional job applications that require formal "Statement of Claims" or "Selection Criteria" responses.

Your task is to:
1. Carefully read the job description and identify EVERY explicit selection criterion (both essential and desirable). If criteria are not listed explicitly, infer them from the responsibilities and requirements sections.
2. For EACH criterion, draft a structured STAR response (Situation, Task, Action, Result) using ONLY evidence from the candidate's actual resume.
3. Write a polished, assertive full-paragraph response (150-250 words) for each criterion.
4. Use first-person, active voice. Quantify results with specific metrics wherever the resume provides them.
5. Mark confidence level honestly: "low" if the resume has minimal evidence for a criterion.
6. Extract the job title and organisation name from the job description.
7. Output must be a single valid JSON object matching the provided schema exactly.

**Candidate's Resume:**
---
${resumeText}
---

**Job Description:**
---
${jobDescription}
---`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: selectionCriteriaOutputSchema,
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const result = JSON.parse(jsonText);

    try {
      await subscriptionDb.updateFeatureUsage(req.user.id, {
        cover_letters_generated: currentUsage + 1,
      });
    } catch (dbError) {
      console.error('Failed to update selection criteria usage counter:', dbError);
    }

    res.json({ result });
  } catch (error) {
    console.error('Error in POST /selection-criteria:', error);
    res.status(500).json({ error: 'Failed to generate selection criteria. Please try again.' });
  }
});

export default router;
