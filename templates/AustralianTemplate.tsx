import React from 'react';
import type { ResumeData } from '../types';

const AustralianTemplate: React.FC<{ data: ResumeData; showWatermark?: boolean; }> = ({ data, showWatermark = false }) => {
    const { personalDetails, summary, experience, education, skills } = data;

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
                <h1 className="text-3xl font-bold tracking-wider uppercase">{personalDetails.fullName || 'FULL NAME'}</h1>
                <p className="text-lg mt-1">{personalDetails.jobTitle || 'Title e.g. Marketing manager'}</p>
            </div>

            <div className="flex flex-grow">
                <div className="p-6 w-[220px] flex-shrink-0 border-r border-slate-300"> {/* Left Column */}
                    <LeftColumnSection title="Contact">
                        <div className="space-y-3">
                            <div>
                                <p className="font-bold">Email</p>
                                <p className="break-words">{personalDetails.email || '[Insert email address]'}</p>
                            </div>
                            <div>
                                <p className="font-bold">Phone</p>
                                <p>{personalDetails.phone || '[Insert mobile number]'}</p>
                            </div>
                            <div>
                                <p className="font-bold">Address</p>
                                <p>{personalDetails.address || '[Suburb, state, postcode]'}</p>
                            </div>
                            <div>
                                <p className="font-bold">LinkedIn</p>
                                <a href={personalDetails.linkedin || '#'} className="break-words text-blue-600 hover:underline">{personalDetails.linkedin || '[Insert LinkedIn URL]'}</a>
                            </div>
                        </div>
                    </LeftColumnSection>

                    <LeftColumnSection title="Key skills">
                        <ul className="list-disc list-inside space-y-1">
                            {skills.length > 0 && skills.some(s => s.name) ? (
                                skills.map(skill => skill.name && <li key={skill.id}>{skill.name}</li>)
                            ) : (
                                <>
                                    <li>Skill one</li>
                                    <li>E.g. Language spoken</li>
                                    <li>E.g. IT proficiencies</li>
                                    <li>E.g. Technical skills</li>
                                    <li>E.g. Soft skills</li>
                                    <li>Include up to 8 skills</li>
                                </>
                            )}
                        </ul>
                    </LeftColumnSection>
                    
                    <LeftColumnSection title="References">
                         <div className="space-y-4">
                            <div>
                                <p className="font-bold">Name</p>
                                <p>Position/Title</p>
                                <p>Organisation</p>
                                <p>Country & Location</p>
                                <p>Phone Number</p>
                                <p>Email address</p>
                            </div>
                            <div>
                                <p className="font-bold">Name</p>
                                <p>Position/Title</p>
                                <p>Organisation</p>
                                <p>Country & Location</p>
                                <p>Phone Number</p>
                                <p>Email address</p>
                            </div>
                        </div>
                    </LeftColumnSection>
                </div>

                <div className="p-6 flex-grow"> {/* Right Column */}
                    <RightColumnSection title="Profile">
                        <p className="text-justify">{summary || 'Include 2-3 sentences to highlight your key skills and experience. This is also your opportunity to tailor your resume with keywords from the job description.'}</p>
                    </RightColumnSection>
                    
                    {(education.length > 0 ? education : [{id: 'placeholder'}]).map(edu => (
                        <RightColumnSection key={edu.id} title="Education">
                            <div className="mb-3">
                                <h3 className="text-sm font-bold">{edu.degree || 'Course or qualification'}</h3>
                                <p className="italic">{edu.institution || 'Institution name & country'}</p>
                                <p className="text-gray-600">Graduated {edu.gradDate || 'YYYY'}</p>
                                <ul className="list-disc list-inside pl-2 mt-1">
                                    <li>Include any special accreditations, scholarship awards, academic prizes or acknowledgements underneath the relevant qualification</li>
                                </ul>
                            </div>
                        </RightColumnSection>
                    ))}

                    {(experience.length > 0 ? experience : [{id: 'placeholder'}]).map(exp => (
                        <RightColumnSection key={exp.id} title="Employment">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold">{exp.jobTitle || 'Role Title'}</h3>
                                <p className="italic">{exp.company || 'Company Name'}</p>
                                <p className="text-gray-600 text-xs mb-1">{exp.startDate || 'Month YYYY'} - {exp.endDate || 'Month YYYY'}</p>
                                <p className="mb-1">Overview of role in 1 to 2 lines (include company description if relatively unknown)</p>
                                <ul className="list-disc list-inside pl-2 space-y-1">
                                    {exp.description ? (
                                        exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '')}</li>)
                                    ) : (
                                        <li>Insert 2 to 3 key accomplishments</li>
                                    )}
                                </ul>
                            </div>
                        </RightColumnSection>
                    ))}

                     <RightColumnSection title="Volunteer experience">
                        <ul className="list-disc list-inside space-y-1">
                            <li>Include any work experience, internships or other industry exposure</li>
                        </ul>
                    </RightColumnSection>
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
