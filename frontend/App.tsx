import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import WelcomeModal from './components/WelcomeModal';
import SubscriptionExpiredModal from './components/SubscriptionExpiredModal';
import { Plan, purchasePlan, hasSubscriptionExpired, clearExpiredSubscriptionFlag, getSubscription } from './services/premiumService';
import type { Page } from './types';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Lazy load heavy components to reduce initial bundle size
// These will be loaded on-demand when user navigates to them
const ResumeBuilder = lazy(() => import('./components/ResumeBuilder'));
const ResumeAnalyserPage = lazy(() => import('./components/ResumeAnalyserPage'));
const AdminPage = lazy(() => import('./components/AdminPage'));
const CoursesPage = lazy(() => import('./components/CoursesPage'));
const JobsPage = lazy(() => import('./components/JobsPage'));
const CoverLetterBuilder = lazy(() => import('./components/CoverLetterBuilder'));
const ApplicationTrackerPage = lazy(() => import('./components/ApplicationTrackerPage'));
const VersionHistoryPage = lazy(() => import('./components/VersionHistoryPage'));
const PricingPage = lazy(() => import('./src/components/payments/PricingPage').then(m => ({ default: m.PricingPage })));
const SubscriptionManagement = lazy(() => import('./src/components/payments/SubscriptionManagement').then(m => ({ default: m.SubscriptionManagement })));
const PaymentSuccess = lazy(() => import('./components/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./components/PaymentCancel'));
const TailorResumeModal = lazy(() => import('./components/TailorResumeModal'));
const PremiumModal = lazy(() => import('./components/PremiumModal'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));

// Loading fallback component for lazy-loaded routes
const LoadingFallback: React.FC = () => (
  <div className="h-full w-full flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { user, loading, logout, isAdmin } = useAuth();
  const [page, setPage] = useState<Page>('landing'); // Start with landing page
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
  // Redirect authenticated users to dashboard if on landing page
  useEffect(() => {
    if (user && isAdmin && !hasRedirectedAdmin.current) {
      setPage('admin');
      hasRedirectedAdmin.current = true;
    } else if (user && page === 'landing') {
      // If user is logged in and on landing page, go to dashboard
      setPage('dashboard');
    } else if (!user) {
      // Reset redirect flag when user logs out
      hasRedirectedAdmin.current = false;
      // Don't redirect guests - let App.tsx render guards handle auth
    }
  }, [user, isAdmin, page]);

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
    console.log('🔴 handleLogout called');
    try {
      await logout();
      console.log('✅ Logout successful');
      // Redirect to landing page after logout
      setPage('landing');
      console.log('🔴 Redirected to landing page');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
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
    console.log('🟢 openTailorModal called, initialText:', initialText);
    setTailorModalState({ isOpen: true, initialText });
    console.log('🟢 tailorModalState updated to isOpen: true');
  };

  // Define modal props early so it can be used in all returns
  const modalProps = {
      triggerPremiumFlow,
      setActionToRetry
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

  // If not authenticated and trying to access protected pages, show landing page
  // Public pages (landing, privacy, terms, builder, jobs, courses, coverLetter, forgot-password, reset-password) are accessible without auth
  const publicPages = ['landing', 'privacy', 'terms', 'builder', 'jobs', 'courses', 'coverLetter', 'forgot-password', 'reset-password'];
  const isPublicPage = publicPages.includes(page);

  // If not authenticated but viewing public pages, render them
  if (!user && (page === 'privacy' || page === 'terms' || page === 'forgot-password' || page === 'reset-password')) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col">
        <main className="flex-grow overflow-y-auto relative">
          <Suspense fallback={<LoadingFallback />}>
            {page === 'privacy' && <PrivacyPolicy setPage={setPage} />}
            {page === 'terms' && <TermsOfService setPage={setPage} />}
            {page === 'forgot-password' && <ForgotPasswordPage setPage={setPage} />}
            {page === 'reset-password' && <ResetPasswordPage setPage={setPage} />}
          </Suspense>
        </main>
      </div>
    );
  }

  // If not authenticated and on landing page, show landing page with proper auth indication
  if (!user && page === 'landing') {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col">
        {tailorModalState.isOpen && (
          <>
            {console.log('🟣 Rendering TailorResumeModal (guest landing), isOpen:', tailorModalState.isOpen)}
            <Suspense fallback={null}>
              <TailorResumeModal onClose={() => setTailorModalState({isOpen: false})} initialResumeText={tailorModalState.initialText} />
            </Suspense>
          </>
        )}
        <main className="flex-grow overflow-y-auto relative">
          <LandingPage setPage={setPage} {...modalProps} openTailorModal={() => openTailorModal()} isAuthenticated={false} isAdmin={false} />
        </main>
      </div>
    );
  }

  // If not authenticated and on builder page, show builder in guest mode
  if (!user && page === 'builder') {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col">
        {tailorModalState.isOpen && (
          <>
            {console.log('🟣 Rendering TailorResumeModal (guest builder), isOpen:', tailorModalState.isOpen)}
            <Suspense fallback={null}>
              <TailorResumeModal onClose={() => setTailorModalState({isOpen: false})} initialResumeText={tailorModalState.initialText} />
            </Suspense>
          </>
        )}
        <Header onGoToHome={() => setPage('landing')} onLogout={handleLogout} page={page} showLogout={false} />
        <main className="flex-grow overflow-y-auto relative">
          <Suspense fallback={<LoadingFallback />}>
            <ResumeBuilder
              key="guest-builder"
              {...modalProps}
              setPage={setPage}
              openTailorModal={openTailorModal}
              isGuestMode={true}
            />
          </Suspense>
        </main>
      </div>
    );
  }

  // If not authenticated and trying to access protected pages, show auth page
  if (!user && !isPublicPage) {
    return <AuthPage setPage={setPage} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard setPage={setPage} openTailorModal={() => openTailorModal()} />;
      case 'builder':
        return <ResumeBuilder key={user?.id || 'guest'} {...modalProps} setPage={setPage} openTailorModal={openTailorModal}/>;
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
      case 'privacy':
        return <PrivacyPolicy setPage={setPage} />;
      case 'terms':
        return <TermsOfService setPage={setPage} />;
      case 'landing':
      default:
        return <LandingPage setPage={setPage} {...modalProps} openTailorModal={() => openTailorModal()} isAuthenticated={!!user} isAdmin={isAdmin} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col">
      {tailorModalState.isOpen && (
        <>
          {console.log('🟣 Rendering TailorResumeModal, isOpen:', tailorModalState.isOpen)}
          <Suspense fallback={null}>
            <TailorResumeModal onClose={() => setTailorModalState({isOpen: false})} initialResumeText={tailorModalState.initialText} />
          </Suspense>
        </>
      )}
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
      <Header onGoToHome={() => setPage(user ? 'dashboard' : 'landing')} onLogout={handleLogout} page={page} showLogout={!!user} />
      <main className="flex-grow overflow-y-auto relative fade-in">
        <Suspense fallback={<LoadingFallback />}>
          {renderPage()}
        </Suspense>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Analytics />
    </AuthProvider>
  );
};

export default App;
