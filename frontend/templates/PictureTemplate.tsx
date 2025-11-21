import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const PictureTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

  return (
    <div className="w-full min-h-full bg-white text-slate-800 font-sans flex">
      {/* Left Sidebar - Fixed Width */}
      <aside
        className="w-[30%] min-w-[220px] max-w-[280px] text-white flex flex-col shrink-0"
        style={{
          backgroundColor: '#1e293b',
          fontFamily: "'Inter', 'Arial', sans-serif",
        }}
      >
        {/* Profile Picture Container */}
        <div className="p-6 pb-2 flex flex-col items-center">
          <div
            className="rounded-full overflow-hidden shadow-xl mb-4 shrink-0"
            style={{
              width: '160px',
              height: '160px',
              border: '4px solid #475569',
              backgroundColor: '#334155',
            }}
          >
            {personalDetails.photo ? (
              <img
                src={personalDetails.photo}
                alt={personalDetails.fullName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center font-bold"
                style={{
                  fontSize: '48px',
                  color: '#64748b',
                  backgroundColor: '#334155',
                }}
              >
                {personalDetails.fullName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 px-6 py-4 flex flex-col gap-8">
          {/* Contact Info */}
          <div className="flex flex-col gap-3" style={{ fontSize: '12px' }}>
            <div
              className="uppercase tracking-widest font-bold pb-2 mb-1"
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                borderBottom: '1px solid #475569',
              }}
            >
              Contact
            </div>

            {personalDetails.email && (
              <div className="flex flex-col gap-1">
                <div
                  className="font-medium flex items-center gap-1"
                  style={{ fontSize: '10px', color: '#94a3b8' }}
                >
                  <span>✉</span> Email
                </div>
                <span
                  className="break-all font-light"
                  style={{ fontSize: '12px' }}
                >
                  {personalDetails.email}
                </span>
              </div>
            )}

            {personalDetails.phone && (
              <div className="flex flex-col gap-1">
                <div
                  className="font-medium flex items-center gap-1"
                  style={{ fontSize: '10px', color: '#94a3b8' }}
                >
                  <span>☎</span> Phone
                </div>
                <span className="font-light" style={{ fontSize: '12px' }}>
                  {personalDetails.phone}
                </span>
              </div>
            )}

            {personalDetails.address && (
              <div className="flex flex-col gap-1">
                <div
                  className="font-medium flex items-center gap-1"
                  style={{ fontSize: '10px', color: '#94a3b8' }}
                >
                  <span>📍</span> Location
                </div>
                <span className="font-light" style={{ fontSize: '12px' }}>
                  {personalDetails.address}
                </span>
              </div>
            )}

            {personalDetails.linkedin && (
              <div className="flex flex-col gap-1">
                <div
                  className="font-medium flex items-center gap-1"
                  style={{ fontSize: '10px', color: '#94a3b8' }}
                >
                  <span>in</span> LinkedIn
                </div>
                <a
                  href={personalDetails.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-light hover:text-blue-300 transition-colors"
                  style={{ fontSize: '12px' }}
                >
                  {personalDetails.linkedin.replace(
                    /^https?:\/\/(www\.)?linkedin\.com\/in\//,
                    ''
                  )}
                </a>
              </div>
            )}

            {personalDetails.website && (
              <div className="flex flex-col gap-1">
                <div
                  className="font-medium flex items-center gap-1"
                  style={{ fontSize: '10px', color: '#94a3b8' }}
                >
                  <span>🌐</span> Website
                </div>
                <a
                  href={personalDetails.website}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-light hover:text-blue-300 transition-colors"
                  style={{ fontSize: '12px' }}
                >
                  {personalDetails.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          {/* Education Sidebar */}
          {education.length > 0 && education.some(e => e.degree) && (
            <div className="flex flex-col gap-3">
              <div
                className="uppercase tracking-widest font-bold pb-2 mb-1"
                style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  borderBottom: '1px solid #475569',
                }}
              >
                Education
              </div>
              <div className="flex flex-col gap-4">
                {education.filter(e => e.degree).map((edu) => (
                  <div key={edu.id}>
                    <div
                      className="font-bold leading-tight"
                      style={{ fontSize: '12px', color: 'white' }}
                    >
                      {edu.institution}
                    </div>
                    <div
                      className="mt-0.5"
                      style={{ fontSize: '11px', color: '#93c5fd' }}
                    >
                      {edu.degree}
                    </div>
                    {edu.gradDate && (
                      <div
                        className="mt-1 font-medium"
                        style={{ fontSize: '10px', color: '#64748b' }}
                      >
                        {edu.gradDate}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Sidebar */}
          {skills.length > 0 && skills.some(s => s.name) && (
            <div className="flex flex-col gap-3">
              <div
                className="uppercase tracking-widest font-bold pb-2 mb-1"
                style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  borderBottom: '1px solid #475569',
                }}
              >
                {skillsLabel || 'Skills'}
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.filter(s => s.name).map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2 py-1 rounded"
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid #475569',
                      fontSize: '11px',
                      color: '#e2e8f0',
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-10 flex flex-col gap-8 bg-white">
        {/* Header */}
        <header
          className="pb-6"
          style={{ borderBottom: '2px solid #f1f5f9' }}
        >
          <h1
            className="font-bold uppercase tracking-tight mb-2 leading-none"
            style={{
              fontSize: '40px',
              color: '#0f172a',
            }}
          >
            {personalDetails.fullName}
          </h1>
          <p
            className="uppercase tracking-widest font-light"
            style={{
              fontSize: '18px',
              color: '#64748b',
            }}
          >
            {personalDetails.jobTitle}
          </p>
        </header>

        {/* Profile Summary */}
        {summary && (
          <section>
            <h3
              className="font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ fontSize: '12px', color: '#1e293b' }}
            >
              <span
                style={{
                  width: '32px',
                  height: '2px',
                  backgroundColor: '#1e293b',
                }}
              />
              Profile
            </h3>
            <p
              className="text-justify"
              style={{
                fontSize: '12px',
                lineHeight: '1.75',
                color: '#475569',
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
              className="font-bold uppercase tracking-widest mb-6 flex items-center gap-2"
              style={{ fontSize: '12px', color: '#1e293b' }}
            >
              <span
                style={{
                  width: '32px',
                  height: '2px',
                  backgroundColor: '#1e293b',
                }}
              />
              Experience
            </h3>
            <div className="flex flex-col gap-8">
              {experience.filter(e => e.jobTitle).map((exp) => (
                <div key={exp.id} className="group">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h4
                      className="font-bold"
                      style={{ fontSize: '16px', color: '#1e293b' }}
                    >
                      {exp.jobTitle}
                    </h4>
                    {(exp.startDate || exp.endDate) && (
                      <span
                        className="font-semibold uppercase tracking-wide px-2 py-1 rounded mt-1 sm:mt-0 whitespace-nowrap"
                        style={{
                          fontSize: '11px',
                          color: '#64748b',
                          backgroundColor: '#f8fafc',
                        }}
                      >
                        {exp.startDate} — {exp.endDate}
                      </span>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-2 mb-3"
                    style={{ fontSize: '12px' }}
                  >
                    <span
                      className="font-bold"
                      style={{ color: '#334155' }}
                    >
                      {exp.company}
                    </span>
                    {exp.location && (
                      <>
                        <span style={{ color: '#cbd5e1' }}>|</span>
                        <span
                          className="italic"
                          style={{ color: '#64748b' }}
                        >
                          {exp.location}
                        </span>
                      </>
                    )}
                  </div>

                  {exp.description && (
                    <p
                      className="whitespace-pre-line pl-3 group-hover:border-slate-200 transition-colors"
                      style={{
                        fontSize: '12px',
                        lineHeight: '1.6',
                        color: '#475569',
                        borderLeft: '2px solid #f1f5f9',
                      }}
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
              className="font-bold uppercase tracking-widest mb-6 flex items-center gap-2"
              style={{ fontSize: '12px', color: '#1e293b' }}
            >
              <span
                style={{
                  width: '32px',
                  height: '2px',
                  backgroundColor: '#1e293b',
                }}
              />
              Certifications
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {certifications.filter(c => c.name).map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4
                      className="font-bold flex items-center gap-2"
                      style={{ fontSize: '13px', color: '#0f172a' }}
                    >
                      {cert.name}
                    </h4>
                  </div>
                  {cert.issuer && (
                    <p
                      className="mb-3 leading-relaxed"
                      style={{ fontSize: '12px', color: '#475569' }}
                    >
                      {cert.issuer}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {cert.date && (
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{
                          fontSize: '10px',
                          color: '#475569',
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {cert.date}
                      </span>
                    )}
                    {cert.credentialId && (
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{
                          fontSize: '10px',
                          color: '#475569',
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
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
                <section key={section.id}>
                  <h3
                    className="font-bold uppercase tracking-widest mb-6 flex items-center gap-2"
                    style={{ fontSize: '12px', color: '#1e293b' }}
                  >
                    <span
                      style={{
                        width: '32px',
                        height: '2px',
                        backgroundColor: '#1e293b',
                      }}
                    />
                    {section.title}
                  </h3>
                  <div className="flex flex-col gap-6">
                    <div
                      className="whitespace-pre-line"
                      style={{
                        fontSize: '12px',
                        color: '#475569',
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
              className="font-bold uppercase tracking-widest mb-6 flex items-center gap-2"
              style={{ fontSize: '12px', color: '#1e293b' }}
            >
              <span
                style={{
                  width: '32px',
                  height: '2px',
                  backgroundColor: '#1e293b',
                }}
              />
              References
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {references.filter(r => r.name).map((ref) => (
                <div
                  key={ref.id}
                  className="p-4 rounded"
                  style={{
                    border: '1px solid #f1f5f9',
                    backgroundColor: 'white',
                  }}
                >
                  <div
                    className="font-bold"
                    style={{ fontSize: '12px', color: '#0f172a' }}
                  >
                    {ref.name}
                  </div>
                  {ref.title && (
                    <div
                      className="mt-0.5 font-medium"
                      style={{ fontSize: '11px', color: '#475569' }}
                    >
                      {ref.title}
                    </div>
                  )}
                  {ref.company && (
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {ref.company}
                    </div>
                  )}
                  <div
                    className="mt-2 pt-2 flex items-center gap-2"
                    style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      borderTop: '1px solid #f8fafc',
                    }}
                  >
                    <span>✉</span>
                    {ref.email || ref.phone}
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
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '10px', color: '#94a3b8' }}>
              Built with Career Hub AI - <span className="font-semibold">Get Premium</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PictureTemplate;
