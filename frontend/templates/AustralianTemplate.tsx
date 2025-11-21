import React from 'react';
import type { ResumeData } from '../types';

const AustralianTemplate: React.FC<{ data: ResumeData; showWatermark?: boolean; }> = ({ data, showWatermark = false }) => {
    const { personalDetails, summary, experience, education, skills, skillsLabel, certifications, references, customSections } = data;

    const RightColumnSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
        <div className="mb-4">
            <h2 className="text-xs font-bold text-slate-900 pb-1 mb-2 uppercase tracking-wider">{title}</h2>
            <hr className="border-slate-400 mb-2" />
            <div className="text-xs leading-relaxed">
                {children}
            </div>
        </div>
    );

    const LeftColumnSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
        <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 pb-1 mb-2">{title}</h2>
            <div className="text-xs leading-relaxed">
                {children}
            </div>
        </div>
    );

    return (
        <div className="bg-white font-sans text-gray-900 flex flex-col h-full">
            {/* Header */}
            <div className="bg-[#2d4373] text-white text-center p-6">
                <h1 className="text-3xl font-bold tracking-wider uppercase">{personalDetails.fullName}</h1>
                <p className="text-lg mt-1">{personalDetails.jobTitle}</p>
            </div>

            <div className="flex flex-grow">
                <div className="p-6 w-[220px] flex-shrink-0 border-r border-slate-300"> {/* Left Column */}
                    {/* Contact */}
                    <LeftColumnSection title="Contact">
                        <div className="space-y-3">
                            {personalDetails.email && (
                                <div>
                                    <p className="font-bold">Email</p>
                                    <p className="break-words">{personalDetails.email}</p>
                                </div>
                            )}
                            {personalDetails.phone && (
                                <div>
                                    <p className="font-bold">Phone</p>
                                    <p>{personalDetails.phone}</p>
                                </div>
                            )}
                            {personalDetails.address && (
                                <div>
                                    <p className="font-bold">Address</p>
                                    <p>{personalDetails.address}</p>
                                </div>
                            )}
                            {personalDetails.linkedin && (
                                <div>
                                    <p className="font-bold">LinkedIn</p>
                                    <a href={personalDetails.linkedin} className="break-words text-blue-600 hover:underline text-xs">{personalDetails.linkedin}</a>
                                </div>
                            )}
                            {personalDetails.website && (
                                <div>
                                    <p className="font-bold">Website</p>
                                    <a href={personalDetails.website} className="break-words text-blue-600 hover:underline text-xs">{personalDetails.website}</a>
                                </div>
                            )}
                        </div>
                    </LeftColumnSection>

                    {/* Skills */}
                    {skills.length > 0 && skills.some(s => s.name) && (
                        <LeftColumnSection title={skillsLabel || "Key Skills"}>
                            <ul className="list-disc list-inside space-y-1">
                                {skills.filter(s => s.name).map(skill => (
                                    <li key={skill.id}>{skill.name}</li>
                                ))}
                            </ul>
                        </LeftColumnSection>
                    )}

                    {/* Certifications */}
                    {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
                        <LeftColumnSection title="Certifications">
                            <div className="space-y-3">
                                {certifications.filter(c => c.name).map(cert => (
                                    <div key={cert.id}>
                                        <p className="font-bold">{cert.name}</p>
                                        <p>{cert.issuer}</p>
                                        <p className="text-gray-600">{cert.date}</p>
                                        {cert.credentialId && <p className="text-xs">ID: {cert.credentialId}</p>}
                                    </div>
                                ))}
                            </div>
                        </LeftColumnSection>
                    )}

                    {/* References */}
                    {references && references.length > 0 && references.some(r => r.name) && (
                        <LeftColumnSection title="References">
                            <div className="space-y-4">
                                {references.filter(r => r.name).map(ref => (
                                    <div key={ref.id}>
                                        <p className="font-bold">{ref.name}</p>
                                        <p>{ref.title}</p>
                                        <p>{ref.company}</p>
                                        <p className="text-xs text-gray-600">{ref.relationship}</p>
                                        {ref.phone && <p className="text-xs">{ref.phone}</p>}
                                        {ref.email && <p className="text-xs break-words">{ref.email}</p>}
                                    </div>
                                ))}
                            </div>
                        </LeftColumnSection>
                    )}
                </div>

                <div className="p-6 flex-grow"> {/* Right Column */}
                    {/* Profile/Summary */}
                    {summary && (
                        <RightColumnSection title="Profile">
                            <p className="text-justify">{summary}</p>
                        </RightColumnSection>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <RightColumnSection title="Education">
                            {education.map(edu => (
                                <div key={edu.id} className="mb-3">
                                    <h3 className="text-sm font-bold">{edu.degree}</h3>
                                    <p className="italic">{edu.institution}</p>
                                    {edu.location && <p className="text-gray-600 text-xs">{edu.location}</p>}
                                    <p className="text-gray-600">Graduated {edu.gradDate}</p>
                                </div>
                            ))}
                        </RightColumnSection>
                    )}

                    {/* Employment/Experience */}
                    {experience.length > 0 && (
                        <RightColumnSection title="Employment">
                            {experience.map(exp => (
                                <div key={exp.id} className="mb-4">
                                    <h3 className="text-sm font-bold">{exp.jobTitle}</h3>
                                    <p className="italic">{exp.company}</p>
                                    <p className="text-gray-600 text-xs mb-1">
                                        {exp.startDate} - {exp.endDate} {exp.location && `• ${exp.location}`}
                                    </p>
                                    {exp.description && (
                                        <ul className="list-disc list-inside pl-2 space-y-1">
                                            {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                                                <li key={i}>{line.replace(/^[-•]\s*/, '')}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </RightColumnSection>
                    )}

                    {/* Custom Sections */}
                    {customSections && customSections.length > 0 && customSections.some(s => s.title) && (
                        <>
                            {customSections
                                .filter(s => s.title)
                                .sort((a, b) => a.order - b.order)
                                .map(section => (
                                    <RightColumnSection key={section.id} title={section.title}>
                                        {section.content.split('\n').filter(line => line.trim()).map((line, i) => {
                                            const cleanLine = line.trim();
                                            if (cleanLine.startsWith('-') || cleanLine.startsWith('•')) {
                                                return <li key={i} className="ml-4">{cleanLine.replace(/^[-•]\s*/, '')}</li>;
                                            }
                                            return <p key={i} className="mb-1">{cleanLine}</p>;
                                        })}
                                    </RightColumnSection>
                                ))}
                        </>
                    )}
                </div>
            </div>

            <div className="px-6 pb-4 text-xs text-slate-500 mt-auto">
                 {showWatermark && (
                    <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-400">
                            Built with Career Hub AI - <span className="font-semibold text-gray-500">Get Premium</span>
                        </p>
                    </div>
                  )}
                <p className="mt-4">Document Classification: Public</p>
            </div>
        </div>
    );
};

export default AustralianTemplate;
