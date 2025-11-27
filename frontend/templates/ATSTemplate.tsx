import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ATSTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections, layoutStyle = 'traditional' } = data;

  // Define section order based on layout style
  const getSectionOrder = (): string[] => {
    switch (layoutStyle) {
      case 'skills-first':
        return ['summary', 'skills', 'experience', 'education', 'certifications', 'custom', 'references'];
      case 'australian':
        return ['summary', 'experience', 'certifications', 'education', 'skills', 'custom', 'references'];
      case 'traditional':
      default:
        return ['summary', 'experience', 'education', 'skills', 'certifications', 'custom', 'references'];
    }
  };

  const sectionOrder = getSectionOrder();

  // Section components
  const sections: Record<string, JSX.Element | null> = {
    summary: summary ? (
      <div className="mb-6" key="summary">
        <h2
          className="font-bold uppercase pb-2 mb-3"
          style={{
            fontSize: '13px',
            borderBottom: '1px solid #000',
          }}
        >
          Professional Summary
        </h2>
        <p
          className="text-justify"
          style={{
            fontSize: '12px',
            lineHeight: '1.5',
          }}
        >
          {summary}
        </p>
      </div>
    ) : null,

    skills: skills.length > 0 && skills.some(s => s.name) ? (
      <div className="mb-6" key="skills">
        <h2
          className="font-bold uppercase pb-2 mb-3"
          style={{
            fontSize: '13px',
            borderBottom: '1px solid #000',
          }}
        >
          {skillsLabel || 'Technical Skills'}
        </h2>
        <p style={{ fontSize: '12px', lineHeight: '1.5' }}>
          {skills.filter(s => s.name).map(s => s.name).join(' • ')}
        </p>
      </div>
    ) : null,

    experience: experience.length > 0 && experience.some(e => e.jobTitle) ? (
      <div className="mb-6" key="experience">
        <h2
          className="font-bold uppercase pb-2 mb-3"
          style={{
            fontSize: '13px',
            borderBottom: '1px solid #000',
          }}
        >
          Professional Experience
        </h2>
        <div className="flex flex-col gap-4">
          {experience.filter(e => e.jobTitle).map((exp) => (
            <div key={exp.id}>
              {/* Company and Location */}
              <div
                className="flex justify-between items-baseline font-bold"
                style={{ fontSize: '12px' }}
              >
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>

              {/* Job Title and Dates */}
              <div
                className="flex justify-between items-baseline italic mb-1"
                style={{ fontSize: '12px' }}
              >
                <span>{exp.jobTitle}</span>
                <span>
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>

              {/* Description */}
              {exp.description && (
                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  {exp.description.split('\n').map((line, i) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                      return (
                        <div key={i} className="ml-4 -indent-4">
                          • {trimmedLine.replace(/^[•-]\s*/, '')}
                        </div>
                      );
                    }
                    return trimmedLine ? <p key={i} className="mb-1">{trimmedLine}</p> : null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null,

    education: education.length > 0 && education.some(e => e.degree) ? (
      <div className="mb-6" key="education">
        <h2
          className="font-bold uppercase pb-2 mb-3"
          style={{
            fontSize: '13px',
            borderBottom: '1px solid #000',
          }}
        >
          Education
        </h2>
        <div className="flex flex-col gap-2">
          {education.filter(e => e.degree).map((edu) => (
            <div key={edu.id}>
              {/* Institution and Location */}
              <div
                className="flex justify-between items-baseline font-bold"
                style={{ fontSize: '12px' }}
              >
                <span>{edu.institution}</span>
                <span>{edu.location}</span>
              </div>

              {/* Degree and Date */}
              <div
                className="flex justify-between items-baseline"
                style={{ fontSize: '12px' }}
              >
                <span className="italic">{edu.degree}</span>
                <span>{edu.gradDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null,

    certifications: certifications && certifications.length > 0 && certifications.some(c => c.name) ? (
      <div className="mb-6" key="certifications">
        <h2
          className="font-bold uppercase pb-2 mb-3"
          style={{
            fontSize: '13px',
            borderBottom: '1px solid #000',
          }}
        >
          Certifications
        </h2>
        <div className="flex flex-col gap-3">
          {certifications.filter(c => c.name).map((cert) => (
            <div key={cert.id}>
              <div className="font-bold" style={{ fontSize: '12px' }}>
                {cert.name}
                {cert.date && (
                  <span className="font-normal ml-1" style={{ fontSize: '11px', opacity: 0.75 }}>
                    ({cert.date})
                  </span>
                )}
              </div>
              {cert.issuer && (
                <p style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  {cert.issuer}
                </p>
              )}
              {cert.credentialId && (
                <p className="italic" style={{ fontSize: '11px' }}>
                  ID: {cert.credentialId}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null,

    custom: customSections && customSections.length > 0 && customSections.some(s => s.title) ? (
      <React.Fragment key="custom">
        {customSections
          .filter(s => s.title)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div key={section.id} className="mb-6">
              <h2
                className="font-bold uppercase pb-2 mb-3"
                style={{
                  fontSize: '13px',
                  borderBottom: '1px solid #000',
                }}
              >
                {section.title}
              </h2>
              <div className="flex flex-col gap-3">
                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  {section.content.split('\n').map((line, i) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                      return (
                        <div key={i} className="ml-4 -indent-4">
                          • {trimmedLine.replace(/^[•-]\s*/, '')}
                        </div>
                      );
                    }
                    return trimmedLine ? <p key={i} className="mb-1">{trimmedLine}</p> : null;
                  })}
                </div>
              </div>
            </div>
          ))}
      </React.Fragment>
    ) : null,

    references: references && references.length > 0 && references.some(r => r.name) ? (
      <div className="mb-6" key="references">
        <h2
          className="font-bold uppercase pb-2 mb-3"
          style={{
            fontSize: '13px',
            borderBottom: '1px solid #000',
          }}
        >
          References
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {references.filter(r => r.name).map((ref) => (
            <div key={ref.id}>
              <div className="font-bold" style={{ fontSize: '12px' }}>
                {ref.name}
              </div>
              <div className="italic" style={{ fontSize: '12px' }}>
                {ref.title}
                {ref.title && ref.company && ', '}
                {ref.company}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>
                {ref.phone && <div>{ref.phone}</div>}
                {ref.email && <div>{ref.email}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null,
  };

  return (
    <div
      className="w-full h-full bg-white text-black p-10 max-w-[210mm] mx-auto"
      style={{
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: '12px',
      }}
    >
      {/* Header */}
      <div
        className="text-center pb-4 mb-6"
        style={{
          borderBottom: '1px solid #000',
        }}
      >
        <h1
          className="font-bold uppercase tracking-widest mb-2"
          style={{
            fontSize: '24px',
            letterSpacing: '0.2em',
          }}
        >
          {personalDetails.fullName}
        </h1>
        <div
          className="flex flex-wrap justify-center gap-x-4 gap-y-1"
          style={{ fontSize: '12px' }}
        >
          {personalDetails.address && <span>{personalDetails.address}</span>}
          {personalDetails.address && personalDetails.phone && <span>|</span>}
          {personalDetails.phone && <span>{personalDetails.phone}</span>}
          {personalDetails.phone && personalDetails.email && <span>|</span>}
          {personalDetails.email && (
            <a href={`mailto:${personalDetails.email}`} className="underline">
              {personalDetails.email}
            </a>
          )}
          {personalDetails.linkedin && (
            <>
              <span>|</span>
              <span className="opacity-90">
                {personalDetails.linkedin.replace(/^https?:\/\//, '')}
              </span>
            </>
          )}
          {personalDetails.website && (
            <>
              <span>|</span>
              <span className="opacity-90">
                {personalDetails.website.replace(/^https?:\/\//, '')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Sections based on layout style */}
      {sectionOrder.map(sectionKey => sections[sectionKey]).filter(Boolean)}

      {/* Watermark */}
      {showWatermark && (
        <div
          className="mt-8 pt-4"
          style={{
            borderTop: '1px solid #000',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '10px', color: '#666' }}>
            Built with Career Hub AI - Go Premium to remove
          </p>
        </div>
      )}
    </div>
  );
};

export default ATSTemplate;
