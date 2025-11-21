import React from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe, ExternalLink } from 'lucide-react';

interface Props {
  data: ResumeData;
}

const TemplateCreative: React.FC<Props> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, projects, references, customSections } = data;

  return (
    <div className="w-full h-full bg-white text-gray-800 font-sans relative">
      {/* Decorative Top Bar */}
      <div className="h-4 bg-teal-600 w-full"></div>
      
      <div className="p-8 px-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-10 border-b-2 border-gray-100 pb-8">
            <div>
                <h1 className="text-5xl font-serif font-bold text-gray-900 mb-2 tracking-tight leading-tight">
                    {personalInfo.fullName}
                </h1>
                <p className="text-xl text-teal-600 font-medium tracking-wide uppercase">
                    {personalInfo.jobTitle}
                </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-sm text-gray-600">
                {personalInfo.email && (
                    <div className="flex items-center gap-2">
                        <span>{personalInfo.email}</span>
                        <Mail size={14} className="text-teal-600"/>
                    </div>
                )}
                {personalInfo.phone && (
                    <div className="flex items-center gap-2">
                        <span>{personalInfo.phone}</span>
                        <Phone size={14} className="text-teal-600"/>
                    </div>
                )}
                {personalInfo.location && (
                    <div className="flex items-center gap-2">
                        <span>{personalInfo.location}</span>
                        <MapPin size={14} className="text-teal-600"/>
                    </div>
                )}
                {personalInfo.linkedin && (
                    <div className="flex items-center gap-2">
                        <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                        <Linkedin size={14} className="text-teal-600"/>
                    </div>
                )}
                {personalInfo.website && (
                    <div className="flex items-center gap-2">
                        <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, '')}</span>
                        <Globe size={14} className="text-teal-600"/>
                    </div>
                )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-10">
            {/* Main Content (2 cols) */}
            <div className="col-span-2 flex flex-col gap-8">
                 {summary && (
                    <section>
                        <h3 className="font-serif font-bold text-xl text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-8 h-1 bg-teal-600 block rounded-full"></span>
                            About Me
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm text-justify">
                            {summary}
                        </p>
                    </section>
                )}

                {experience.length > 0 && (
                    <section>
                         <h3 className="font-serif font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-1 bg-teal-600 block rounded-full"></span>
                            Experience
                        </h3>
                        <div className="flex flex-col gap-8 border-l border-gray-200 ml-3 pl-8 py-2">
                            {experience.map((exp) => (
                                <div key={exp.id} className="relative">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[38px] top-1.5 w-3 h-3 rounded-full border-2 border-teal-600 bg-white"></div>
                                    
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-lg font-bold text-gray-800">{exp.role}</h4>
                                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="font-medium text-gray-700">{exp.company}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-xs text-gray-500">{exp.location}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {projects.length > 0 && (
                    <section>
                        <h3 className="font-serif font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-1 bg-teal-600 block rounded-full"></span>
                            Projects
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {projects.map((project) => (
                                <div key={project.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                            {project.name}
                                            {project.link && <ExternalLink size={12} className="text-teal-500"/>}
                                        </h4>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{project.description}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {project.technologies.map((tech, i) => (
                                            <span key={i} className="text-[10px] px-2 py-1 bg-white text-teal-700 border border-teal-100 rounded-full font-medium">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Custom Sections */}
                {customSections.map((section) => (
                    <section key={section.id}>
                        <h3 className="font-serif font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-1 bg-teal-600 block rounded-full"></span>
                            {section.title}
                        </h3>
                        <div className="flex flex-col gap-6">
                            {section.items.map((item) => (
                                <div key={item.id} className="border-b border-gray-50 pb-4 last:border-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
                                        {(item.startDate || item.endDate) && (
                                            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                                                {item.startDate} {item.endDate ? `— ${item.endDate}` : ''}
                                            </span>
                                        )}
                                    </div>
                                    {item.location && <div className="text-xs text-gray-500 italic mb-2">{item.location}</div>}
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* References */}
                {references.length > 0 && (
                    <section>
                        <h3 className="font-serif font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-1 bg-teal-600 block rounded-full"></span>
                            References
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {references.map((ref) => (
                                <div key={ref.id} className="bg-white p-4 border-l-4 border-teal-600 shadow-sm">
                                    <div className="font-bold text-gray-800">{ref.name}</div>
                                    <div className="text-sm text-teal-700 font-medium">{ref.role}</div>
                                    <div className="text-xs text-gray-500">{ref.company}</div>
                                    <div className="text-xs text-gray-400 mt-2">{ref.contactInfo}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Sidebar (1 col) */}
            <div className="col-span-1 flex flex-col gap-8">
                {skills.length > 0 && (
                    <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                         <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">Skills</h3>
                         <div className="flex flex-wrap gap-2">
                             {skills.map((skill, i) => (
                                 <span key={i} className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-xs font-medium shadow-sm shadow-teal-200">
                                     {skill}
                                 </span>
                             ))}
                         </div>
                    </section>
                )}

                {education.length > 0 && (
                    <section>
                        <h3 className="font-serif font-bold text-lg text-gray-900 mb-4 border-b border-gray-200 pb-2">Education</h3>
                        <div className="flex flex-col gap-5">
                            {education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="font-bold text-gray-800 text-md">{edu.institution}</div>
                                    <div className="text-teal-600 text-sm font-medium mb-1">{edu.degree}</div>
                                    <div className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default TemplateCreative;