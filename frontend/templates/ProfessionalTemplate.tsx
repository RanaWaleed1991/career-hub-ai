import React from 'react';
import type { ResumeData } from '../types';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '../components/icons';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

  return (
    <div className="bg-white p-12 font-sans text-gray-800 min-h-full">
      {/* Header Section */}
      <div className="mb-8">
        {/* Name - Very Large and Bold */}
        <h1 className="text-5xl font-bold text-[#1E40AF] mb-2 tracking-tight">
          {personalDetails.fullName}
        </h1>

        {/* Job Title */}
        <p className="text-xl text-[#1F2937] font-medium mb-4">
          {personalDetails.jobTitle}
        </p>

        {/* Contact Information - Horizontal Line */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#1F2937] border-t-2 border-[#0891B2] pt-3">
          {personalDetails.email && (
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 text-[#0891B2]" />
              <span>{personalDetails.email}</span>
            </div>
          )}
          {personalDetails.phone && (
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-[#0891B2]" />
              <span>{personalDetails.phone}</span>
            </div>
          )}
          {personalDetails.address && (
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-[#0891B2]" />
              <span>{personalDetails.address}</span>
            </div>
          )}
          {personalDetails.linkedin && (
            <div className="flex items-center gap-2">
              <span className="text-[#0891B2]">•</span>
              <a href={personalDetails.linkedin} className="text-[#0891B2] hover:underline">
                LinkedIn
              </a>
            </div>
          )}
          {personalDetails.website && (
            <div className="flex items-center gap-2">
              <span className="text-[#0891B2]">•</span>
              <a href={personalDetails.website} className="text-[#0891B2] hover:underline">
                Website
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary Section */}
      {summary && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1E40AF] uppercase tracking-wider mb-2 pb-2 border-b-2 border-[#0891B2]">
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed text-[#1F2937] mt-3">
            {summary}
          </p>
        </div>
      )}

      {/* Professional Skills Section - Two Column Grid */}
      {skills.length > 0 && skills.some(s => s.name) && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1E40AF] uppercase tracking-wider mb-2 pb-2 border-b-2 border-[#0891B2]">
            {skillsLabel || 'Professional Skills'}
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3">
            {skills.filter(s => s.name).map(skill => (
              <div key={skill.id} className="flex items-center">
                <span className="text-[#0891B2] mr-2">•</span>
                <span className="text-sm text-[#1F2937]">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience Section */}
      {experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1E40AF] uppercase tracking-wider mb-2 pb-2 border-b-2 border-[#0891B2]">
            Work Experience
          </h2>
          <div className="mt-4 space-y-6">
            {experience.map((exp, index) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-base font-bold text-[#1F2937]">
                    {exp.jobTitle}
                  </h3>
                  <span className="text-xs text-gray-600 whitespace-nowrap ml-4">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <p className="text-sm font-semibold text-[#0891B2]">
                    {exp.company}
                  </p>
                  <p className="text-xs text-gray-600 ml-4">
                    {exp.location}
                  </p>
                </div>
                <ul className="list-disc list-outside ml-5 text-sm space-y-1.5 text-[#1F2937]">
                  {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                    <li key={i} className="leading-relaxed">
                      {line.replace(/^[-•]\s*/, '')}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1E40AF] uppercase tracking-wider mb-2 pb-2 border-b-2 border-[#0891B2]">
            Education
          </h2>
          <div className="mt-4 space-y-4">
            {education.map(edu => (
              <div key={edu.id}>
                <h3 className="text-base font-bold text-[#1F2937]">
                  {edu.degree}
                </h3>
                <p className="text-sm text-[#0891B2] mt-1">
                  {edu.institution}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {edu.gradDate} {edu.location && `• ${edu.location}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1E40AF] uppercase tracking-wider mb-2 pb-2 border-b-2 border-[#0891B2]">
            Certifications
          </h2>
          <div className="mt-4 space-y-4">
            {certifications.filter(c => c.name).map(cert => (
              <div key={cert.id}>
                <h3 className="text-base font-bold text-[#1F2937]">
                  {cert.name}
                </h3>
                <p className="text-sm text-[#0891B2] mt-1">
                  {cert.issuer}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {cert.date}
                  {cert.credentialId && ` • Credential ID: ${cert.credentialId}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && customSections.some(s => s.title) && (
        <>
          {customSections
            .filter(s => s.title)
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <div key={section.id} className="mb-8">
                <h2 className="text-lg font-bold text-[#1E40AF] uppercase tracking-wider mb-2 pb-2 border-b-2 border-[#0891B2]">
                  {section.title}
                </h2>
                <div className="mt-3 text-sm text-[#1F2937] leading-relaxed">
                  {section.content.split('\n').filter(line => line.trim()).map((line, i) => {
                    const cleanLine = line.trim();
                    if (cleanLine.startsWith('-') || cleanLine.startsWith('•')) {
                      return (
                        <div key={i} className="flex items-start mb-1">
                          <span className="text-[#0891B2] mr-2">•</span>
                          <span>{cleanLine.replace(/^[-•]\s*/, '')}</span>
                        </div>
                      );
                    }
                    return <p key={i} className="mb-2">{cleanLine}</p>;
                  })}
                </div>
              </div>
            ))}
        </>
      )}

      {/* References Section */}
      {references && references.length > 0 && references.some(r => r.name) && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1E40AF] uppercase tracking-wider mb-2 pb-2 border-b-2 border-[#0891B2]">
            References
          </h2>
          <div className="mt-4 space-y-4">
            {references.filter(r => r.name).map(ref => (
              <div key={ref.id}>
                <h3 className="text-base font-bold text-[#1F2937]">
                  {ref.name}
                </h3>
                <p className="text-sm text-[#0891B2] mt-1">
                  {ref.title} at {ref.company}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Relationship: {ref.relationship}
                </p>
                {(ref.phone || ref.email) && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {ref.phone && `Phone: ${ref.phone}`}
                    {ref.phone && ref.email && ' • '}
                    {ref.email && `Email: ${ref.email}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watermark */}
      {showWatermark && (
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-400">
            Built with Career Hub AI - <span className="font-semibold text-gray-500">Get Premium</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfessionalTemplate;
