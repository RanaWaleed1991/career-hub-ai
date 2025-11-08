import React from 'react';
import type { ResumeData } from '../types';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, UserCircleIcon } from '../components/icons';

const ElegantTemplate: React.FC<{ data: ResumeData; showWatermark?: boolean; }> = ({ data, showWatermark = false }) => {
    const { personalDetails, summary, experience, education, skills } = data;

    const LeftSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
      <div className="bg-[#c4c19f] p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-[#3a392b] mb-2">{title}</h2>
        <div className="text-sm text-[#3a392b]">
            {children}
        </div>
      </div>
    );
    
    return (
        <div className="font-sans grid grid-cols-3">
            {/* Left Column */}
            <div className="col-span-1 bg-[#706c4f] p-6 text-[#fdfaef] space-y-6">
                <div className="w-32 h-32 mx-auto mb-4 rounded-md overflow-hidden border-2 border-[#c4c19f] shadow-md">
                    {personalDetails.photo ? (
                        <img src={personalDetails.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <UserCircleIcon className="w-24 h-24 text-gray-400" />
                        </div>
                    )}
                </div>
                
                <div className="border-b-2 border-[#fdfaef] pb-4 text-center">
                    <h1 className="text-4xl font-serif font-bold">{personalDetails.fullName}</h1>
                    <p className="text-lg mt-1">{personalDetails.jobTitle}</p>
                </div>
                
                <p className="text-sm leading-relaxed">{summary}</p>

                {education.length > 0 && (
                    <LeftSection title="Education">
                        {education.map(edu => (
                            <div key={edu.id} className="mb-3 last:mb-0">
                                <h3 className="font-bold">{edu.degree}</h3>
                                <p>{edu.institution}</p>
                                <p className="text-xs opacity-80">{edu.gradDate} &bull; {edu.location}</p>
                            </div>
                        ))}
                    </LeftSection>
                )}

                {skills.length > 0 && skills.some(s => s.name) && (
                    <LeftSection title="Skills">
                        <ul className="list-disc list-inside space-y-1">
                            {skills.map(skill => skill.name && <li key={skill.id}>{skill.name}</li>)}
                        </ul>
                    </LeftSection>
                )}
            </div>

            {/* Right Column */}
            <div className="col-span-2 bg-[#fdfaef] p-8 text-[#706c4f]">
                 <h2 className="text-2xl font-semibold border-b-2 border-[#706c4f] pb-2 mb-6">Professional Experience</h2>

                {experience.map(exp => (
                    <div key={exp.id} className="mb-6">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-lg font-bold">{exp.jobTitle}</h3>
                            <p className="text-xs font-medium">{exp.startDate} - {exp.endDate}</p>
                        </div>
                        <p className="font-semibold italic mb-2">{exp.company}, {exp.location}</p>
                        <ul className="space-y-1 text-sm list-['❖'] list-inside">
                            {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                                <li key={i} className="pl-2">{line.replace(/^- /, '')}</li>
                            ))}
                        </ul>
                    </div>
                ))}
                
                <div className="mt-12 pt-6 border-t-2 border-[#706c4f]">
                     <h2 className="text-2xl font-semibold mb-4">Contact</h2>
                     <div className="flex flex-col space-y-2 text-sm">
                        {personalDetails.phone && <span className="flex items-center gap-2"><PhoneIcon className="w-4 h-4"/> {personalDetails.phone}</span>}
                        {personalDetails.email && <span className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4"/> {personalDetails.email}</span>}
                        {personalDetails.address && <span className="flex items-center gap-2"><MapPinIcon className="w-4 h-4"/> {personalDetails.address}</span>}
                     </div>
                </div>

                {showWatermark && (
                <div className="text-center mt-10">
                    <p className="text-xs text-gray-400">
                        Built with Career Hub AI - <span className="font-semibold text-gray-500">Get Premium</span>
                    </p>
                </div>
            )}
            </div>
        </div>
    );
};

export default ElegantTemplate;