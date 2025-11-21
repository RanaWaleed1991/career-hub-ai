import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ElegantTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

  // Professional color palette
  const colors = {
    accent: '#2563EB', // Professional blue
    darkText: '#1F2937', // Dark gray
    mediumText: '#4B5563', // Medium gray
    lightText: '#6B7280', // Light gray
    border: '#E5E7EB', // Light border
    background: '#FFFFFF', // White
  };

  return (
    <div
      className="min-h-full"
      style={{
        fontFamily: "'Calibri', 'Arial', 'Helvetica', sans-serif",
        backgroundColor: colors.background,
        color: colors.darkText,
        padding: '48px 56px',
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      {/* Header Section */}
      <header className="mb-8 pb-6" style={{ borderBottom: `3px solid ${colors.accent}` }}>
        {/* Name */}
        <h1
          className="font-bold mb-2"
          style={{
            fontSize: '36px',
            color: colors.darkText,
            letterSpacing: '0.5px',
            lineHeight: '1.2',
            marginBottom: '8px',
          }}
        >
          {personalDetails.fullName}
        </h1>

        {/* Job Title */}
        {personalDetails.jobTitle && (
          <h2
            className="font-medium mb-4"
            style={{
              fontSize: '18px',
              color: colors.accent,
              letterSpacing: '0.3px',
              lineHeight: '1.3',
            }}
          >
            {personalDetails.jobTitle}
          </h2>
        )}

        {/* Contact Information - Inline */}
        <div
          className="flex flex-wrap gap-4"
          style={{
            fontSize: '11px',
            color: colors.mediumText,
            lineHeight: '1.5',
          }}
        >
          {personalDetails.email && (
            <div className="flex items-center gap-1">
              <span>📧</span>
              <span>{personalDetails.email}</span>
            </div>
          )}
          {personalDetails.phone && (
            <div className="flex items-center gap-1">
              <span>📱</span>
              <span>{personalDetails.phone}</span>
            </div>
          )}
          {personalDetails.address && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{personalDetails.address}</span>
            </div>
          )}
          {personalDetails.linkedin && (
            <div className="flex items-center gap-1">
              <span>🔗</span>
              <a
                href={personalDetails.linkedin}
                style={{ color: colors.accent, textDecoration: 'none' }}
              >
                LinkedIn
              </a>
            </div>
          )}
          {personalDetails.website && (
            <div className="flex items-center gap-1">
              <span>🌐</span>
              <a
                href={personalDetails.website}
                style={{ color: colors.accent, textDecoration: 'none' }}
              >
                {personalDetails.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {summary && (
        <section className="mb-7">
          <h3
            className="font-bold uppercase mb-3"
            style={{
              fontSize: '14px',
              color: colors.accent,
              letterSpacing: '1px',
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: '6px',
            }}
          >
            Professional Summary
          </h3>
          <p
            style={{
              fontSize: '11px',
              color: colors.darkText,
              lineHeight: '1.7',
              textAlign: 'justify',
            }}
          >
            {summary}
          </p>
        </section>
      )}

      {/* Professional Experience */}
      {experience.length > 0 && experience.some(e => e.jobTitle) && (
        <section className="mb-7">
          <h3
            className="font-bold uppercase mb-3"
            style={{
              fontSize: '14px',
              color: colors.accent,
              letterSpacing: '1px',
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: '6px',
            }}
          >
            Professional Experience
          </h3>
          {experience.filter(e => e.jobTitle).map((exp, index) => (
            <div
              key={exp.id}
              className={index > 0 ? 'mt-5' : ''}
              style={{ paddingLeft: '4px' }}
            >
              {/* Job Title and Dates */}
              <div className="flex justify-between items-baseline mb-1">
                <h4
                  className="font-bold"
                  style={{
                    fontSize: '13px',
                    color: colors.darkText,
                    lineHeight: '1.3',
                  }}
                >
                  {exp.jobTitle}
                </h4>
                {(exp.startDate || exp.endDate) && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: colors.lightText,
                      whiteSpace: 'nowrap',
                      marginLeft: '12px',
                    }}
                  >
                    {exp.startDate} - {exp.endDate}
                  </span>
                )}
              </div>

              {/* Company and Location */}
              {exp.company && (
                <div
                  className="mb-2"
                  style={{
                    fontSize: '11px',
                    color: colors.mediumText,
                    fontStyle: 'italic',
                    lineHeight: '1.3',
                  }}
                >
                  {exp.company}
                  {exp.location && ` • ${exp.location}`}
                </div>
              )}

              {/* Job Description */}
              {exp.description && (
                <ul
                  style={{
                    paddingLeft: '20px',
                    marginTop: '8px',
                    listStyleType: 'disc',
                  }}
                >
                  {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: '11px',
                        color: colors.darkText,
                        lineHeight: '1.6',
                        marginBottom: '4px',
                      }}
                    >
                      {line.replace(/^[-•]\s*/, '')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && education.some(e => e.degree) && (
        <section className="mb-7">
          <h3
            className="font-bold uppercase mb-3"
            style={{
              fontSize: '14px',
              color: colors.accent,
              letterSpacing: '1px',
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: '6px',
            }}
          >
            Education
          </h3>
          {education.filter(e => e.degree).map((edu) => (
            <div
              key={edu.id}
              className="mb-3"
              style={{ paddingLeft: '4px' }}
            >
              {/* Degree and Date */}
              <div className="flex justify-between items-baseline mb-1">
                <h4
                  className="font-bold"
                  style={{
                    fontSize: '12px',
                    color: colors.darkText,
                    lineHeight: '1.3',
                  }}
                >
                  {edu.degree}
                </h4>
                {edu.gradDate && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: colors.lightText,
                      whiteSpace: 'nowrap',
                      marginLeft: '12px',
                    }}
                  >
                    {edu.gradDate}
                  </span>
                )}
              </div>

              {/* Institution and Location */}
              <div
                style={{
                  fontSize: '11px',
                  color: colors.mediumText,
                  fontStyle: 'italic',
                  lineHeight: '1.3',
                }}
              >
                {edu.institution}
                {edu.location && ` • ${edu.location}`}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && skills.some(s => s.name) && (
        <section className="mb-7">
          <h3
            className="font-bold uppercase mb-3"
            style={{
              fontSize: '14px',
              color: colors.accent,
              letterSpacing: '1px',
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: '6px',
            }}
          >
            {skillsLabel || 'Skills'}
          </h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 16px',
              paddingLeft: '4px',
            }}
          >
            {skills.filter(s => s.name).map((skill, index) => (
              <span
                key={skill.id}
                style={{
                  fontSize: '11px',
                  color: colors.darkText,
                  lineHeight: '1.5',
                }}
              >
                {skill.name}
                {index < skills.filter(s => s.name).length - 1 && ' •'}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
        <section className="mb-7">
          <h3
            className="font-bold uppercase mb-3"
            style={{
              fontSize: '14px',
              color: colors.accent,
              letterSpacing: '1px',
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: '6px',
            }}
          >
            Certifications
          </h3>
          {certifications.filter(c => c.name).map((cert) => (
            <div
              key={cert.id}
              className="mb-3"
              style={{ paddingLeft: '4px' }}
            >
              {/* Certification Name and Date */}
              <div className="flex justify-between items-baseline mb-1">
                <h4
                  className="font-bold"
                  style={{
                    fontSize: '12px',
                    color: colors.darkText,
                    lineHeight: '1.3',
                  }}
                >
                  {cert.name}
                </h4>
                {cert.date && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: colors.lightText,
                      whiteSpace: 'nowrap',
                      marginLeft: '12px',
                    }}
                  >
                    {cert.date}
                  </span>
                )}
              </div>

              {/* Issuer and Credential ID */}
              <div
                style={{
                  fontSize: '11px',
                  color: colors.mediumText,
                  fontStyle: 'italic',
                  lineHeight: '1.3',
                }}
              >
                {cert.issuer}
                {cert.credentialId && ` • ID: ${cert.credentialId}`}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* References */}
      {references && references.length > 0 && references.some(r => r.name) && (
        <section className="mb-7">
          <h3
            className="font-bold uppercase mb-3"
            style={{
              fontSize: '14px',
              color: colors.accent,
              letterSpacing: '1px',
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: '6px',
            }}
          >
            References
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              paddingLeft: '4px',
            }}
          >
            {references.filter(r => r.name).map((ref) => (
              <div key={ref.id}>
                <h4
                  className="font-bold"
                  style={{
                    fontSize: '11px',
                    color: colors.darkText,
                    marginBottom: '4px',
                    lineHeight: '1.3',
                  }}
                >
                  {ref.name}
                </h4>
                {ref.title && (
                  <p
                    style={{
                      fontSize: '10px',
                      color: colors.mediumText,
                      marginBottom: '2px',
                      lineHeight: '1.3',
                    }}
                  >
                    {ref.title}
                  </p>
                )}
                {ref.company && (
                  <p
                    style={{
                      fontSize: '10px',
                      color: colors.mediumText,
                      marginBottom: '4px',
                      lineHeight: '1.3',
                    }}
                  >
                    {ref.company}
                  </p>
                )}
                {ref.phone && (
                  <p
                    style={{
                      fontSize: '10px',
                      color: colors.lightText,
                      marginBottom: '2px',
                      lineHeight: '1.3',
                    }}
                  >
                    📱 {ref.phone}
                  </p>
                )}
                {ref.email && (
                  <p
                    style={{
                      fontSize: '10px',
                      color: colors.lightText,
                      wordBreak: 'break-word',
                      lineHeight: '1.3',
                    }}
                  >
                    📧 {ref.email}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && customSections.some(s => s.title) && (
        <>
          {customSections
            .filter(s => s.title)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <section key={section.id} className="mb-7">
                <h3
                  className="font-bold uppercase mb-3"
                  style={{
                    fontSize: '14px',
                    color: colors.accent,
                    letterSpacing: '1px',
                    borderBottom: `2px solid ${colors.border}`,
                    paddingBottom: '6px',
                  }}
                >
                  {section.title}
                </h3>
                <div style={{ paddingLeft: '4px' }}>
                  {section.content.split('\n').filter(line => line.trim()).map((line, i) => {
                    const cleanLine = line.trim();
                    if (cleanLine.startsWith('-') || cleanLine.startsWith('•')) {
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-2 mb-2"
                          style={{ paddingLeft: '16px' }}
                        >
                          <span
                            style={{
                              color: colors.mediumText,
                              fontSize: '11px',
                              marginTop: '1px',
                            }}
                          >
                            •
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              color: colors.darkText,
                              lineHeight: '1.6',
                              flex: 1,
                            }}
                          >
                            {cleanLine.replace(/^[-•]\s*/, '')}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <p
                        key={i}
                        style={{
                          fontSize: '11px',
                          color: colors.darkText,
                          lineHeight: '1.6',
                          marginBottom: '8px',
                        }}
                      >
                        {cleanLine}
                      </p>
                    );
                  })}
                </div>
              </section>
            ))}
        </>
      )}

      {/* Watermark */}
      {showWatermark && (
        <div
          className="mt-8 pt-4"
          style={{
            borderTop: `1px solid ${colors.border}`,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '10px', color: colors.lightText }}>
            Built with Career Hub AI - <span className="font-semibold">Get Premium</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ElegantTemplate;
