import React from 'react';

interface SubscriptionExpiredModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const SubscriptionExpiredModal: React.FC<SubscriptionExpiredModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 print:hidden"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Your premium access is over</h2>
        <p className="mt-4 text-slate-600">
          We are sad that you lost premium access to our platform — upgrade to continue on your path to success.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Not now
          </button>
          <button
            onClick={onUpgrade}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpiredModal;
