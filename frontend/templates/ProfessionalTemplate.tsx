import React from 'react';
import type { ResumeData } from '../types';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, GlobeAltIcon, UserCircleIcon } from '../components/icons';

interface TemplateProps {
  data: ResumeData;
  showWatermark?: boolean;
}

const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, showWatermark = false }) => {
  const { personalDetails, summary, experience, education, skills } = data;

  // Skill bar component for visual representation
  const SkillBar: React.FC<{ name: string }> = ({ name }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-slate-100">{name}</span>
      </div>
      <div className="w-full bg-blue-950/30 rounded-full h-2">
        <div className="bg-blue-400 h-2 rounded-full" style={{ width: '85%' }}></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white flex font-sans text-gray-800 min-h-full">
      {/* Left Sidebar - Navy Blue */}
      <div className="w-[35%] bg-[#1e3a8a] text-white p-8 flex flex-col">
        {/* Profile Photo */}
        <div className="mb-6">
          <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
            {personalDetails.photo ? (
              <img
                src={personalDetails.photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-700 flex items-center justify-center">
                <UserCircleIcon className="w-32 h-32 text-blue-300" />
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4 pb-2 border-b-2 border-blue-400">
            Contact
          </h2>
          <div className="space-y-3 text-sm">
            {personalDetails.phone && (
              <div className="flex items-start gap-3">
                <PhoneIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-300" />
                <span className="break-words">{personalDetails.phone}</span>
              </div>
            )}
            {personalDetails.email && (
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-300" />
                <span className="break-words">{personalDetails.email}</span>
              </div>
            )}
            {personalDetails.address && (
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-300" />
                <span className="break-words">{personalDetails.address}</span>
              </div>
            )}
            {personalDetails.linkedin && (
              <div className="flex items-start gap-3">
                <GlobeAltIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-300" />
                <a
                  href={personalDetails.linkedin}
                  className="text-blue-200 hover:text-white hover:underline break-all"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}
            {personalDetails.website && (
              <div className="flex items-start gap-3">
                <GlobeAltIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-300" />
                <a
                  href={personalDetails.website}
                  className="text-blue-200 hover:text-white hover:underline break-all"
                >
                  {personalDetails.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section with Visual Bars */}
        {skills.length > 0 && skills.some(s => s.name) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 pb-2 border-b-2 border-blue-400">
              Skills
            </h2>
            <div className="space-y-2">
              {skills.filter(s => s.name).map(skill => (
                <SkillBar key={skill.id} name={skill.name} />
              ))}
            </div>
          </div>
        )}

        {/* Education in Sidebar */}
        {education.length > 0 && (
          <div className="mt-auto">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 pb-2 border-b-2 border-blue-400">
              Education
            </h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-4 last:mb-0">
                <h3 className="text-sm font-bold text-blue-100">{edu.degree}</h3>
                <p className="text-xs text-blue-200 mt-1">{edu.institution}</p>
                <p className="text-xs text-blue-300 mt-0.5">
                  {edu.gradDate} {edu.location && `• ${edu.location}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Main Content */}
      <div className="w-[65%] p-10 flex flex-col">
        {/* Name and Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1e3a8a] tracking-tight">
            {personalDetails.fullName}
          </h1>
          <p className="text-xl text-slate-600 mt-2 font-medium">
            {personalDetails.jobTitle}
          </p>
          <div className="w-20 h-1 bg-[#1e3a8a] mt-3"></div>
        </div>

        {/* Professional Summary */}
        {summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1e3a8a] uppercase tracking-wide mb-3 pb-2 border-b-2 border-slate-300">
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              {summary}
            </p>
          </div>
        )}

        {/* Professional Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1e3a8a] uppercase tracking-wide mb-4 pb-2 border-b-2 border-slate-300">
              Professional Experience
            </h2>
            {experience.map((exp, index) => (
              <div key={exp.id} className={`${index > 0 ? 'mt-6' : ''} mb-6`}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    {exp.jobTitle}
                  </h3>
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-4">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <p className="text-md font-semibold text-[#1e3a8a]">
                    {exp.company}
                  </p>
                  <p className="text-xs text-slate-500 ml-4">
                    {exp.location}
                  </p>
                </div>
                <ul className="list-disc list-outside ml-5 text-sm space-y-1.5 text-slate-700">
                  {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                    <li key={i} className="leading-relaxed">
                      {line.replace(/^[-•]\s*/, '')}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Watermark */}
        {showWatermark && (
          <div className="mt-auto pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-400">
              Built with Career Hub AI - <span className="font-semibold text-slate-500">Get Premium</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTemplate;
