import React from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe, ExternalLink } from 'lucide-react';

interface Props {
  data: ResumeData;
}

const TemplateMinimal: React.FC<Props> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, projects, references, customSections } = data;

  return (
    <div className="w-full h-full bg-white text-gray-900 font-sans p-10 md:p-14 max-w-[210mm] mx-auto leading-relaxed">
        {/* Header Section */}
        <header className="flex flex-col items-center border-b-2 border-gray-900 pb-8 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase mb-2 text-center">
                {personalInfo.fullName}
            </h1>
            <p className="text-md md:text-lg tracking-[0.2em] uppercase text-gray-600 mb-4 text-center">
                {personalInfo.jobTitle}
            </p>
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600 font-medium">
                {personalInfo.email && (
                    <div className="flex items-center gap-1.5">
                        <Mail size={14} strokeWidth={2.5} />
                        <span>{personalInfo.email}</span>
                    </div>
                )}
                {personalInfo.phone && (
                     <div className="flex items-center gap-1.5">
                        <Phone size={14} strokeWidth={2.5} />
                        <span>{personalInfo.phone}</span>
                    </div>
                )}
                 {personalInfo.location && (
                     <div className="flex items-center gap-1.5">
                        <MapPin size={14} strokeWidth={2.5} />
                        <span>{personalInfo.location}</span>
                    </div>
                )}
                 {personalInfo.linkedin && (
                     <div className="flex items-center gap-1.5">
                        <Linkedin size={14} strokeWidth={2.5} />
                        <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                    </div>
                )}
                 {personalInfo.website && (
                     <div className="flex items-center gap-1.5">
                        <Globe size={14} strokeWidth={2.5} />
                        <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, '')}</span>
                    </div>
                )}
            </div>
        </header>

        {/* Main Content - Single Column for maximum content fit */}
        <div className="flex flex-col gap-8">

            {/* Summary */}
            {summary && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-3 text-gray-900">
                        Professional Summary
                    </h3>
                    <p className="text-sm text-justify text-gray-700 leading-7">
                        {summary}
                    </p>
                </section>
            )}

            {/* Skills */}
             {skills.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-3 text-gray-900">
                        Core Competencies
                    </h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                        {skills.map((skill, i) => (
                            <span key={i} className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-gray-900">
                        Experience
                    </h3>
                    <div className="flex flex-col gap-6">
                        {experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                    <h4 className="text-lg font-bold text-gray-900">{exp.role}</h4>
                                    <span className="text-sm font-medium text-gray-500 font-mono">
                                        {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-700">{exp.company}</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">{exp.location}</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

             {/* Projects */}
            {projects.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-gray-900">
                        Projects
                    </h3>
                    <div className="flex flex-col gap-4">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-gray-50 p-4 rounded-sm border-l-4 border-gray-800">
                                 <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-md font-bold text-gray-900 flex items-center gap-2">
                                        {project.name}
                                        {project.link && <ExternalLink size={12} className="text-gray-400" />}
                                    </h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500 font-mono">
                                    {project.technologies.map((tech, i) => (
                                        <span key={i}>#{tech}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {education.length > 0 && (
                <section>
                     <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-gray-900">
                        Education
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {education.map((edu) => (
                            <div key={edu.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-end">
                                <div>
                                    <h4 className="font-bold text-gray-900">{edu.institution}</h4>
                                    <div className="text-sm text-gray-700">{edu.degree}</div>
                                </div>
                                <div className="flex flex-col items-start sm:items-end mt-1 sm:mt-0">
                                     <div className="text-sm font-medium text-gray-500 font-mono">{edu.startDate} — {edu.endDate}</div>
                                     <div className="text-xs text-gray-400 uppercase">{edu.location}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Custom Sections */}
            {customSections.map((section) => (
                <section key={section.id}>
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-gray-900">
                        {section.title}
                    </h3>
                    <div className="flex flex-col gap-4">
                        {section.items.map((item) => (
                            <div key={item.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-md font-bold text-gray-900">{item.name}</h4>
                                    {(item.startDate || item.endDate) && (
                                        <span className="text-sm font-medium text-gray-500 font-mono">
                                            {item.startDate} {item.endDate ? `- ${item.endDate}` : ''}
                                        </span>
                                    )}
                                </div>
                                {item.location && <div className="text-xs text-gray-500 uppercase mb-1">{item.location}</div>}
                                <p className="text-sm text-gray-600 leading-relaxed">
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
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-4 text-gray-900">
                        References
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        {references.map((ref) => (
                            <div key={ref.id}>
                                <div className="font-bold text-gray-900">{ref.name}</div>
                                <div className="text-sm text-gray-700">{ref.role}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{ref.company}</div>
                                <div className="text-sm text-gray-600">{ref.contactInfo}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </div>
    </div>
  );
};

export default TemplateMinimal;