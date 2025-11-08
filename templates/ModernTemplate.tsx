import React from 'react';
import type { ResumeData } from '../types';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ModernTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills } = data;

  return (
    <div className="bg-white flex flex-col font-sans text-gray-800 h-full">
      <div className="flex flex-grow">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-slate-800 text-white p-6">
          <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white tracking-wide">{personalDetails.fullName}</h1>
              <p className="text-md text-slate-300 mt-1">{personalDetails.jobTitle}</p>
          </div>
          
          <div className="space-y-6">
              <div>
                  <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-2 border-b border-slate-600 pb-1">Contact</h2>
                  <ul className="text-xs space-y-2 text-slate-200">
                      <li>{personalDetails.phone}</li>
                      <li className="break-words">{personalDetails.email}</li>
                      <li>{personalDetails.address}</li>
                      {personalDetails.linkedin && <li><a href={personalDetails.linkedin} className="text-cyan-400 hover:underline break-all">{personalDetails.linkedin}</a></li>}
                      {personalDetails.website && <li><a href={personalDetails.website} className="text-cyan-400 hover:underline break-all">{personalDetails.website}</a></li>}
                  </ul>
              </div>
              
              <div>
                  <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-2 border-b border-slate-600 pb-1">Education</h2>
                  {education.map(edu => (
                      <div key={edu.id} className="mb-3">
                          <h3 className="text-sm font-bold text-slate-100">{edu.degree}</h3>
                          <p className="text-xs text-slate-300">{edu.institution}</p>
                          <p className="text-xs text-slate-400">{edu.gradDate}</p>
                      </div>
                  ))}
              </div>

              <div>
                  <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-2 border-b border-slate-600 pb-1">Skills</h2>
                  <ul className="text-xs space-y-1">
                      {skills.map(skill => skill.name && <li key={skill.id} className="bg-slate-700 text-slate-200 py-1 px-2 rounded-md inline-block mr-1 mb-1">{skill.name}</li>)}
                  </ul>
              </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8">
          <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-2 mb-3">Profile</h2>
              <p className="text-sm leading-relaxed">{summary}</p>
          </div>

          <div>
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-2 mb-4">Work Experience</h2>
              {experience.map(exp => (
                  <div key={exp.id} className="mb-6">
                      <div className="flex justify-between items-baseline">
                          <h3 className="text-lg font-semibold text-slate-700">{exp.jobTitle}</h3>
                          <p className="text-xs font-medium text-slate-500">{exp.startDate} - {exp.endDate}</p>
                      </div>
                      <div className="flex justify-between items-baseline text-md text-slate-600 mb-2">
                          <p>{exp.company}</p>
                          <p className="text-xs font-medium">{exp.location}</p>
                      </div>
                      <ul className="list-disc list-inside pl-1 text-sm space-y-1 text-slate-700">
                          {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)}
                      </ul>
                  </div>
              ))}
          </div>
        </div>
      </div>
      {showWatermark && (
        <div className="text-center py-2 px-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Built with Career Hub AI - <span className="font-semibold text-gray-500">Get Premium</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ModernTemplate;
