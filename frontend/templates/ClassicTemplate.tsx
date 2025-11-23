import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ClassicTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

  return (
    <div className="bg-white p-8 font-serif text-sm text-gray-800">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-400 pb-4 mb-6">
        <h1 className="text-4xl font-bold tracking-wider uppercase">{personalDetails.fullName}</h1>
        <p className="text-lg text-gray-600 mt-1">{personalDetails.jobTitle}</p>
      </div>

      {/* Contact Info */}
      <div className="flex justify-center items-center space-x-4 text-xs text-gray-600 mb-6">
        <span>{personalDetails.phone}</span>
        <span className="text-gray-300">|</span>
        <span>{personalDetails.email}</span>
        <span className="text-gray-300">|</span>
        <span>{personalDetails.address}</span>
        {personalDetails.linkedin && (
          <>
            <span className="text-gray-300">|</span>
            <a href={personalDetails.linkedin} className="text-blue-600 hover:underline">{personalDetails.linkedin}</a>
          </>
        )}
        {personalDetails.website && (
           <>
            <span className="text-gray-300">|</span>
            <a href={personalDetails.website} className="text-blue-600 hover:underline">{personalDetails.website}</a>
          </>
        )}
      </div>

      {/* Summary Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest">Summary</h2>
        <p className="text-justify">{summary}</p>
      </div>

      {/* Experience Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest">Experience</h2>
        {experience.map(exp => (
          <div key={exp.id} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-md font-bold">{exp.jobTitle}</h3>
              <p className="text-xs text-gray-600">{exp.startDate} - {exp.endDate}</p>
            </div>
            <div className="flex justify-between items-baseline mb-1">
                <p className="italic">{exp.company}</p>
                <p className="text-xs text-gray-600">{exp.location}</p>
            </div>
            <ul className="list-disc list-inside pl-4 text-sm space-y-1">
              {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* Education Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest">Education</h2>
        {education.map(edu => (
          <div key={edu.id} className="mb-2">
            <div className="flex justify-between items-baseline">
              <h3 className="text-md font-bold">{edu.degree}</h3>
              <p className="text-xs text-gray-600">{edu.gradDate}</p>
            </div>
            <div className="flex justify-between items-baseline">
                <p className="italic">{edu.institution}</p>
                <p className="text-xs text-gray-600">{edu.location}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Section */}
      {skills.length > 0 && skills.some(s => s.name) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest">{skillsLabel || 'Skills'}</h2>
          <div className="flex flex-wrap">
            {skills.filter(s => s.name).map((skill, index) => (
              <span key={skill.id} className="text-sm">
                {skill.name}{index < skills.filter(s => s.name).length - 1 && ' • '}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest">Certifications</h2>
          {certifications.filter(c => c.name).map(cert => (
            <div key={cert.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-md font-bold">{cert.name}</h3>
                <p className="text-xs text-gray-600">{cert.date}</p>
              </div>
              <p className="italic">{cert.issuer}</p>
              {cert.credentialId && <p className="text-xs text-gray-600">Credential ID: {cert.credentialId}</p>}
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
              <div key={section.id} className="mb-6">
                <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest">{section.title}</h2>
                <div className="text-sm">
                  {section.content.split('\n').filter(line => line.trim()).map((line, i) => {
                    const cleanLine = line.trim();
                    if (cleanLine.startsWith('-') || cleanLine.startsWith('•')) {
                      return (
                        <div key={i} className="flex items-start mb-1">
                          <span className="mr-2">•</span>
                          <span>{cleanLine.replace(/^[-•]\s*/, '')}</span>
                        </div>
                      );
                    }
                    return <p key={i} className="mb-1">{cleanLine}</p>;
                  })}
                </div>
              </div>
            ))}
        </>
      )}

      {/* References Section */}
      {references && references.length > 0 && references.some(r => r.name) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest">References</h2>
          {references.filter(r => r.name).map(ref => (
            <div key={ref.id} className="mb-3">
              <h3 className="text-md font-bold">{ref.name}</h3>
              <p className="italic">{ref.title} at {ref.company}</p>
              <p className="text-xs text-gray-600">Relationship: {ref.relationship}</p>
              {(ref.phone || ref.email) && (
                <p className="text-xs text-gray-600">
                  {ref.phone && `Phone: ${ref.phone}`}
                  {ref.phone && ref.email && ' • '}
                  {ref.email && `Email: ${ref.email}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

       {showWatermark && (
        <div className="text-center mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
                Built with Career Hub AI - Go Premium to remove
            </p>
        </div>
      )}
    </div>
  );
};

export default ClassicTemplate;
