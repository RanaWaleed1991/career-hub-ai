import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

  // Color palette
  const colors = {
    beigeBackground: '#D4C5A9',
    darkBeigeBox: '#C9B991',
    creamPage: '#F5EFE0',
    brownHeader: '#7A6A4F',
    blackText: '#000000',
    stripePattern: '#F0E8D5',
  };

  // Diagonal stripe pattern for right column
  const diagonalStripeStyle = {
    backgroundImage: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 20px,
      ${colors.stripePattern} 20px,
      ${colors.stripePattern} 22px
    )`,
  };

  return (
    <div
      className="min-h-full"
      style={{
        fontFamily: "'Georgia', 'Times New Roman', 'Playfair Display', serif",
        backgroundColor: colors.creamPage,
        padding: '30px',
      }}
    >
      {/* HEADER SECTION - Full Width */}
      <div
        className="relative mb-8"
        style={{
          backgroundColor: colors.creamPage,
          borderRadius: '0 0 40px 0',
          paddingBottom: '32px',
        }}
      >
        <div className="flex justify-between items-start gap-8">
          {/* Left side: Name, Title, Summary */}
          <div className="flex-1" style={{ maxWidth: '65%' }}>
            {/* Name */}
            <h1
              className="font-bold mb-2"
              style={{
                fontSize: '52px',
                color: colors.blackText,
                lineHeight: '1.1',
                letterSpacing: '0.5px',
              }}
            >
              {personalDetails.fullName}
            </h1>

            {/* Job Title with underline */}
            <div className="mb-4">
              <h2
                className="font-medium mb-1"
                style={{
                  fontSize: '28px',
                  color: colors.blackText,
                  lineHeight: '1.2',
                }}
              >
                {personalDetails.jobTitle}
              </h2>
              <div
                style={{
                  width: '120px',
                  height: '3px',
                  backgroundColor: colors.blackText,
                }}
              />
            </div>

            {/* Summary/Profile */}
            {summary && (
              <p
                style={{
                  fontSize: '14px',
                  color: colors.blackText,
                  lineHeight: '1.7',
                  marginTop: '16px',
                }}
              >
                {summary}
              </p>
            )}
          </div>

          {/* Right side: Photo (if provided) */}
          {personalDetails.photoUrl && (
            <div
              style={{
                width: '200px',
                height: '250px',
                borderRadius: '12px',
                overflow: 'hidden',
                flexShrink: 0,
                border: `2px solid ${colors.darkBeigeBox}`,
              }}
            >
              <img
                src={personalDetails.photoUrl}
                alt={personalDetails.fullName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
        </div>

        {/* Decorative curved element */}
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            right: '0',
            width: '200px',
            height: '40px',
            backgroundColor: colors.beigeBackground,
            borderRadius: '40px 0 0 0',
          }}
        />
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="flex gap-10">
        {/* LEFT COLUMN - 35% */}
        <div style={{ width: '35%' }}>
          {/* CONTACT Section */}
          {(personalDetails.phone || personalDetails.email || personalDetails.address || personalDetails.linkedin || personalDetails.website) && (
            <div
              className="mb-6"
              style={{
                backgroundColor: colors.darkBeigeBox,
                borderRadius: '24px',
                padding: '24px',
              }}
            >
              <h3
                className="font-bold uppercase mb-4"
                style={{
                  fontSize: '30px',
                  color: colors.brownHeader,
                }}
              >
                Contact
              </h3>
              <div className="space-y-3">
                {personalDetails.phone && (
                  <div className="flex items-start gap-2">
                    <span style={{ fontSize: '14px', color: colors.brownHeader }}>📞</span>
                    <span style={{ fontSize: '14px', color: colors.blackText }}>
                      {personalDetails.phone}
                    </span>
                  </div>
                )}
                {personalDetails.email && (
                  <div className="flex items-start gap-2">
                    <span style={{ fontSize: '14px', color: colors.brownHeader }}>✉️</span>
                    <span
                      style={{
                        fontSize: '14px',
                        color: colors.blackText,
                        wordBreak: 'break-word',
                      }}
                    >
                      {personalDetails.email}
                    </span>
                  </div>
                )}
                {personalDetails.address && (
                  <div className="flex items-start gap-2">
                    <span style={{ fontSize: '14px', color: colors.brownHeader }}>📍</span>
                    <span style={{ fontSize: '14px', color: colors.blackText }}>
                      {personalDetails.address}
                    </span>
                  </div>
                )}
                {personalDetails.linkedin && (
                  <div className="flex items-start gap-2">
                    <span style={{ fontSize: '14px', color: colors.brownHeader }}>🔗</span>
                    <a
                      href={personalDetails.linkedin}
                      style={{
                        fontSize: '14px',
                        color: colors.blackText,
                        textDecoration: 'underline',
                        wordBreak: 'break-all',
                      }}
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
                {personalDetails.website && (
                  <div className="flex items-start gap-2">
                    <span style={{ fontSize: '14px', color: colors.brownHeader }}>🌐</span>
                    <a
                      href={personalDetails.website}
                      style={{
                        fontSize: '14px',
                        color: colors.blackText,
                        textDecoration: 'underline',
                        wordBreak: 'break-all',
                      }}
                    >
                      {personalDetails.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EDUCATION Section */}
          {education.length > 0 && education.some(e => e.degree) && (
            <div
              className="mb-6"
              style={{
                backgroundColor: colors.darkBeigeBox,
                borderRadius: '24px',
                padding: '24px',
              }}
            >
              <h3
                className="font-bold uppercase mb-4"
                style={{
                  fontSize: '30px',
                  color: colors.brownHeader,
                }}
              >
                Education
              </h3>
              {education.filter(e => e.degree).map((edu) => (
                <div key={edu.id} className="mb-4 last:mb-0">
                  <p
                    className="font-bold"
                    style={{
                      fontSize: '16px',
                      color: colors.blackText,
                      marginBottom: '4px',
                    }}
                  >
                    {edu.degree}
                  </p>
                  {edu.gradDate && (
                    <p
                      style={{
                        fontSize: '14px',
                        color: colors.blackText,
                        marginBottom: '4px',
                      }}
                    >
                      ({edu.gradDate})
                    </p>
                  )}
                  {edu.institution && (
                    <p
                      style={{
                        fontSize: '14px',
                        color: colors.blackText,
                      }}
                    >
                      {edu.institution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SKILLS Section */}
          {skills.length > 0 && skills.some(s => s.name) && (
            <div
              className="mb-6"
              style={{
                backgroundColor: colors.darkBeigeBox,
                borderRadius: '24px',
                padding: '24px',
              }}
            >
              <h3
                className="font-bold uppercase mb-4"
                style={{
                  fontSize: '30px',
                  color: colors.brownHeader,
                }}
              >
                {skillsLabel || 'Skills'}
              </h3>
              <ul className="space-y-2">
                {skills.filter(s => s.name).map((skill) => (
                  <li
                    key={skill.id}
                    style={{
                      fontSize: '14px',
                      color: colors.blackText,
                      lineHeight: '1.8',
                      paddingLeft: '8px',
                    }}
                  >
                    • {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CERTIFICATIONS Section */}
          {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
            <div
              className="mb-6"
              style={{
                backgroundColor: colors.darkBeigeBox,
                borderRadius: '24px',
                padding: '24px',
              }}
            >
              <h3
                className="font-bold uppercase mb-4"
                style={{
                  fontSize: '30px',
                  color: colors.brownHeader,
                }}
              >
                Certification
              </h3>
              <ul className="space-y-2">
                {certifications.filter(c => c.name).map((cert) => (
                  <li
                    key={cert.id}
                    style={{
                      fontSize: '14px',
                      color: colors.blackText,
                      lineHeight: '1.8',
                      paddingLeft: '8px',
                    }}
                  >
                    • {cert.name}
                    {cert.issuer && ` - ${cert.issuer}`}
                    {cert.date && ` (${cert.date})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* REFERENCES Section */}
          {references && references.length > 0 && references.some(r => r.name) && (
            <div
              style={{
                backgroundColor: colors.darkBeigeBox,
                borderRadius: '24px',
                padding: '24px',
              }}
            >
              <h3
                className="font-bold uppercase mb-4"
                style={{
                  fontSize: '30px',
                  color: colors.brownHeader,
                }}
              >
                References
              </h3>
              {references.filter(r => r.name).map((ref) => (
                <div key={ref.id} className="mb-4 last:mb-0">
                  <p
                    className="font-bold"
                    style={{
                      fontSize: '14px',
                      color: colors.blackText,
                      marginBottom: '2px',
                    }}
                  >
                    {ref.name}
                  </p>
                  {ref.title && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: colors.blackText,
                        marginBottom: '2px',
                      }}
                    >
                      {ref.title}
                    </p>
                  )}
                  {ref.company && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: colors.blackText,
                        marginBottom: '2px',
                      }}
                    >
                      {ref.company}
                    </p>
                  )}
                  {ref.phone && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: colors.blackText,
                      }}
                    >
                      {ref.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - 65% */}
        <div
          style={{
            width: '65%',
            ...diagonalStripeStyle,
            padding: '24px',
            borderRadius: '12px',
          }}
        >
          {/* PROFESSIONAL EXPERIENCE Section */}
          {experience.length > 0 && experience.some(e => e.jobTitle) && (
            <div className="mb-8">
              <h2
                className="font-bold uppercase mb-5"
                style={{
                  fontSize: '36px',
                  color: colors.brownHeader,
                }}
              >
                Professional Experience
              </h2>
              {experience.filter(e => e.jobTitle).map((exp, index) => (
                <div
                  key={exp.id}
                  className={index > 0 ? 'mt-6' : ''}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    padding: '16px',
                    borderRadius: '8px',
                  }}
                >
                  {/* Job Title */}
                  <h3
                    className="font-bold"
                    style={{
                      fontSize: '20px',
                      color: colors.blackText,
                      marginBottom: '4px',
                    }}
                  >
                    {exp.jobTitle}
                  </h3>

                  {/* Date range */}
                  {(exp.startDate || exp.endDate) && (
                    <p
                      style={{
                        fontSize: '16px',
                        color: colors.blackText,
                        marginBottom: '4px',
                      }}
                    >
                      ({exp.startDate} - {exp.endDate})
                    </p>
                  )}

                  {/* Company name */}
                  {exp.company && (
                    <p
                      className="italic"
                      style={{
                        fontSize: '16px',
                        color: colors.blackText,
                        marginBottom: '12px',
                      }}
                    >
                      {exp.company}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                  )}

                  {/* Responsibilities with diamond bullets */}
                  {exp.description && (
                    <div style={{ paddingLeft: '24px' }}>
                      {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 mb-2"
                        >
                          <span
                            style={{
                              color: colors.brownHeader,
                              fontSize: '14px',
                              marginTop: '2px',
                            }}
                          >
                            ◆
                          </span>
                          <span
                            style={{
                              fontSize: '14px',
                              color: colors.blackText,
                              lineHeight: '1.6',
                              flex: 1,
                            }}
                          >
                            {line.replace(/^[-•]\s*/, '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CUSTOM SECTIONS */}
          {customSections && customSections.length > 0 && customSections.some(s => s.title) && (
            <>
              {customSections
                .filter(s => s.title)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div key={section.id} className="mb-8">
                    <h2
                      className="font-bold uppercase mb-5"
                      style={{
                        fontSize: '36px',
                        color: colors.brownHeader,
                      }}
                    >
                      {section.title}
                    </h2>
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        padding: '16px',
                        borderRadius: '8px',
                      }}
                    >
                      {section.content.split('\n').filter(line => line.trim()).map((line, i) => {
                        const cleanLine = line.trim();
                        if (cleanLine.startsWith('-') || cleanLine.startsWith('•')) {
                          return (
                            <div key={i} className="flex items-start gap-2 mb-2" style={{ paddingLeft: '24px' }}>
                              <span style={{ color: colors.brownHeader, fontSize: '14px', marginTop: '2px' }}>◆</span>
                              <span style={{ fontSize: '14px', color: colors.blackText, lineHeight: '1.6', flex: 1 }}>
                                {cleanLine.replace(/^[-•]\s*/, '')}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <p key={i} style={{ fontSize: '14px', color: colors.blackText, lineHeight: '1.6', marginBottom: '8px' }}>
                            {cleanLine}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </>
          )}

          {/* Watermark */}
          {showWatermark && (
            <div
              className="mt-8 pt-4"
              style={{
                borderTop: `1px solid ${colors.darkBeigeBox}`,
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '11px', color: colors.brownHeader }}>
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
