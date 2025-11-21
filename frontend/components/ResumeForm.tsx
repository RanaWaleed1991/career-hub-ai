import React from 'react';
import type { ResumeData, Experience, Education, Skill } from '../types';
import AIAssistButton from './AIAssistButton';
import { PlusCircleIcon, MinusCircleIcon, TipIcon, UserCircleIcon } from './icons';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onEnhance: (field: 'summary' | 'experience', text: string, index?: number) => void;
  isAiLoading: { field: string; index?: number } | null;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData, onEnhance, isAiLoading }) => {
  const handleChange = <T,>(
    section: keyof ResumeData,
    index: number | null = null,
    field: keyof T
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setResumeData(prev => {
      if (index !== null && Array.isArray(prev[section])) {
        const newArr = [...(prev[section] as T[])];
        newArr[index] = { ...newArr[index], [field]: value };
        return { ...prev, [section]: newArr };
      }
      return { ...prev, [section]: { ...(prev[section] as object), [field]: value } };
    });
  };

  const handleSimpleChange = (section: keyof ResumeData) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeData(prev => ({ ...prev, [section]: e.target.value }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now().toString(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  };
  
  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now().toString(), degree: '', institution: '', location: '', gradDate: '' }],
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, { id: Date.now().toString(), name: '' }],
    }));
  };

  const removeSkill = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id),
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData(prev => ({
          ...prev,
          personalDetails: {
            ...prev.personalDetails,
            photo: reader.result as string,
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
     setResumeData(prev => ({
        ...prev,
        personalDetails: {
          ...prev.personalDetails,
          photo: '',
        }
      }));
  }

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="p-6 space-y-8 bg-slate-50 overflow-y-auto h-full">
      {/* Personal Details */}
      <fieldset className="space-y-4 opacity-0 slide-in-up" style={{ animationDelay: '100ms' }}>
        <legend className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 w-full">Personal Details</legend>
        
        <div>
            <label className={labelClass}>Photo (optional for Creative & Professional templates)</label>
            <div className="mt-1 flex items-center space-x-4">
                <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100 border">
                    {resumeData.personalDetails.photo ? (
                        <img src={resumeData.personalDetails.photo} alt="User" className="h-full w-full object-cover" />
                    ) : (
                        <UserCircleIcon className="h-full w-full text-gray-300" />
                    )}
                </span>
                <div className="flex flex-col space-y-2">
                    <label htmlFor="photo-upload" className="cursor-pointer rounded-md bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <span>Change</span>
                        <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handlePhotoChange} />
                    </label>
                    {resumeData.personalDetails.photo && (
                        <button type="button" onClick={removePhoto} className="rounded-md bg-red-50 py-1.5 px-2.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-100">
                            Remove
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input type="text" value={resumeData.personalDetails.fullName} onChange={handleChange('personalDetails', null, 'fullName')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Job Title</label>
            <input type="text" value={resumeData.personalDetails.jobTitle} onChange={handleChange('personalDetails', null, 'jobTitle')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" value={resumeData.personalDetails.email} onChange={handleChange('personalDetails', null, 'email')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" value={resumeData.personalDetails.phone} onChange={handleChange('personalDetails', null, 'phone')} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Address</label>
            <input type="text" value={resumeData.personalDetails.address} onChange={handleChange('personalDetails', null, 'address')} className={inputClass} />
          </div>
           <div>
            <label className={labelClass}>LinkedIn Profile</label>
            <input type="url" value={resumeData.personalDetails.linkedin} onChange={handleChange('personalDetails', null, 'linkedin')} className={inputClass} />
          </div>
           <div>
            <label className={labelClass}>Website/Portfolio</label>
            <input type="url" value={resumeData.personalDetails.website} onChange={handleChange('personalDetails', null, 'website')} className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Professional Summary */}
      <fieldset className="space-y-1 opacity-0 slide-in-up" style={{ animationDelay: '200ms' }}>
        <legend className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 w-full mb-4">Professional Summary</legend>
        <div className="relative">
          <textarea rows={4} value={resumeData.summary} onChange={handleSimpleChange('summary')} className={`${inputClass} pr-12`} />
          <AIAssistButton 
            onClick={() => onEnhance('summary', resumeData.summary)}
            isLoading={isAiLoading?.field === 'summary'}
          />
        </div>
        <div className="flex items-start text-sm text-slate-500 mt-2 p-2 bg-slate-100 rounded-md">
          <TipIcon className="w-5 h-5 mr-2 flex-shrink-0 text-slate-400" />
          <span>Write 2-3 sentences about your top skills and accomplishments. Our AI can help you refine it!</span>
        </div>
      </fieldset>

      {/* Work Experience */}
      <fieldset className="space-y-4 opacity-0 slide-in-up" style={{ animationDelay: '300ms' }}>
        <legend className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 w-full">Work Experience</legend>
        {resumeData.experience.map((exp, index) => (
          <div key={exp.id} className="p-4 border border-slate-200 rounded-lg space-y-4 bg-white relative shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Job Title</label>
                <input type="text" value={exp.jobTitle} onChange={handleChange<Experience>('experience', index, 'jobTitle')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Company</label>
                <input type="text" value={exp.company} onChange={handleChange<Experience>('experience', index, 'company')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input type="text" value={exp.location} onChange={handleChange<Experience>('experience', index, 'location')} className={inputClass} />
              </div>
               <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input type="text" placeholder="e.g. Jan 2020" value={exp.startDate} onChange={handleChange<Experience>('experience', index, 'startDate')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input type="text" placeholder="e.g. Present" value={exp.endDate} onChange={handleChange<Experience>('experience', index, 'endDate')} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="relative">
              <label className={labelClass}>Description</label>
              <textarea rows={5} value={exp.description} onChange={handleChange<Experience>('experience', index, 'description')} className={`${inputClass} pr-12`} placeholder="Describe your responsibilities and achievements in bullet points."/>
              <AIAssistButton 
                onClick={() => onEnhance('experience', exp.description, index)}
                isLoading={isAiLoading?.field === 'experience' && isAiLoading.index === index}
              />
            </div>
            <button type="button" onClick={() => removeExperience(exp.id)} className="absolute -top-2 -right-2 text-red-500 hover:text-red-700">
              <MinusCircleIcon />
            </button>
          </div>
        ))}
        <button type="button" onClick={addExperience} className="flex items-center space-x-2 text-indigo-600 font-medium hover:text-indigo-800">
          <PlusCircleIcon />
          <span>Add Experience</span>
        </button>
      </fieldset>

      {/* Education */}
      <fieldset className="space-y-4 opacity-0 slide-in-up" style={{ animationDelay: '400ms' }}>
        <legend className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 w-full">Education</legend>
        {resumeData.education.map((edu, index) => (
          <div key={edu.id} className="p-4 border border-slate-200 rounded-lg space-y-4 bg-white relative shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Degree / Certificate</label>
                <input type="text" value={edu.degree} onChange={handleChange<Education>('education', index, 'degree')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Institution</label>
                <input type="text" value={edu.institution} onChange={handleChange<Education>('education', index, 'institution')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input type="text" value={edu.location} onChange={handleChange<Education>('education', index, 'location')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Graduation Date</label>
                <input type="text" placeholder="e.g. May 2018" value={edu.gradDate} onChange={handleChange<Education>('education', index, 'gradDate')} className={inputClass} />
              </div>
            </div>
            <button type="button" onClick={() => removeEducation(edu.id)} className="absolute -top-2 -right-2 text-red-500 hover:text-red-700">
              <MinusCircleIcon />
            </button>
          </div>
        ))}
        <button type="button" onClick={addEducation} className="flex items-center space-x-2 text-indigo-600 font-medium hover:text-indigo-800">
          <PlusCircleIcon />
          <span>Add Education</span>
        </button>
      </fieldset>
      
      {/* Skills */}
      <fieldset className="opacity-0 slide-in-up" style={{ animationDelay: '500ms' }}>
        <legend className="text-xl font-semibold text-slate-800 border-b border-slate-300 pb-2 w-full mb-4">Skills</legend>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {resumeData.skills.map((skill, index) => (
            <div key={skill.id} className="relative">
                <input type="text" value={skill.name} onChange={handleChange<Skill>('skills', index, 'name')} className={`${inputClass} pr-8`} placeholder="e.g. React"/>
                <button type="button" onClick={() => removeSkill(skill.id)} className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                    <MinusCircleIcon className="w-5 h-5"/>
                </button>
            </div>
            ))}
        </div>
         <button type="button" onClick={addSkill} className="mt-4 flex items-center space-x-2 text-indigo-600 font-medium hover:text-indigo-800">
          <PlusCircleIcon />
          <span>Add Skill</span>
        </button>
      </fieldset>
    </div>
  );
};

export default ResumeForm;