import React from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe, ExternalLink, Calendar } from 'lucide-react';

interface Props {
  data: ResumeData;
}

const TemplatePicture: React.FC<Props> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills, projects, references, customSections } = data;

  return (
    <div className="w-full min-h-full bg-white text-slate-800 font-sans flex">
      {/* Left Sidebar - Fixed Width */}
      <aside className="w-[30%] min-w-[220px] max-w-[280px] bg-[#1e293b] text-white flex flex-col shrink-0 print:bg-[#1e293b] print:text-white">
        {/* Profile Picture Container */}
        <div className="p-6 pb-2 flex flex-col items-center">
           <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-600 shadow-xl mb-4 bg-slate-800 shrink-0">
            {personalInfo.profilePicture ? (
              <img 
                src={personalInfo.profilePicture} 
                alt={personalInfo.fullName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-4xl font-bold bg-slate-800">
                 {personalInfo.fullName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 px-6 py-4 flex flex-col gap-8">
          
          {/* Contact Info */}
          <div className="flex flex-col gap-3 text-sm">
            <div className="uppercase tracking-widest text-xs font-bold text-slate-400 border-b border-slate-700 pb-2 mb-1">
              Contact
            </div>
            
            {personalInfo.email && (
              <div className="flex flex-col gap-1">
                 <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Mail size={10} /> Email
                 </div>
                 <span className="break-all text-sm font-light">{personalInfo.email}</span>
              </div>
            )}
            
            {personalInfo.phone && (
              <div className="flex flex-col gap-1">
                 <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Phone size={10} /> Phone
                 </div>
                 <span className="text-sm font-light">{personalInfo.phone}</span>
              </div>
            )}
            
            {personalInfo.location && (
               <div className="flex flex-col gap-1">
                 <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <MapPin size={10} /> Location
                 </div>
                 <span className="text-sm font-light">{personalInfo.location}</span>
              </div>
            )}

            {personalInfo.linkedin && (
               <div className="flex flex-col gap-1">
                 <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Linkedin size={10} /> LinkedIn
                 </div>
                 <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="break-all text-sm font-light hover:text-blue-300 transition-colors">
                    {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                 </a>
              </div>
            )}
            
            {personalInfo.website && (
               <div className="flex flex-col gap-1">
                 <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Globe size={10} /> Website
                 </div>
                 <a href={personalInfo.website} target="_blank" rel="noreferrer" className="break-all text-sm font-light hover:text-blue-300 transition-colors">
                    {personalInfo.website.replace(/^https?:\/\//, '')}
                 </a>
              </div>
            )}
          </div>

          {/* Education Sidebar */}
          {education.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="uppercase tracking-widest text-xs font-bold text-slate-400 border-b border-slate-700 pb-2 mb-1">
                Education
              </div>
              <div className="flex flex-col gap-4">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold text-white text-sm leading-tight">{edu.institution}</div>
                    <div className="text-blue-300 text-xs mt-0.5">{edu.degree}</div>
                    <div className="text-slate-500 text-[10px] mt-1 font-medium">
                      {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Sidebar */}
          {skills.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="uppercase tracking-widest text-xs font-bold text-slate-400 border-b border-slate-700 pb-2 mb-1">
                Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-200">
                    {skill}
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
        <header className="border-b-2 border-slate-100 pb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 uppercase tracking-tight mb-2 leading-none">
            {personalInfo.fullName}
          </h1>
          <p className="text-xl text-slate-500 uppercase tracking-widest font-light">
            {personalInfo.jobTitle}
          </p>
        </header>

        {/* Profile Summary */}
        {summary && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-3 flex items-center gap-2">
               <span className="w-8 h-0.5 bg-slate-800"></span> Profile
            </h3>
            <p className="text-sm leading-7 text-slate-600 text-justify">
              {summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
               <span className="w-8 h-0.5 bg-slate-800"></span> Experience
            </h3>
            <div className="flex flex-col gap-8">
              {experience.map((exp) => (
                <div key={exp.id} className="group">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h4 className="text-lg font-bold text-slate-800">{exp.role}</h4>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 px-2 py-1 rounded mt-1 sm:mt-0 whitespace-nowrap">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <span className="font-bold text-slate-700">{exp.company}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 italic">{exp.location}</span>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line pl-3 border-l-2 border-slate-100 group-hover:border-slate-200 transition-colors">
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
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
               <span className="w-8 h-0.5 bg-slate-800"></span> Projects
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-slate-50 p-4 rounded border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                     <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {project.name}
                        {project.link && <ExternalLink size={12} className="text-slate-400" />}
                     </h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white text-slate-600 border border-slate-200 rounded-full font-medium">
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
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
                   <span className="w-8 h-0.5 bg-slate-800"></span> {section.title}
                </h3>
                <div className="flex flex-col gap-6">
                    {section.items.map((item) => (
                        <div key={item.id}>
                             <div className="flex justify-between items-baseline mb-1">
                                <h4 className="text-md font-bold text-slate-800">{item.name}</h4>
                                {(item.startDate || item.endDate) && (
                                    <span className="text-xs text-slate-500 font-medium">
                                        {item.startDate} {item.endDate ? `- ${item.endDate}` : ''}
                                    </span>
                                )}
                            </div>
                            {item.location && <div className="text-xs text-slate-400 uppercase mb-1">{item.location}</div>}
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        ))}

        {/* References (Main Column) */}
        {references.length > 0 && (
             <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
                   <span className="w-8 h-0.5 bg-slate-800"></span> References
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {references.map((ref) => (
                        <div key={ref.id} className="p-4 border border-slate-100 rounded bg-white">
                            <div className="font-bold text-slate-900 text-sm">{ref.name}</div>
                            <div className="text-xs text-slate-600 mt-0.5 font-medium">{ref.role}</div>
                            <div className="text-xs text-slate-500">{ref.company}</div>
                            <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-50 flex items-center gap-2">
                                <Mail size={10} />
                                {ref.contactInfo}
                            </div>
                        </div>
                    ))}
                </div>
             </section>
        )}

      </main>
    </div>
  );
};

export default TemplatePicture;