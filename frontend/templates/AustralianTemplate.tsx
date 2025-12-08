import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const AustralianTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections, layoutStyle = 'traditional' } = data;

  return (
    <div className="w-full h-full bg-white text-gray-800 font-sans relative" style={{ fontSize: '12px' }}>
      {/* Decorative Top Bar */}
      <div style={{ height: '16px', backgroundColor: '#0d9488', width: '100%' }} />

      <div className="p-8 px-10">
        {/* Header */}
        <div
          className="flex justify-between items-start mb-10 pb-8"
          style={{ borderBottom: '2px solid #f3f4f6' }}
        >
          <div style={{ maxWidth: '65%' }}>
            <h1
              className="font-bold mb-2 tracking-tight leading-tight"
              style={{
                fontSize: '40px',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: '#111827',
              }}
            >
              {personalDetails.fullName}
            </h1>
            <p
              className="font-medium tracking-wide uppercase"
              style={{
                fontSize: '18px',
                color: '#0d9488',
              }}
            >
              {personalDetails.jobTitle}
            </p>
          </div>
          <div
            className="flex flex-col items-end gap-2"
            style={{ fontSize: '12px', color: '#111827', paddingLeft: '24px' }}
          >
            {personalDetails.email && (
              <div>{personalDetails.email}</div>
            )}
            {personalDetails.phone && (
              <div>{personalDetails.phone}</div>
            )}
            {personalDetails.address && (
              <div>{personalDetails.address}</div>
            )}
            {personalDetails.linkedin && (
              <div className="break-all">
                {personalDetails.linkedin.replace(/^https?:\/\//, '')}
              </div>
            )}
            {personalDetails.website && (
              <div className="break-all">
                {personalDetails.website.replace(/^https?:\/\//, '')}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Content (2 cols) */}
          <div className="col-span-2 flex flex-col gap-8">
            {/* About Me / Summary */}
            {summary && (
              <section style={{ pageBreakInside: 'avoid' }}>
                <h3
                  className="font-bold mb-3 flex items-start gap-2"
                  style={{
                    fontSize: '18px',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    color: '#111827',
                    lineHeight: '1.2',
                  }}
                >
                  <span
                    className="block rounded-full flex-shrink-0"
                    style={{
                      width: '32px',
                      height: '4px',
                      backgroundColor: '#0d9488',
                    }}
                  />
                  Professional Summary
                </h3>
                <p
                  className="leading-relaxed text-justify"
                  style={{
                    fontSize: '12px',
                    color: '#111827',
                  }}
                >
                  {summary}
                </p>
              </section>
            )}

            {/* Professional Experience */}
            {experience.length > 0 && experience.some(e => e.jobTitle) && (
              <section>
                <h3
                  className="font-bold mb-6 flex items-start gap-2"
                  style={{
                    fontSize: '18px',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    color: '#111827',
                    lineHeight: '1.2',
                  }}
                >
                  <span
                    className="block rounded-full flex-shrink-0"
                    style={{
                      width: '32px',
                      height: '4px',
                      backgroundColor: '#0d9488',
                    }}
                  />
                  Experience
                </h3>
                <div
                  className="flex flex-col gap-8 ml-3 pl-8 py-2"
                  style={{ borderLeft: '1px solid #e5e7eb' }}
                >
                  {experience.filter(e => e.jobTitle).map((exp) => (
                    <div key={exp.id} className="relative" style={{ pageBreakInside: 'avoid' }}>
                      {/* Timeline Dot */}
                      <div
                        className="absolute rounded-full bg-white"
                        style={{
                          left: '-38px',
                          top: '6px',
                          width: '12px',
                          height: '12px',
                          border: '2px solid #0d9488',
                        }}
                      />

                      <div className="flex justify-between items-baseline mb-1">
                        <h4
                          className="font-bold"
                          style={{ fontSize: '16px', color: '#1f2937' }}
                        >
                          {exp.jobTitle}
                        </h4>
                        {(exp.startDate || exp.endDate) && (
                          <span
                            className="font-bold uppercase tracking-wider"
                            style={{ fontSize: '11px', color: '#0d9488' }}
                          >
                            {exp.startDate} — {exp.endDate}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="font-medium"
                          style={{ fontSize: '12px', color: '#374151' }}
                        >
                          {exp.company}
                        </span>
                        {exp.location && (
                          <>
                            <span style={{ color: '#d1d5db' }}>•</span>
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>
                              {exp.location}
                            </span>
                          </>
                        )}
                      </div>
                      {exp.description && (
                        <p
                          className="leading-relaxed whitespace-pre-line"
                          style={{ fontSize: '12px', color: '#111827' }}
                        >
                          {exp.description}
                        </p>
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
                  className="font-bold mb-4 flex items-start gap-2"
                  style={{
                    fontSize: '18px',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    color: '#111827',
                    lineHeight: '1.2',
                  }}
                >
                  <span
                    className="block rounded-full flex-shrink-0"
                    style={{
                      width: '32px',
                      height: '4px',
                      backgroundColor: '#0d9488',
                    }}
                  />
                  Certifications
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {certifications.filter(c => c.name).map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #f3f4f6',
                        pageBreakInside: 'avoid',
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4
                          className="font-bold"
                          style={{ fontSize: '13px', color: '#1f2937' }}
                        >
                          {cert.name}
                        </h4>
                        {cert.date && (
                          <span
                            className="font-medium flex-shrink-0 ml-4"
                            style={{
                              fontSize: '11px',
                              color: '#0d9488',
                            }}
                          >
                            {cert.date}
                          </span>
                        )}
                      </div>
                      {cert.issuer && (
                        <p
                          className="leading-relaxed"
                          style={{ fontSize: '12px', color: '#111827' }}
                        >
                          {cert.issuer}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cert.credentialId && (
                          <span
                            className="px-2 py-1 rounded-full font-medium"
                            style={{
                              fontSize: '10px',
                              color: '#0f766e',
                              backgroundColor: 'white',
                              border: '1px solid #5eead4',
                            }}
                          >
                            ID: {cert.credentialId}
                          </span>
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
                    <section key={section.id} style={{ pageBreakInside: 'avoid' }}>
                      <h3
                        className="font-bold mb-4 flex items-start gap-2"
                        style={{
                          fontSize: '18px',
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          color: '#111827',
                          lineHeight: '1.2',
                        }}
                      >
                        <span
                          className="block rounded-full flex-shrink-0"
                          style={{
                            width: '32px',
                            height: '4px',
                            backgroundColor: '#0d9488',
                          }}
                        />
                        {section.title}
                      </h3>
                      <div className="flex flex-col gap-6">
                        <div
                          className="whitespace-pre-line"
                          style={{
                            fontSize: '12px',
                            color: '#111827',
                            lineHeight: '1.6',
                          }}
                        >
                          {section.content.split('\n').map((line, i) => {
                            const trimmedLine = line.trim();
                            if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                              return (
                                <p key={i} className="mb-2">
                                  • {trimmedLine.replace(/^[•-]\s*/, '')}
                                </p>
                              );
                            }
                            return trimmedLine ? <p key={i} className="mb-2">{trimmedLine}</p> : null;
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
                  className="font-bold mb-4 flex items-start gap-2"
                  style={{
                    fontSize: '18px',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    color: '#111827',
                    lineHeight: '1.2',
                  }}
                >
                  <span
                    className="block rounded-full flex-shrink-0"
                    style={{
                      width: '32px',
                      height: '4px',
                      backgroundColor: '#0d9488',
                    }}
                  />
                  References
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {references.filter(r => r.name).map((ref) => (
                    <div
                      key={ref.id}
                      className="bg-white p-4 shadow-sm"
                      style={{ borderLeft: '4px solid #0d9488' }}
                    >
                      <div
                        className="font-bold"
                        style={{ fontSize: '13px', color: '#1f2937' }}
                      >
                        {ref.name}
                      </div>
                      {ref.title && (
                        <div
                          className="font-medium"
                          style={{ fontSize: '12px', color: '#0f766e' }}
                        >
                          {ref.title}
                        </div>
                      )}
                      {ref.company && (
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {ref.company}
                        </div>
                      )}
                      <div
                        className="mt-2"
                        style={{ fontSize: '11px', color: '#9ca3af' }}
                      >
                        {ref.phone || ref.email}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar (1 col) */}
          <div className="col-span-1 flex flex-col gap-8">
            {/* Skills */}
            {skills.length > 0 && skills.some(s => s.name) && (
              <section
                className="p-6 rounded-xl shadow-sm"
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #f3f4f6',
                }}
              >
                <h3
                  className="font-bold mb-4"
                  style={{
                    fontSize: '16px',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    color: '#111827',
                  }}
                >
                  {skillsLabel || 'Skills'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.filter(s => s.name).map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-md font-medium"
                      style={{
                        backgroundColor: '#0d9488',
                        color: 'white',
                        fontSize: '11px',
                        boxShadow: '0 1px 2px 0 rgba(13, 148, 136, 0.2)',
                        lineHeight: '1.5',
                        padding: '6px 12px',
                        display: 'inline-block',
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && education.some(e => e.degree) && (
              <section>
                <h3
                  className="font-bold mb-4 pb-2"
                  style={{
                    fontSize: '16px',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    color: '#111827',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Education
                </h3>
                <div className="flex flex-col gap-5">
                  {education.filter(e => e.degree).map((edu) => (
                    <div key={edu.id}>
                      <div
                        className="font-bold"
                        style={{ fontSize: '14px', color: '#1f2937' }}
                      >
                        {edu.institution}
                      </div>
                      <div
                        className="font-medium mb-1"
                        style={{ fontSize: '12px', color: '#0d9488' }}
                      >
                        {edu.degree}
                      </div>
                      {edu.gradDate && (
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {edu.gradDate}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Watermark */}
      {showWatermark && (
        <div
          className="mt-8 pt-4"
          style={{
            borderTop: '1px solid #f3f4f6',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '10px', color: '#9ca3af' }}>
            Built with Career Hub AI - Go Premium to remove
          </p>
        </div>
      )}
    </div>
  );
};

export default AustralianTemplate;
