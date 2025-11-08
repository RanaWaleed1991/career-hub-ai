import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ClassicTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills } = data;

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
      <div>
        <h2 className="text-xl font-semibold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest">Skills</h2>
        <div className="flex flex-wrap">
          {skills.map((skill, index) => skill.name && (
            <span key={skill.id} className="text-sm">
              {skill.name}{index < skills.length - 1 && ' • '}
            </span>
          ))}
        </div>
      </div>
       {showWatermark && (
        <div className="text-center mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
                Built with Career Hub AI - <span className="font-semibold text-gray-500">Get Premium</span>
            </p>
        </div>
      )}
    </div>
  );
};

export default ClassicTemplate;
