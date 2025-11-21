import React from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe, ExternalLink } from 'lucide-react';

interface Props {
  data: ResumeData;
}

const TemplateModern: React.FC<Props> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, projects, references, customSections } = data;

  return (
    <div className="w-full h-full bg-white text-slate-800 font-sans">
      <div className="grid grid-cols-12 min-h-full">
        {/* Left Sidebar */}
        <div className="col-span-4 bg-slate-900 text-white p-6 flex flex-col gap-8 print:bg-slate-900 print:text-white">
          
           {/* Optional Photo if in Modern Template (not standard but good if user adds one) */}
           {personalInfo.profilePicture && (
             <div className="flex justify-center">
               <img src={personalInfo.profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-slate-700" />
             </div>
           )}

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase break-words leading-tight">
              {personalInfo.fullName}
            </h1>
            <p className="text-blue-400 text-lg font-medium">{personalInfo.jobTitle}</p>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            {personalInfo.email && (
              <div className="flex items-center gap-3 opacity-90">
                <Mail size={16} className="text-blue-400 shrink-0" />
                <span className="break-all">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-3 opacity-90">
                <Phone size={16} className="text-blue-400 shrink-0" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-3 opacity-90">
                <MapPin size={16} className="text-blue-400 shrink-0" />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-3 opacity-90">
                <Linkedin size={16} className="text-blue-400 shrink-0" />
                <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-3 opacity-90">
                <Globe size={16} className="text-blue-400 shrink-0" />
                <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold uppercase tracking-wider border-b border-slate-700 pb-2 mb-4 text-white">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-800 text-blue-200 rounded text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold uppercase tracking-wider border-b border-slate-700 pb-2 mb-4 text-white">
                Education
              </h3>
              <div className="flex flex-col gap-4">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-bold text-white">{edu.institution}</p>
                    <p className="text-blue-300 text-sm">{edu.degree}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                    </p>
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
              <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-2 mb-3">
                Profile
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm text-justify">
                {summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-2 mb-4">
                Experience
              </h3>
              <div className="flex flex-col gap-6">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-md font-bold text-slate-900">{exp.role}</h4>
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-blue-600">{exp.company}</span>
                      <span className="text-xs text-slate-500">{exp.location}</span>
                    </div>
                    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line pl-1">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

           {/* Projects */}
           {projects.length > 0 && (
            <div>
              <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-2 mb-4">
                Projects
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-slate-100 p-3 rounded hover:bg-slate-50 transition-colors">
                     <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            {project.name}
                            {project.link && <ExternalLink size={12} className="text-slate-400"/>}
                        </h4>
                     </div>
                     <p className="text-xs text-slate-600 mb-2">{project.description}</p>
                     <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                                {tech}
                            </span>
                        ))}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections */}
          {customSections.map((section) => (
             <div key={section.id}>
               <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-2 mb-4">
                 {section.title}
               </h3>
               <div className="flex flex-col gap-4">
                 {section.items.map((item) => (
                   <div key={item.id}>
                      <div className="flex justify-between items-baseline mb-1">
                         <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                         {(item.startDate || item.endDate) && (
                             <span className="text-xs font-semibold text-slate-500">
                                {item.startDate} {item.endDate ? `- ${item.endDate}` : ''}
                             </span>
                         )}
                      </div>
                      {item.location && <div className="text-xs text-slate-500 italic mb-1">{item.location}</div>}
                      {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
                   </div>
                 ))}
               </div>
             </div>
          ))}

          {/* References */}
          {references.length > 0 && (
             <div>
                <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-2 mb-4">
                    References
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {references.map((ref) => (
                        <div key={ref.id} className="text-sm">
                            <div className="font-bold text-slate-900">{ref.name}</div>
                            <div className="text-slate-600">{ref.role}, {ref.company}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{ref.contactInfo}</div>
                        </div>
                    ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateModern;