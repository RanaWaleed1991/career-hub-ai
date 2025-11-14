import React, { useState, useEffect, useRef } from 'react';
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
import PremiumModal from './components/PremiumModal';
import WelcomeModal from './components/WelcomeModal';
import SubscriptionExpiredModal from './components/SubscriptionExpiredModal';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import { PricingPage } from './src/components/payments/PricingPage';
import { SubscriptionManagement } from './src/components/payments/SubscriptionManagement';
import { Plan, purchasePlan, hasSubscriptionExpired, clearExpiredSubscriptionFlag, getSubscription } from './services/premiumService';
import type { Page } from './types';
import Dashboard from './components/Dashboard';
import TailorResumeModal from './components/TailorResumeModal';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';


const AppContent: React.FC = () => {
  const { user, loading, logout, isAdmin } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const hasRedirectedAdmin = useRef(false);

  // State for premium features modals
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [actionToRetry, setActionToRetry] = useState<(() => void) | null>(null);

  // State for welcome modal
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // State for Tailor Modal
  const [tailorModalState, setTailorModalState] = useState<{isOpen: boolean, initialText?: string}>({isOpen: false});

  // State for current subscription plan
  const [currentPlan, setCurrentPlan] = useState<Plan>('free');

  // Fetch current subscription plan
  useEffect(() => {
    if (user) {
      getSubscription().then((sub) => {
        if (sub) {
          setCurrentPlan(sub.plan);
        }
      });
    }
  }, [user]);

  // Redirect admin users to admin page on initial login (only once)
  useEffect(() => {
    if (user && isAdmin && !hasRedirectedAdmin.current) {
      setPage('admin');
      hasRedirectedAdmin.current = true;
    } else if (!user) {
      // Reset redirect flag when user logs out
      hasRedirectedAdmin.current = false;
    }
  }, [user, isAdmin]);

  // Check if welcome message should be shown for the user
  useEffect(() => {
    if (user?.email) {
      const welcomeKey = `welcome_shown_${user.email.toLowerCase().trim()}`;
      if (!localStorage.getItem(welcomeKey)) {
        setShowWelcomeModal(true);
      }
    }
  }, [user?.email]);

  const handleLogout = async () => {
    await logout();
  };

  const triggerPremiumFlow = () => {
    if (hasSubscriptionExpired()) {
        setShowExpiredModal(true);
    } else {
        // Redirect to pricing page for Stripe checkout
        setPage('pricing');
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
    if (user?.email) {
      localStorage.setItem(`welcome_shown_${user.email.toLowerCase().trim()}`, 'true');
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
    // Redirect to pricing page for Stripe checkout
    setPage('pricing');
  };

  const openTailorModal = (initialText?: string) => {
    setTailorModalState({ isOpen: true, initialText });
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
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
        // Protect admin route - only allow access if user is admin
        if (!isAdmin) {
          setPage('dashboard');
          return <Dashboard setPage={setPage} openTailorModal={() => openTailorModal()} />;
        }
        return <AdminPage />;
      case 'pricing':
        return <PricingPage userToken={null} currentPlan={currentPlan} />;
      case 'subscription':
        return <SubscriptionManagement userToken={null} />;
      case 'paymentSuccess':
        return <PaymentSuccess setPage={setPage} />;
      case 'paymentCancel':
        return <PaymentCancel setPage={setPage} />;
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
      <main className="flex-grow overflow-y-auto relative fade-in">
        {renderPage()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
