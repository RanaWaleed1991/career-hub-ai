import type { ResumeData } from '../types';

export const resumeDataToText = (data: ResumeData): string => {
  let text = '';

  // Personal Details
  text += `${data.personalDetails.fullName}\n`;
  text += `${data.personalDetails.jobTitle}\n`;
  text += `Contact: ${data.personalDetails.email} | ${data.personalDetails.phone} | ${data.personalDetails.address}\n`;
  if (data.personalDetails.linkedin) text += `LinkedIn: ${data.personalDetails.linkedin}\n`;
  if (data.personalDetails.website) text += `Website: ${data.personalDetails.website}\n`;
  text += '\n---\n\n';

  // Summary
  if (data.summary) {
    text += '## Professional Summary\n';
    text += `${data.summary}\n\n`;
    text += '---\n\n';
  }

  // Experience
  if (data.experience.length > 0) {
    text += '## Work Experience\n';
    data.experience.forEach(exp => {
      text += `**${exp.jobTitle}** at **${exp.company}**, ${exp.location}\n`;
      text += `${exp.startDate} - ${exp.endDate}\n`;
      text += `${exp.description}\n\n`;
    });
    text += '---\n\n';
  }

  // Education
  if (data.education.length > 0) {
    text += '## Education\n';
    data.education.forEach(edu => {
      text += `**${edu.degree}** from **${edu.institution}**, ${edu.location}\n`;
      text += `Graduated: ${edu.gradDate}\n\n`;
    });
    text += '---\n\n';
  }

  // Skills
  if (data.skills.length > 0) {
    text += '## Skills\n';
    text += data.skills.map(skill => skill.name).join(', ') + '\n';
  }

  return text.trim();
};
