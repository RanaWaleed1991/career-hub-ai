import React from 'react';
import type { ResumeData } from '../types';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '../components/icons';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

  // Split name into first and last for two-tone effect
  const nameParts = personalDetails.fullName.trim().split(' ');
  const firstName = nameParts.slice(0, -1).join(' ');
  const lastName = nameParts[nameParts.length - 1];

  // Diamond icon component
  const DiamondIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0L12 8L8 16L4 8L8 0Z" />
    </svg>
  );

  return (
    <div className="bg-white font-sans text-gray-800 min-h-full">
      {/* Header Section */}
      <div className="bg-gray-100 text-center py-8 px-12">
        {/* Name - Two-tone */}
        <h1 className="text-5xl font-bold tracking-wide">
          <span className="text-gray-500">{firstName} </span>
          <span className="text-[#1E3A8A]">{lastName.toUpperCase()}</span>
        </h1>
        {/* Job Title */}
        <p className="text-sm font-semibold tracking-[0.3em] mt-2 uppercase">
          {personalDetails.jobTitle}
        </p>
      </div>

      {/* Contact Bar with Diamond Icons */}
      <div className="flex justify-center items-center gap-8 py-4 px-12 text-sm border-b border-gray-200">
        {personalDetails.phone && (
          <div className="flex items-center gap-2">
            <DiamondIcon className="text-[#1E3A8A] flex-shrink-0" />
            <span>{personalDetails.phone}</span>
          </div>
        )}
        {personalDetails.email && (
          <div className="flex items-center gap-2">
            <DiamondIcon className="text-[#1E3A8A] flex-shrink-0" />
            <span>{personalDetails.email}</span>
          </div>
        )}
        {personalDetails.address && (
          <div className="flex items-center gap-2">
            <DiamondIcon className="text-[#1E3A8A] flex-shrink-0" />
            <span>{personalDetails.address}</span>
          </div>
        )}
        {personalDetails.linkedin && (
          <div className="flex items-center gap-2">
            <DiamondIcon className="text-[#1E3A8A] flex-shrink-0" />
            <a href={personalDetails.linkedin} className="hover:underline">LinkedIn</a>
          </div>
        )}
      </div>

      {/* Profile Section */}
      {summary && (
        <div className="px-12 py-6 border-b border-gray-200">
          <h2 className="text-base font-bold text-[#1E3A8A] uppercase tracking-wider mb-3">
            Profile
          </h2>
          <p className="text-sm leading-relaxed text-justify">
            {summary}
          </p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex px-12 py-6 gap-12">
        {/* Left Column - Professional Experience */}
        <div className="w-3/5">
          {experience.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">
                Professional
              </h2>

              {experience.map(exp => (
                <div key={exp.id} className="mb-6">
                  <div className="mb-1">
                    <span className="font-bold text-sm">{exp.jobTitle}</span>
                    {exp.startDate && (
                      <span className="text-sm italic ml-2">
                        ({exp.startDate} – {exp.endDate})
                      </span>
                    )}
                  </div>
                  <div className="text-sm italic mb-2">
                    {exp.company}{exp.location && ` – ${exp.location}`}
                  </div>
                  {exp.description && (
                    <ul className="space-y-1.5">
                      {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                        <li key={i} className="text-sm flex items-start">
                          <span className="mr-2 mt-1.5">•</span>
                          <span className="flex-1">{line.replace(/^[-•]\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications in left column if space */}
          {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
            <div className="mt-8">
              <h2 className="text-base font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">
                Certifications
              </h2>
              {certifications.filter(c => c.name).map(cert => (
                <div key={cert.id} className="mb-3">
                  <div className="font-bold text-sm">{cert.name}</div>
                  <div className="text-sm italic">{cert.issuer}</div>
                  <div className="text-xs text-gray-600">{cert.date}</div>
                  {cert.credentialId && (
                    <div className="text-xs text-gray-500">Credential ID: {cert.credentialId}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Education & Skills */}
        <div className="w-2/5">
          {/* Education */}
          {education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">
                Education
              </h2>
              {education.map(edu => (
                <div key={edu.id} className="mb-4">
                  <div className="font-bold text-sm">{edu.degree}</div>
                  <div className="text-sm italic">
                    {edu.gradDate && `Graduated ${edu.gradDate}`}
                  </div>
                  <div className="text-sm italic text-gray-700 uppercase tracking-wide mt-1">
                    {edu.institution}
                  </div>
                  {edu.location && (
                    <div className="text-xs text-gray-600 italic">{edu.location}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills with Progress Bars */}
          {skills.length > 0 && skills.some(s => s.name) && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">
                {skillsLabel || 'Key Skills'}
              </h2>
              <div className="space-y-3">
                {skills.filter(s => s.name).map(skill => (
                  <div key={skill.id}>
                    <div className="text-sm mb-1">{skill.name}</div>
                    {/* Navy blue progress bar */}
                    <div className="flex gap-1">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className="h-2 w-full bg-[#1E3A8A]"
                          style={{ opacity: i < 6 ? 1 : 0.3 }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {references && references.length > 0 && references.some(r => r.name) && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">
                References
              </h2>
              {references.filter(r => r.name).map(ref => (
                <div key={ref.id} className="mb-3 text-sm">
                  <div className="font-bold">{ref.name}</div>
                  <div className="italic">{ref.title}</div>
                  <div className="italic">{ref.company}</div>
                  <div className="text-xs text-gray-600">{ref.relationship}</div>
                  {ref.phone && <div className="text-xs">{ref.phone}</div>}
                  {ref.email && <div className="text-xs break-words">{ref.email}</div>}
                </div>
              ))}
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
                    <h2 className="text-base font-bold text-[#1E3A8A] uppercase tracking-wider mb-4">
                      {section.title}
                    </h2>
                    <div className="text-sm space-y-1">
                      {section.content.split('\n').filter(line => line.trim()).map((line, i) => {
                        const cleanLine = line.trim();
                        if (cleanLine.startsWith('-') || cleanLine.startsWith('•')) {
                          return (
                            <div key={i} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{cleanLine.replace(/^[-•]\s*/, '')}</span>
                            </div>
                          );
                        }
                        return <p key={i}>{cleanLine}</p>;
                      })}
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>

      {/* Watermark */}
      {showWatermark && (
        <div className="mt-8 pt-4 px-12 border-t border-gray-200">
          <p className="text-xs text-center text-gray-400">
            Built with Career Hub AI - <span className="font-semibold text-gray-500">Get Premium</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfessionalTemplate;
