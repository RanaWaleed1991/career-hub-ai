import React, { useState } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import ResumeBuilder from './components/ResumeBuilder';
import CoursesPage from './components/CoursesPage';
import CoverLetterBuilder from './components/CoverLetterBuilder';
import JobsPage from './components/JobsPage';
import AuthPage from './components/AuthPage';
import AdminPage from './components/AdminPage';
import ApplicationTrackerPage from './components/ApplicationTrackerPage';
import VersionHistoryPage from './components/VersionHistoryPage';
import ResumeAnalyserPage from './components/ResumeAnalyserPage';
import { login as loginUser, logout as logoutUser, getCurrentUserEmail } from './services/userService';
import PremiumModal from './components/PremiumModal';
import WelcomeModal from './components/WelcomeModal';
import SubscriptionExpiredModal from './components/SubscriptionExpiredModal';
import { Plan, purchasePlan, hasSubscriptionExpired, clearExpiredSubscriptionFlag } from './services/premiumService';
import type { Page } from './types';
import Dashboard from './components/Dashboard';
import TailorResumeModal from './components/TailorResumeModal';


const App: React.FC = () => {
  // Check session storage on initial load to maintain login state
  const [isAuthenticated, setIsAuthenticated] = useState(!!getCurrentUserEmail());
  const [page, setPage] = useState<Page>('dashboard');

  // State for premium features modals
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [actionToRetry, setActionToRetry] = useState<(() => void) | null>(null);

  // State for welcome modal
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // State for Tailor Modal
  const [tailorModalState, setTailorModalState] = useState<{isOpen: boolean, initialText?: string}>({isOpen: false});
  
  const handleLogin = (email: string, password?: string) => {
    if (loginUser(email, password)) {
      setIsAuthenticated(true);
      setPage('dashboard');

      // Check if welcome message should be shown for the new user
      const welcomeKey = `welcome_shown_${email.toLowerCase().trim()}`;
      if (!localStorage.getItem(welcomeKey)) {
        setShowWelcomeModal(true);
      }
    } else {
      alert('Invalid email or password. Please try again.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
  };

  const triggerPremiumFlow = () => {
    if (hasSubscriptionExpired()) {
        setShowExpiredModal(true);
    } else {
        setShowPremiumModal(true);
    }
  };
  
  const handlePurchasePlan = (plan: Plan) => {
    purchasePlan(plan);
    setShowPremiumModal(false);
    if (actionToRetry) {
      // A small timeout allows the UI to update and ensures the action runs smoothly
      setTimeout(() => {
        actionToRetry();
        setActionToRetry(null);
      }, 100);
    }
  };
  
  const handleCloseModal = () => {
    setShowPremiumModal(false);
    setActionToRetry(null);
  };

  const handleCloseWelcomeModal = () => {
    const email = getCurrentUserEmail();
    if (email) {
      localStorage.setItem(`welcome_shown_${email.toLowerCase().trim()}`, 'true');
    }
    setShowWelcomeModal(false);
  };

  const handleCloseExpiredModal = () => {
    setShowExpiredModal(false);
    clearExpiredSubscriptionFlag();
  };

  const handleUpgradeFromExpired = () => {
    setShowExpiredModal(false);
    clearExpiredSubscriptionFlag();
    setShowPremiumModal(true);
  };
  
  const openTailorModal = (initialText?: string) => {
    setTailorModalState({ isOpen: true, initialText });
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }
  
  const modalProps = {
      triggerPremiumFlow,
      setActionToRetry
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard setPage={setPage} openTailorModal={() => openTailorModal()} />;
      case 'builder':
        return <ResumeBuilder {...modalProps} setPage={setPage} openTailorModal={openTailorModal}/>;
      case 'analyser':
        return <ResumeAnalyserPage {...modalProps} />;
      case 'courses':
        return <CoursesPage />;
      case 'jobs':
        return <JobsPage />;
      case 'coverLetter':
        return <CoverLetterBuilder {...modalProps} />;
      case 'tracker':
        return <ApplicationTrackerPage />;
      case 'versions':
        return <VersionHistoryPage setPage={setPage} />;
      case 'admin':
        return <AdminPage />;
      case 'landing':
      default:
        return <LandingPage setPage={setPage} {...modalProps} openTailorModal={() => openTailorModal()} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col">
      {tailorModalState.isOpen && <TailorResumeModal onClose={() => setTailorModalState({isOpen: false})} initialResumeText={tailorModalState.initialText} />}
      {showWelcomeModal && <WelcomeModal onClose={handleCloseWelcomeModal} />}
      {showPremiumModal && (
        <PremiumModal 
          onClose={handleCloseModal}
          onPurchasePlan={handlePurchasePlan}
        />
      )}
      {showExpiredModal && (
        <SubscriptionExpiredModal
          onClose={handleCloseExpiredModal}
          onUpgrade={handleUpgradeFromExpired}
        />
      )}
      <Header onGoToHome={() => setPage('dashboard')} onLogout={handleLogout} page={page} />
      <main className="flex-grow overflow-hidden relative fade-in">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
