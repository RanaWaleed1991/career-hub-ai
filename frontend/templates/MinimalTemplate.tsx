import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const MinimalTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

  return (
    <div
      className="w-full h-full bg-white text-gray-900 font-sans leading-relaxed"
      style={{
        fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
        fontSize: '12px',
        padding: '32px 56px 56px 56px',
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      {/* Header Section */}
      <header
        className="flex flex-col items-center pb-8 mb-8"
        style={{
          borderBottom: '2px solid #1a1a1a',
        }}
      >
        <h1
          className="font-bold tracking-tight uppercase mb-2 text-center"
          style={{
            fontSize: '40px',
            lineHeight: '1.2',
            letterSpacing: '0.02em',
          }}
        >
          {personalDetails.fullName}
        </h1>

        {personalDetails.jobTitle && (
          <p
            className="uppercase text-gray-600 mb-4 text-center"
            style={{
              fontSize: '16px',
              letterSpacing: '0.2em',
              fontWeight: 500,
            }}
          >
            {personalDetails.jobTitle}
          </p>
        )}

        <div
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-gray-600"
          style={{
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {personalDetails.email && (
            <span>{personalDetails.email}</span>
          )}
          {personalDetails.phone && (
            <span>{personalDetails.phone}</span>
          )}
          {personalDetails.address && (
            <span>{personalDetails.address}</span>
          )}
          {personalDetails.linkedin && (
            <span className="break-all">{personalDetails.linkedin.replace(/^https?:\/\//, '')}</span>
          )}
          {personalDetails.website && (
            <span className="break-all">{personalDetails.website.replace(/^https?:\/\//, '')}</span>
          )}
        </div>
      </header>

      {/* Main Content - Single Column */}
      <div className="flex flex-col gap-8">
        {/* Professional Summary */}
        {summary && (
          <section>
            <h3
              className="font-bold uppercase tracking-widest pb-2 mb-3"
              style={{
                fontSize: '13px',
                borderBottom: '1px solid #d1d5db',
                color: '#1a1a1a',
              }}
            >
              Professional Summary
            </h3>
            <p
              className="text-justify text-gray-700"
              style={{
                fontSize: '12px',
                lineHeight: '1.75',
              }}
            >
              {summary}
            </p>
          </section>
        )}

        {/* Skills / Core Competencies */}
        {skills.length > 0 && skills.some(s => s.name) && (
          <section>
            <h3
              className="font-bold uppercase tracking-widest pb-2 mb-3"
              style={{
                fontSize: '13px',
                borderBottom: '1px solid #d1d5db',
                color: '#1a1a1a',
              }}
            >
              {skillsLabel || 'Core Competencies'}
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-700" style={{ fontSize: '12px' }}>
              {skills.filter(s => s.name).map((skill, index) => (
                <span key={skill.id}>
                  {skill.name}{index < skills.filter(s => s.name).length - 1 && ' •'}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {experience.length > 0 && experience.some(e => e.jobTitle) && (
          <section>
            <h3
              className="font-bold uppercase tracking-widest pb-2 mb-4"
              style={{
                fontSize: '13px',
                borderBottom: '1px solid #d1d5db',
                color: '#1a1a1a',
              }}
            >
              Experience
            </h3>
            <div className="flex flex-col gap-6">
              {experience.filter(e => e.jobTitle).map((exp) => (
                <div key={exp.id}>
                  {/* Job Title and Date */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h4
                      className="font-bold"
                      style={{
                        fontSize: '16px',
                        color: '#1a1a1a',
                      }}
                    >
                      {exp.jobTitle}
                    </h4>
                    {(exp.startDate || exp.endDate) && (
                      <span
                        className="font-medium text-gray-500"
                        style={{
                          fontSize: '12px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {exp.startDate} — {exp.endDate}
                      </span>
                    )}
                  </div>

                  {/* Company and Location */}
                  <div className="flex justify-between items-center mb-2">
                    {exp.company && (
                      <span
                        className="font-semibold text-gray-700"
                        style={{ fontSize: '12px' }}
                      >
                        {exp.company}
                      </span>
                    )}
                    {exp.location && (
                      <span
                        className="text-gray-500 uppercase tracking-wide"
                        style={{ fontSize: '11px' }}
                      >
                        {exp.location}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {exp.description && (
                    <div
                      className="text-gray-600"
                      style={{
                        fontSize: '12px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                        <p key={i} className="mb-1">
                          {line.replace(/^[-•]\s*/, '• ')}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
          <section>
            <h3
              className="font-bold uppercase tracking-widest pb-2 mb-4"
              style={{
                fontSize: '13px',
                borderBottom: '1px solid #d1d5db',
                color: '#1a1a1a',
              }}
            >
              Certifications
            </h3>
            <div className="flex flex-col gap-4">
              {certifications.filter(c => c.name).map((cert) => (
                <div
                  key={cert.id}
                  className="bg-gray-50 p-4 rounded-sm"
                  style={{
                    borderLeft: '4px solid #1a1a1a',
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4
                      className="font-bold flex items-center gap-2"
                      style={{
                        fontSize: '14px',
                        color: '#1a1a1a',
                      }}
                    >
                      {cert.name}
                    </h4>
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    {cert.issuer && (
                      <p className="text-gray-600 mb-1">{cert.issuer}</p>
                    )}
                    {cert.date && (
                      <p className="text-gray-500" style={{ fontSize: '11px' }}>
                        Issued: {cert.date}
                      </p>
                    )}
                    {cert.credentialId && (
                      <p className="text-gray-500" style={{ fontSize: '11px' }}>
                        ID: {cert.credentialId}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && education.some(e => e.degree) && (
          <section>
            <h3
              className="font-bold uppercase tracking-widest pb-2 mb-4"
              style={{
                fontSize: '13px',
                borderBottom: '1px solid #d1d5db',
                color: '#1a1a1a',
              }}
            >
              Education
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {education.filter(e => e.degree).map((edu) => (
                <div
                  key={edu.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-end"
                >
                  <div>
                    <h4
                      className="font-bold"
                      style={{
                        fontSize: '14px',
                        color: '#1a1a1a',
                      }}
                    >
                      {edu.institution}
                    </h4>
                    <div
                      className="text-gray-700"
                      style={{ fontSize: '12px' }}
                    >
                      {edu.degree}
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end mt-1 sm:mt-0">
                    {edu.gradDate && (
                      <div
                        className="font-medium text-gray-500"
                        style={{
                          fontSize: '12px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {edu.gradDate}
                      </div>
                    )}
                    {edu.location && (
                      <div
                        className="text-gray-400 uppercase"
                        style={{ fontSize: '11px' }}
                      >
                        {edu.location}
                      </div>
                    )}
                  </div>
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
                <section key={section.id}>
                  <h3
                    className="font-bold uppercase tracking-widest pb-2 mb-4"
                    style={{
                      fontSize: '13px',
                      borderBottom: '1px solid #d1d5db',
                      color: '#1a1a1a',
                    }}
                  >
                    {section.title}
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div
                      className="text-gray-600"
                      style={{
                        fontSize: '12px',
                        lineHeight: '1.6',
                      }}
                    >
                      {section.content.split('\n').filter(line => line.trim()).map((line, i) => {
                        const cleanLine = line.trim();
                        if (cleanLine.startsWith('-') || cleanLine.startsWith('•')) {
                          return (
                            <p key={i} className="mb-1">
                              • {cleanLine.replace(/^[-•]\s*/, '')}
                            </p>
                          );
                        }
                        return <p key={i} className="mb-2">{cleanLine}</p>;
                      })}
                    </div>
                  </div>
                </section>
              ))}
          </>
        )}

        {/* References */}
        {references && references.length > 0 && references.some(r => r.name) && (
          <section>
            <h3
              className="font-bold uppercase tracking-widest pb-2 mb-4"
              style={{
                fontSize: '13px',
                borderBottom: '1px solid #d1d5db',
                color: '#1a1a1a',
              }}
            >
              References
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {references.filter(r => r.name).map((ref) => (
                <div key={ref.id}>
                  <div
                    className="font-bold"
                    style={{
                      fontSize: '13px',
                      color: '#1a1a1a',
                    }}
                  >
                    {ref.name}
                  </div>
                  {ref.title && (
                    <div
                      className="text-gray-700"
                      style={{ fontSize: '12px' }}
                    >
                      {ref.title}
                    </div>
                  )}
                  {ref.company && (
                    <div
                      className="text-gray-500 uppercase tracking-wide mb-1"
                      style={{ fontSize: '11px' }}
                    >
                      {ref.company}
                    </div>
                  )}
                  <div
                    className="text-gray-600"
                    style={{ fontSize: '11px' }}
                  >
                    {ref.phone && <div>{ref.phone}</div>}
                    {ref.email && <div>{ref.email}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Watermark */}
        {showWatermark && (
          <div
            className="mt-8 pt-4"
            style={{
              borderTop: '1px solid #d1d5db',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '10px', color: '#9ca3af' }}>
              Built with Career Hub AI - Go Premium to remove
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalTemplate;
