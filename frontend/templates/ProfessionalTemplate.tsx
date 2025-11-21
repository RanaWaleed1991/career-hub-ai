import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

  // Diamond/Chevron icon component
  const DiamondIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2L13 8L8 14L3 8L8 2Z" />
    </svg>
  );

  // Skill bar component with percentage
  const SkillBar: React.FC<{ name: string; level?: number }> = ({ name, level = 85 }) => (
    <div className="mb-3">
      <div className="text-xs mb-1.5" style={{ color: '#2C3E50' }}>{name}</div>
      <div className="w-full h-2 rounded" style={{ backgroundColor: '#E0E0E0' }}>
        <div
          className="h-full rounded"
          style={{
            backgroundColor: '#3B5998',
            width: `${level}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white font-sans min-h-full" style={{ fontFamily: "'Segoe UI', 'Roboto', 'Open Sans', -apple-system, sans-serif" }}>
      {/* Header - Full Width, Centered */}
      <div className="text-center px-10 pt-10 pb-6 border-b" style={{ borderColor: '#E0E0E0' }}>
        <h1
          className="font-bold uppercase mb-2"
          style={{
            fontSize: '38px',
            color: '#2C3E50',
            letterSpacing: '2px',
            lineHeight: '1.2'
          }}
        >
          {personalDetails.fullName}
        </h1>
        <p
          className="uppercase"
          style={{
            fontSize: '14px',
            color: '#5A6C7D',
            letterSpacing: '1px'
          }}
        >
          {personalDetails.jobTitle}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="flex">
        {/* LEFT SIDEBAR - 30% */}
        <div className="w-[30%] px-8 py-8" style={{ backgroundColor: '#F8F9FA' }}>
          {/* Contact Information */}
          <div className="mb-8">
            <h2
              className="font-bold uppercase mb-4 pb-2 border-b"
              style={{
                fontSize: '14px',
                color: '#2C3E50',
                letterSpacing: '1px',
                borderColor: '#E0E0E0'
              }}
            >
              Contact
            </h2>
            <div className="space-y-4">
              {personalDetails.phone && (
                <div className="flex items-start gap-2">
                  <DiamondIcon className="flex-shrink-0 mt-0.5" style={{ color: '#3B5998' }} />
                  <span style={{ fontSize: '11px', color: '#2C3E50', lineHeight: '1.4' }}>
                    {personalDetails.phone}
                  </span>
                </div>
              )}
              {personalDetails.email && (
                <div className="flex items-start gap-2">
                  <DiamondIcon className="flex-shrink-0 mt-0.5" style={{ color: '#3B5998' }} />
                  <span style={{ fontSize: '11px', color: '#2C3E50', lineHeight: '1.4', wordBreak: 'break-word' }}>
                    {personalDetails.email}
                  </span>
                </div>
              )}
              {personalDetails.address && (
                <div className="flex items-start gap-2">
                  <DiamondIcon className="flex-shrink-0 mt-0.5" style={{ color: '#3B5998' }} />
                  <span style={{ fontSize: '11px', color: '#2C3E50', lineHeight: '1.4' }}>
                    {personalDetails.address}
                  </span>
                </div>
              )}
              {personalDetails.linkedin && (
                <div className="flex items-start gap-2">
                  <DiamondIcon className="flex-shrink-0 mt-0.5" style={{ color: '#3B5998' }} />
                  <a
                    href={personalDetails.linkedin}
                    style={{ fontSize: '11px', color: '#3B5998', lineHeight: '1.4', wordBreak: 'break-all' }}
                    className="hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {personalDetails.website && (
                <div className="flex items-start gap-2">
                  <DiamondIcon className="flex-shrink-0 mt-0.5" style={{ color: '#3B5998' }} />
                  <a
                    href={personalDetails.website}
                    style={{ fontSize: '11px', color: '#3B5998', lineHeight: '1.4', wordBreak: 'break-all' }}
                    className="hover:underline"
                  >
                    {personalDetails.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Key Skills with Progress Bars */}
          {skills.length > 0 && skills.some(s => s.name) && (
            <div className="mb-8">
              <h2
                className="font-bold uppercase mb-4 pb-2 border-b"
                style={{
                  fontSize: '14px',
                  color: '#2C3E50',
                  letterSpacing: '1px',
                  borderColor: '#E0E0E0'
                }}
              >
                {skillsLabel || 'Key Skills'}
              </h2>
              <div>
                {skills.filter(s => s.name).map(skill => (
                  <SkillBar key={skill.id} name={skill.name} level={85} />
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
            <div className="mb-8">
              <h2
                className="font-bold uppercase mb-4 pb-2 border-b"
                style={{
                  fontSize: '14px',
                  color: '#2C3E50',
                  letterSpacing: '1px',
                  borderColor: '#E0E0E0'
                }}
              >
                Certifications
              </h2>
              {certifications.filter(c => c.name).map(cert => (
                <div key={cert.id} className="mb-3">
                  <p className="font-bold" style={{ fontSize: '11px', color: '#2C3E50', marginBottom: '2px' }}>
                    {cert.name}
                  </p>
                  <p style={{ fontSize: '10px', color: '#5A6C7D', marginBottom: '2px' }}>
                    {cert.issuer}
                  </p>
                  <p style={{ fontSize: '10px', color: '#7A8C9D' }}>
                    {cert.date}
                  </p>
                  {cert.credentialId && (
                    <p style={{ fontSize: '9px', color: '#7A8C9D' }}>
                      ID: {cert.credentialId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* References */}
          {references && references.length > 0 && references.some(r => r.name) && (
            <div className="mb-8">
              <h2
                className="font-bold uppercase mb-4 pb-2 border-b"
                style={{
                  fontSize: '14px',
                  color: '#2C3E50',
                  letterSpacing: '1px',
                  borderColor: '#E0E0E0'
                }}
              >
                References
              </h2>
              {references.filter(r => r.name).map(ref => (
                <div key={ref.id} className="mb-3" style={{ fontSize: '10px' }}>
                  <p className="font-bold" style={{ color: '#2C3E50', marginBottom: '2px' }}>
                    {ref.name}
                  </p>
                  <p style={{ color: '#5A6C7D', marginBottom: '1px' }}>
                    {ref.title}
                  </p>
                  <p style={{ color: '#5A6C7D', marginBottom: '1px' }}>
                    {ref.company}
                  </p>
                  <p style={{ color: '#7A8C9D', fontSize: '9px', marginBottom: '2px' }}>
                    {ref.relationship}
                  </p>
                  {ref.phone && (
                    <p style={{ color: '#7A8C9D', fontSize: '9px' }}>
                      {ref.phone}
                    </p>
                  )}
                  {ref.email && (
                    <p style={{ color: '#7A8C9D', fontSize: '9px', wordBreak: 'break-word' }}>
                      {ref.email}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT MAIN CONTENT - 70% */}
        <div className="w-[70%] px-10 py-8">
          {/* Profile/Summary Section */}
          {summary && (
            <div className="mb-7">
              <h2
                className="font-bold uppercase mb-3"
                style={{
                  fontSize: '16px',
                  color: '#2C3E50',
                  letterSpacing: '2px'
                }}
              >
                Profile
              </h2>
              <p style={{ fontSize: '11px', color: '#2C3E50', lineHeight: '1.6', textAlign: 'justify' }}>
                {summary}
              </p>
            </div>
          )}

          {/* Professional Experience Section */}
          {experience.length > 0 && (
            <div className="mb-7">
              <h2
                className="font-bold uppercase mb-4"
                style={{
                  fontSize: '16px',
                  color: '#2C3E50',
                  letterSpacing: '2px'
                }}
              >
                Professional Experience
              </h2>
              {experience.map((exp, index) => (
                <div key={exp.id} className={index > 0 ? 'mt-5' : ''}>
                  <div className="mb-1">
                    <span className="font-bold" style={{ fontSize: '13px', color: '#2C3E50' }}>
                      {exp.jobTitle}
                    </span>
                  </div>
                  <div className="mb-1" style={{ fontSize: '12px', fontStyle: 'italic', color: '#5A6C7D' }}>
                    {exp.company}
                    {exp.location && ` • ${exp.location}`}
                  </div>
                  <div className="mb-2" style={{ fontSize: '11px', fontStyle: 'italic', color: '#7A8C9D' }}>
                    ({exp.startDate} – {exp.endDate})
                  </div>
                  {exp.description && (
                    <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                      {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                        <li
                          key={i}
                          style={{
                            fontSize: '11px',
                            color: '#2C3E50',
                            lineHeight: '1.5',
                            marginBottom: '6px'
                          }}
                        >
                          {line.replace(/^[-•]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <div className="mb-7">
              <h2
                className="font-bold uppercase mb-4"
                style={{
                  fontSize: '16px',
                  color: '#2C3E50',
                  letterSpacing: '2px'
                }}
              >
                Education
              </h2>
              {education.map(edu => (
                <div key={edu.id} className="mb-3">
                  <p className="font-bold" style={{ fontSize: '13px', color: '#2C3E50', marginBottom: '4px' }}>
                    {edu.degree}
                  </p>
                  <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#7A8C9D', marginBottom: '2px' }}>
                    ({edu.gradDate})
                  </p>
                  <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#5A6C7D', marginBottom: '2px' }}>
                    {edu.institution}
                  </p>
                  {edu.location && (
                    <p style={{ fontSize: '11px', color: '#7A8C9D' }}>
                      {edu.location}
                    </p>
                  )}
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
                  <div key={section.id} className="mb-7">
                    <h2
                      className="font-bold uppercase mb-4"
                      style={{
                        fontSize: '16px',
                        color: '#2C3E50',
                        letterSpacing: '2px'
                      }}
                    >
                      {section.title}
                    </h2>
                    <div style={{ fontSize: '11px', color: '#2C3E50', lineHeight: '1.5' }}>
                      {section.content.split('\n').filter(line => line.trim()).map((line, i) => {
                        const cleanLine = line.trim();
                        if (cleanLine.startsWith('-') || cleanLine.startsWith('•')) {
                          return (
                            <div key={i} className="flex items-start mb-1" style={{ paddingLeft: '20px' }}>
                              <span style={{ marginRight: '8px' }}>•</span>
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

          {/* Watermark */}
          {showWatermark && (
            <div className="mt-8 pt-4 border-t" style={{ borderColor: '#E0E0E0' }}>
              <p className="text-center" style={{ fontSize: '10px', color: '#7A8C9D' }}>
                Built with Career Hub AI - <span className="font-semibold">Get Premium</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTemplate;
