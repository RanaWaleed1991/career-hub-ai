import React from 'react';
import type { ResumeData } from '../types';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, GlobeAltIcon, LinkedinIcon, UserCircleIcon } from '../components/icons';

const CreativeTemplate: React.FC<{ data: ResumeData; showWatermark?: boolean; }> = ({ data, showWatermark = false }) => {
    const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

    const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div>
            <h2 className="text-xl font-serif text-white border-b-2 border-white pb-1 mb-3">{title}</h2>
            {children}
        </div>
    );

    const MainSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="mb-6">
            <h2 className="text-2xl font-serif text-[#472f2f] border-b-2 border-[#472f2f] pb-1 mb-4">{title}</h2>
            {children}
        </div>
    );

    return (
        <div className="font-sans grid grid-cols-3 min-h-full">
            {/* Left Sidebar */}
            <div className="col-span-1 bg-[#4a5c43] p-6 text-white space-y-8">
                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {personalDetails.photo ? (
                        <img src={personalDetails.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <UserCircleIcon className="w-32 h-32 text-gray-400" />
                        </div>
                    )}
                </div>

                <SidebarSection title="PROFILE">
                    <p className="text-sm leading-relaxed">{summary}</p>
                </SidebarSection>
                
                <SidebarSection title="CONTACT">
                    <ul className="space-y-2 text-sm break-words">
                        {personalDetails.phone && <li className="flex items-center"><PhoneIcon className="w-4 h-4 mr-2" />{personalDetails.phone}</li>}
                        {personalDetails.address && <li className="flex items-center"><MapPinIcon className="w-4 h-4 mr-2" />{personalDetails.address}</li>}
                        {personalDetails.email && <li className="flex items-center"><EnvelopeIcon className="w-4 h-4 mr-2" />{personalDetails.email}</li>}
                        {personalDetails.website && <li className="flex items-center"><GlobeAltIcon className="w-4 h-4 mr-2" /><a href={personalDetails.website} className="hover:underline">{personalDetails.website}</a></li>}
                         {personalDetails.linkedin && <li className="flex items-center"><LinkedinIcon className="w-4 h-4 mr-2" /><a href={personalDetails.linkedin} className="hover:underline">LinkedIn</a></li>}
                    </ul>
                </SidebarSection>

                {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
                    <SidebarSection title="CERTIFICATIONS">
                        {certifications.filter(c => c.name).map(cert => (
                            <div key={cert.id} className="mb-3 text-sm">
                                <p className="font-bold">{cert.name}</p>
                                <p>{cert.issuer}</p>
                                <p className="text-xs opacity-80">{cert.date}</p>
                                {cert.credentialId && <p className="text-xs opacity-70">ID: {cert.credentialId}</p>}
                            </div>
                        ))}
                    </SidebarSection>
                )}

                {references && references.length > 0 && references.some(r => r.name) && (
                    <SidebarSection title="REFERENCES">
                        {references.filter(r => r.name).map(ref => (
                            <div key={ref.id} className="mb-3 text-sm">
                                <p className="font-bold">{ref.name}</p>
                                <p>{ref.title}</p>
                                <p>{ref.company}</p>
                                <p className="text-xs opacity-80">{ref.relationship}</p>
                                {ref.phone && <p className="text-xs opacity-70">{ref.phone}</p>}
                                {ref.email && <p className="text-xs opacity-70 break-words">{ref.email}</p>}
                            </div>
                        ))}
                    </SidebarSection>
                )}
            </div>

            {/* Main Content */}
            <div className="col-span-2 bg-[#e1dcd5] text-[#472f2f]">
                <header className="bg-[#d4c0a1] p-8">
                     <h1 className="text-5xl font-serif font-bold tracking-wider">{personalDetails.fullName}</h1>
                     <p className="text-2xl font-serif mt-2">{personalDetails.jobTitle}</p>
                </header>

                <main className="p-8">
                    <MainSection title="WORK EXPERIENCE">
                        {experience.map(exp => (
                            <div key={exp.id} className="mb-4">
                                <h3 className="text-lg font-bold">{exp.jobTitle}</h3>
                                <div className="flex justify-between text-sm italic mb-1">
                                    <span>{exp.company}</span>
                                    <span>{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                                        <li key={i}>{line.replace(/^- /, '')}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </MainSection>

                    <MainSection title="EDUCATION">
                        {education.map(edu => (
                            <div key={edu.id} className="mb-3">
                                <h3 className="text-lg font-bold">{edu.degree}</h3>
                                <div className="flex justify-between text-sm italic">
                                    <span>{edu.institution}</span>
                                    <span>{edu.gradDate}</span>
                                </div>
                            </div>
                        ))}
                    </MainSection>

                    {skills.length > 0 && skills.some(s => s.name) && (
                        <MainSection title={(skillsLabel || 'SKILLS').toUpperCase()}>
                            <ul className="list-disc list-inside grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                 {skills.filter(s => s.name).map(skill => <li key={skill.id}>{skill.name}</li>)}
                            </ul>
                        </MainSection>
                    )}

                    {/* Custom Sections */}
                    {customSections && customSections.length > 0 && customSections.some(s => s.title) && (
                        <>
                            {customSections
                                .filter(s => s.title)
                                .sort((a, b) => a.order - b.order)
                                .map(section => (
                                    <MainSection key={section.id} title={section.title.toUpperCase()}>
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
                                                return <p key={i} className="mb-2">{cleanLine}</p>;
                                            })}
                                        </div>
                                    </MainSection>
                                ))}
                        </>
                    )}

                    {showWatermark && (
                        <div className="text-center mt-10">
                            <p className="text-xs text-gray-500">
                                Built with Career Hub AI - <span className="font-semibold text-gray-600">Get Premium</span>
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CreativeTemplate;