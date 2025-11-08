import { GoogleGenAI, Type } from "@google/genai";
import type { ResumeAnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const enhanceTextWithAI = async (text: string, section: 'summary' | 'experience'): Promise<string> => {
  if (!text.trim()) {
    return "";
  }
  
  const prompt = PROMPT_TEMPLATES[section].replace('{TEXT}', text);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get AI suggestion. Please check your API key and try again.");
  }
};

export const tailorResumeForJob = async (resumeText: string, jobDescription: string): Promise<string> => {
  if (!resumeText.trim() || !jobDescription.trim()) {
    return "";
  }

  const prompt = PROMPT_TEMPLATES['tailor']
    .replace('{RESUME}', resumeText)
    .replace('{JOB_DESCRIPTION}', jobDescription);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using a more powerful model for this complex task
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for tailoring:", error);
    throw new Error("Failed to tailor resume. Please check your API key and try again.");
  }
};

export const generateCoverLetter = async (resumeText: string, jobTitle: string, company: string, jobDescription: string): Promise<string> => {
  if (!resumeText.trim() || !jobDescription.trim() || !jobTitle.trim() || !company.trim()) {
    return "";
  }

  const prompt = PROMPT_TEMPLATES['coverLetter']
    .replace('{RESUME}', resumeText)
    .replace('{JOB_TITLE}', jobTitle)
    .replace('{COMPANY}', company)
    .replace('{JOB_DESCRIPTION}', jobDescription);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for cover letter:", error);
    throw new Error("Failed to generate cover letter. Please check your API key and try again.");
  }
};

export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysisResult> => {
  if (!resumeText.trim()) {
    throw new Error("Resume text cannot be empty.");
  }

  const prompt = PROMPT_TEMPLATES['resumeAnalysis'].replace('{RESUME_TEXT}', resumeText);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Use a powerful model for analysis
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeAnalysisSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ResumeAnalysisResult;
  } catch (error) {
    console.error("Error calling Gemini API for resume analysis:", error);
    throw new Error("Failed to analyze resume. The AI model may be temporarily unavailable. Please try again later.");
  }
};