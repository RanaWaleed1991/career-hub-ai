
import React, { useState } from 'react';
import { SparklesIcon, CheckIcon } from './icons';
import type { Plan } from '../services/premiumService';


interface PremiumModalProps {
  onClose: () => void;
  onPurchasePlan: (plan: Plan) => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onPurchasePlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');

  const plans = {
    weekly: {
      name: 'Weekly Premium',
      price: '$9.99',
      billing: '/ week',
      features: [
        'Unlimited resume downloads', 
        'Unlimited AI improvements', 
        'Unlimited AI Resume Tailoring',
        'Unlimited cover letters',
        '10 AI Resume Analyses',
        'Clean downloads (no watermark)',
        'Resume version history',
        'Application tracker dashboard',
      ],
      badge: null,
    },
    monthly: {
      name: 'Monthly Premium',
      price: '$24.99',
      billing: '/ month',
      features: [
        'Unlimited resume downloads', 
        'Unlimited AI improvements', 
        'Unlimited AI Resume Tailoring',
        'Unlimited cover letters',
        'Unlimited AI Resume Analyses',
        'Clean downloads (no watermark)',
        'Resume version history',
        'Application tracker dashboard',
        'Priority job alerts'
      ],
      badge: 'BEST VALUE',
    },
  };

  const PlanCard: React.FC<{ planId: Plan }> = ({ planId }) => {
    const plan = plans[planId];
    const isSelected = selectedPlan === planId;
    return (
      <div
        onClick={() => setSelectedPlan(planId)}
        className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 relative h-full flex flex-col ${
          isSelected ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-slate-300 bg-white hover:border-indigo-400'
        }`}
      >
        {plan.badge && (
          <span className={`absolute top-0 -translate-y-1/2 right-4 text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-amber-900`}>
            {plan.badge}
          </span>
        )}
        <h4 className="font-bold text-lg text-slate-800">{plan.name}</h4>
        <div className="flex items-baseline my-2">
            <p className="text-3xl font-extrabold text-slate-900">{plan.price}</p>
            <p className="text-sm text-slate-500 ml-1">{plan.billing}</p>
        </div>
        <ul className="mt-4 space-y-2 text-sm flex-grow">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-slate-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 print:hidden"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
              <SparklesIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-800">Unlock Premium Features</h2>
            <p className="mt-2 text-slate-600">Choose a plan to supercharge your resume and career tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlanCard planId="weekly" />
            <PlanCard planId="monthly" />
          </div>

          <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
            <button
              onClick={() => onPurchasePlan(selectedPlan)}
              className="w-full sm:w-auto flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-3 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue with {plans[selectedPlan].name}
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;