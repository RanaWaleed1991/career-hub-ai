import React from 'react';

const stories = [
  {
    name: 'Maria G.',
    title: 'From Warehouse to Web Developer',
    quote: "I never thought I could switch careers, but the online courses gave me the skills, and the resume builder helped me showcase them. I landed my first developer job in 6 months!",
    before: 'Warehouse Associate',
    after: 'Junior Frontend Developer'
  },
  {
    name: 'David L.',
    title: 'Landing a Dream Role at a Top Firm',
    quote: "As a recent grad, I struggled to get noticed. Using the AI assist to refine my summary and experience descriptions was a game-changer. It made my resume sound so much more professional.",
    before: 'Computer Science Graduate',
    after: 'Software Engineer at TechCorp'
  },
  {
    name: 'Sarah K.',
    title: 'The Promotion Push',
    quote: "I was ready for a senior role but wasn't sure how to position my experience. The tool helped me focus on achievements, not just duties. I applied for an internal promotion and got it!",
    before: 'Marketing Specialist',
    after: 'Senior Marketing Manager'
  }
];

const StoryCard: React.FC<{ story: typeof stories[0], index: number }> = ({ story, index }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
    <div className="flex-grow">
      <h3 className="text-xl font-bold text-slate-800 mb-2">{story.title}</h3>
      <blockquote className="border-l-4 border-amber-400 pl-4 text-slate-600 italic mb-4">
        "{story.quote}"
      </blockquote>
      <p className="font-semibold text-slate-700">- {story.name}</p>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-200 text-sm">
      <div className="flex justify-between items-center">
        <span className="text-slate-500">Before: <span className="font-medium text-slate-600">{story.before}</span></span>
        <span className="text-2xl text-slate-400">&rarr;</span>
        <span className="text-green-600">After: <span className="font-bold">{story.after}</span></span>
      </div>
    </div>
  </div>
);

const SuccessStoriesPage: React.FC = () => {
  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-slate-800">Success Stories</h2>
        <p className="text-lg text-slate-600 mt-2 max-w-2xl mx-auto">Get inspired by others who have transformed their careers.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {stories.map((story, index) => <StoryCard key={index} story={story} index={index}/>)}
      </div>
    </div>
  );
};

export default SuccessStoriesPage;