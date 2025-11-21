import React from 'react';
import { ResumeData } from '../types';

interface Props {
  data: ResumeData;
}

const TemplateATS: React.FC<Props> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, projects, references, customSections } = data;

  return (
    <div className="w-full h-full bg-white text-black font-serif p-10 max-w-[210mm] mx-auto">
      {/* Header */}
      <div className="text-center border-b border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">{personalInfo.fullName}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
           <span>{personalInfo.location}</span>
           <span>|</span>
           <span>{personalInfo.phone}</span>
           <span>|</span>
           <a href={`mailto:${personalInfo.email}`} className="underline">{personalInfo.email}</a>
           {personalInfo.linkedin && (
               <>
                <span>|</span>
                <span className="opacity-90">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
               </>
           )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Professional Summary</h2>
          <p className="text-sm leading-normal text-justify">
            {summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
           <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Technical Skills</h2>
           <p className="text-sm leading-normal">
             {skills.join(' • ')}
           </p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Professional Experience</h2>
          <div className="flex flex-col gap-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-sm">
                  <span>{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                <div className="flex justify-between items-baseline italic text-sm mb-1">
                  <span>{exp.role}</span>
                  <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="text-sm leading-snug pl-0">
                   {exp.description.split('\n').map((line, i) => (
                       line.trim().startsWith('•') 
                        ? <div key={i} className="ml-4 -indent-4">{line}</div>
                        : <p key={i} className="mb-1">{line}</p>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

       {/* Education */}
       {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Education</h2>
          <div className="flex flex-col gap-2">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline font-bold text-sm">
                    <span>{edu.institution}</span>
                    <span>{edu.location}</span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                    <span className="italic">{edu.degree}</span>
                    <span>{edu.startDate} – {edu.current ? 'Present' : edu.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Key Projects</h2>
            <div className="flex flex-col gap-3">
                {projects.map((proj) => (
                    <div key={proj.id}>
                        <div className="text-sm font-bold">
                            {proj.name} 
                            {proj.link && <span className="font-normal ml-1 text-xs opacity-75">({proj.link})</span>}
                        </div>
                        <p className="text-sm leading-snug">{proj.description}</p>
                        <p className="text-xs italic mt-0.5">Tech: {proj.technologies.join(', ')}</p>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* Custom Sections */}
      {customSections.map((section) => (
          <div key={section.id} className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">{section.title}</h2>
            <div className="flex flex-col gap-3">
                {section.items.map((item) => (
                    <div key={item.id}>
                        <div className="flex justify-between items-baseline font-bold text-sm">
                           <span>{item.name}</span>
                           {(item.startDate || item.endDate) && (
                               <span className="font-normal italic">
                                  {item.startDate} {item.endDate ? `- ${item.endDate}` : ''}
                               </span>
                           )}
                        </div>
                        {item.location && <div className="text-xs italic mb-1">{item.location}</div>}
                        {item.description && <p className="text-sm leading-snug">{item.description}</p>}
                    </div>
                ))}
            </div>
          </div>
      ))}

      {/* References */}
      {references.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">References</h2>
            <div className="grid grid-cols-2 gap-4">
                {references.map((ref) => (
                    <div key={ref.id}>
                        <div className="text-sm font-bold">{ref.name}</div>
                        <div className="text-sm italic">{ref.role}, {ref.company}</div>
                        <div className="text-sm opacity-75">{ref.contactInfo}</div>
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
};

export default TemplateATS;