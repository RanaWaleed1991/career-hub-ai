import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ModernTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

  return (
    <div className="w-full h-full bg-white text-slate-800 font-sans" style={{ fontSize: '12px' }}>
      <div className="grid grid-cols-12 min-h-full">
        {/* Left Sidebar */}
        <div
          className="col-span-4 text-white p-6 flex flex-col gap-8"
          style={{ backgroundColor: '#0f172a' }}
        >
          {/* Optional Photo */}
          {personalDetails.photo && (
            <div className="flex justify-center">
              <img
                src={personalDetails.photo}
                alt="Profile"
                className="rounded-full object-cover"
                style={{
                  width: '128px',
                  height: '128px',
                  border: '4px solid #334155',
                }}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h1
              className="font-bold tracking-tight uppercase break-words leading-tight"
              style={{
                fontSize: '28px',
                color: 'white',
              }}
            >
              {personalDetails.fullName}
            </h1>
            <p
              className="font-medium"
              style={{
                fontSize: '16px',
                color: '#60a5fa',
              }}
            >
              {personalDetails.jobTitle}
            </p>
          </div>

          <div className="flex flex-col gap-4" style={{ fontSize: '12px' }}>
            {personalDetails.email && (
              <div className="flex items-center gap-3 opacity-90">
                <span style={{ color: '#60a5fa' }}>✉</span>
                <span className="break-all">{personalDetails.email}</span>
              </div>
            )}
            {personalDetails.phone && (
              <div className="flex items-center gap-3 opacity-90">
                <span style={{ color: '#60a5fa' }}>☎</span>
                <span>{personalDetails.phone}</span>
              </div>
            )}
            {personalDetails.address && (
              <div className="flex items-center gap-3 opacity-90">
                <span style={{ color: '#60a5fa' }}>📍</span>
                <span>{personalDetails.address}</span>
              </div>
            )}
            {personalDetails.linkedin && (
              <div className="flex items-center gap-3 opacity-90">
                <span style={{ color: '#60a5fa' }}>in</span>
                <span className="break-all">
                  {personalDetails.linkedin.replace(/^https?:\/\//, '')}
                </span>
              </div>
            )}
            {personalDetails.website && (
              <div className="flex items-center gap-3 opacity-90">
                <span style={{ color: '#60a5fa' }}>🌐</span>
                <span className="break-all">
                  {personalDetails.website.replace(/^https?:\/\//, '')}
                </span>
              </div>
            )}
          </div>

          {/* Skills Section */}
          {skills.length > 0 && skills.some(s => s.name) && (
            <div className="mt-4">
              <h3
                className="font-bold uppercase tracking-wider pb-2 mb-4"
                style={{
                  fontSize: '16px',
                  color: 'white',
                  borderBottom: '1px solid #334155',
                }}
              >
                {skillsLabel || 'Skills'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.filter(s => s.name).map((skill) => (
                  <span
                    key={skill.id}
                    className="px-2 py-1 rounded font-medium"
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#bfdbfe',
                      fontSize: '11px',
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {education.length > 0 && education.some(e => e.degree) && (
            <div className="mt-4">
              <h3
                className="font-bold uppercase tracking-wider pb-2 mb-4"
                style={{
                  fontSize: '16px',
                  color: 'white',
                  borderBottom: '1px solid #334155',
                }}
              >
                Education
              </h3>
              <div className="flex flex-col gap-4">
                {education.filter(e => e.degree).map((edu) => (
                  <div key={edu.id}>
                    <p
                      className="font-bold"
                      style={{ fontSize: '13px', color: 'white' }}
                    >
                      {edu.institution}
                    </p>
                    <p style={{ fontSize: '12px', color: '#93c5fd' }}>
                      {edu.degree}
                    </p>
                    {edu.gradDate && (
                      <p
                        className="mt-1"
                        style={{ fontSize: '11px', color: '#94a3b8' }}
                      >
                        {edu.gradDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Content */}
        <div className="col-span-8 p-8 flex flex-col gap-6">
          {/* Summary */}
          {summary && (
            <div className="mb-2">
              <h3
                className="font-bold uppercase tracking-wider pb-2 mb-3"
                style={{
                  fontSize: '16px',
                  color: '#0f172a',
                  borderBottom: '2px solid #e2e8f0',
                }}
              >
                Profile
              </h3>
              <p
                className="leading-relaxed text-justify"
                style={{
                  fontSize: '12px',
                  color: '#475569',
                }}
              >
                {summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && experience.some(e => e.jobTitle) && (
            <div>
              <h3
                className="font-bold uppercase tracking-wider pb-2 mb-4"
                style={{
                  fontSize: '16px',
                  color: '#0f172a',
                  borderBottom: '2px solid #e2e8f0',
                }}
              >
                Experience
              </h3>
              <div className="flex flex-col gap-6">
                {experience.filter(e => e.jobTitle).map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4
                        className="font-bold"
                        style={{ fontSize: '14px', color: '#0f172a' }}
                      >
                        {exp.jobTitle}
                      </h4>
                      {(exp.startDate || exp.endDate) && (
                        <span
                          className="font-semibold px-2 py-1 rounded"
                          style={{
                            fontSize: '11px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {exp.startDate} — {exp.endDate}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className="font-semibold"
                        style={{ fontSize: '12px', color: '#2563eb' }}
                      >
                        {exp.company}
                      </span>
                      {exp.location && (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {exp.location}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <div
                        className="leading-relaxed whitespace-pre-line pl-1"
                        style={{
                          fontSize: '12px',
                          color: '#475569',
                        }}
                      >
                        {exp.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
            <div>
              <h3
                className="font-bold uppercase tracking-wider pb-2 mb-4"
                style={{
                  fontSize: '16px',
                  color: '#0f172a',
                  borderBottom: '2px solid #e2e8f0',
                }}
              >
                Certifications
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {certifications.filter(c => c.name).map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3 rounded hover:bg-slate-50 transition-colors"
                    style={{ border: '1px solid #f1f5f9' }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4
                        className="font-bold flex items-center gap-2"
                        style={{ fontSize: '12px', color: '#0f172a' }}
                      >
                        {cert.name}
                      </h4>
                    </div>
                    {cert.issuer && (
                      <p
                        className="mb-2"
                        style={{ fontSize: '11px', color: '#475569' }}
                      >
                        {cert.issuer}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {cert.date && (
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{
                            fontSize: '10px',
                            backgroundColor: '#dbeafe',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          {cert.date}
                        </span>
                      )}
                      {cert.credentialId && (
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{
                            fontSize: '10px',
                            backgroundColor: '#dbeafe',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          ID: {cert.credentialId}
                        </span>
                      )}
                    </div>
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
                .map((section) => (
                  <div key={section.id}>
                    <h3
                      className="font-bold uppercase tracking-wider pb-2 mb-4"
                      style={{
                        fontSize: '16px',
                        color: '#0f172a',
                        borderBottom: '2px solid #e2e8f0',
                      }}
                    >
                      {section.title}
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#475569',
                        }}
                      >
                        {section.content.split('\n').map((line, i) => {
                          const trimmedLine = line.trim();
                          if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                            return (
                              <p key={i} className="mb-1">
                                • {trimmedLine.replace(/^[•-]\s*/, '')}
                              </p>
                            );
                          }
                          return trimmedLine ? <p key={i} className="mb-1">{trimmedLine}</p> : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
            </>
          )}

          {/* References */}
          {references && references.length > 0 && references.some(r => r.name) && (
            <div>
              <h3
                className="font-bold uppercase tracking-wider pb-2 mb-4"
                style={{
                  fontSize: '16px',
                  color: '#0f172a',
                  borderBottom: '2px solid #e2e8f0',
                }}
              >
                References
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {references.filter(r => r.name).map((ref) => (
                  <div key={ref.id} style={{ fontSize: '12px' }}>
                    <div
                      className="font-bold"
                      style={{ color: '#0f172a' }}
                    >
                      {ref.name}
                    </div>
                    <div style={{ color: '#475569' }}>
                      {ref.title}
                      {ref.title && ref.company && ', '}
                      {ref.company}
                    </div>
                    <div
                      className="mt-0.5"
                      style={{ fontSize: '11px', color: '#64748b' }}
                    >
                      {ref.phone || ref.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Watermark */}
          {showWatermark && (
            <div
              className="mt-8 pt-4"
              style={{
                borderTop: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '10px', color: '#94a3b8' }}>
                Built with Career Hub AI - Go Premium to remove
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
