import * as pdfjsLib from 'pdfjs-dist';

// CRITICAL: Set worker BEFORE any PDF operations
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

interface ParsedResume {
  text: string;
  name?: string;
  email?: string;
  phone?: string;
  education?: string[];
  experience?: string[];
  skills?: string[];
}

export class PDFService {
  async extractTextFromPDF(file: File): Promise<string> {
    try {
      console.log('PDFService: Starting PDF extraction for', file.name);

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      console.log(`PDFService: PDF loaded with ${pdf.numPages} pages`);

      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      console.log('PDFService: Extraction complete');
      return fullText.trim();
    } catch (error) {
      console.error('PDFService: Error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async parseResumeFromPDF(file: File): Promise<ParsedResume> {
    const text = await this.extractTextFromPDF(file);
    return {
      text,
      name: this.extractName(text),
      email: this.extractEmail(text),
      phone: this.extractPhone(text),
      education: this.extractEducation(text),
      experience: this.extractExperience(text),
      skills: this.extractSkills(text),
    };
  }

  private extractName(text: string): string | undefined {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      const words = firstLine.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && /^[A-Z]/.test(firstLine)) {
        return firstLine;
      }
    }
    return undefined;
  }

  private extractEmail(text: string): string | undefined {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const match = text.match(emailRegex);
    return match ? match[0] : undefined;
  }

  private extractPhone(text: string): string | undefined {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : undefined;
  }

  private extractEducation(text: string): string[] {
    const education: string[] = [];
    const educationKeywords = ['education', 'academic', 'university', 'college', 'bachelor', 'master', 'phd', 'degree'];
    const lines = text.split('\n');

    let inEducationSection = false;
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
        inEducationSection = true;
      } else if (inEducationSection && /^[A-Z]/.test(line.trim())) {
        if (['experience', 'work', 'employment', 'skills'].some(keyword => lowerLine.includes(keyword))) {
          break;
        }
      }
      if (inEducationSection && line.trim()) {
        education.push(line.trim());
      }
    }
    return education;
  }

  private extractExperience(text: string): string[] {
    const experience: string[] = [];
    const experienceKeywords = ['experience', 'work history', 'employment', 'professional'];
    const lines = text.split('\n');

    let inExperienceSection = false;
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
        inExperienceSection = true;
      } else if (inExperienceSection && /^[A-Z]/.test(line.trim())) {
        if (['education', 'skills', 'certifications'].some(keyword => lowerLine.includes(keyword))) {
          break;
        }
      }
      if (inExperienceSection && line.trim()) {
        experience.push(line.trim());
      }
    }
    return experience;
  }

  private extractSkills(text: string): string[] {
    const skills: string[] = [];
    const skillsKeywords = ['skills', 'technical skills', 'competencies', 'expertise'];
    const lines = text.split('\n');

    let inSkillsSection = false;
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (skillsKeywords.some(keyword => lowerLine.includes(keyword))) {
        inSkillsSection = true;
        continue;
      } else if (inSkillsSection && /^[A-Z]/.test(line.trim())) {
        if (['experience', 'education', 'certifications'].some(keyword => lowerLine.includes(keyword))) {
          break;
        }
      }
      if (inSkillsSection && line.trim()) {
        const lineSkills = line.split(/[,;|]/).map(s => s.trim()).filter(s => s);
        skills.push(...lineSkills);
      }
    }
    return skills;
  }
}

export const pdfService = new PDFService();
