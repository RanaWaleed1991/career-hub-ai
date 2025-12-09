import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import WelcomeModal from './components/WelcomeModal';
import SubscriptionExpiredModal from './components/SubscriptionExpiredModal';
import { Plan, purchasePlan, hasSubscriptionExpired, clearExpiredSubscriptionFlag, getSubscription } from './services/premiumService';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './src/components/routes';
import { SEO } from './src/components/SEO';
import { supabase } from './src/config/supabase';

// Lazy load heavy components to reduce initial bundle size
// These will be loaded on-demand when user navigates to them
const ResumeBuilder = lazy(() => import('./components/ResumeBuilder'));
const ResumeAnalyserPage = lazy(() => import('./components/ResumeAnalyserPage'));
const AdminPage = lazy(() => import('./components/AdminPage'));
const CoursesPage = lazy(() => import('./components/CoursesPage'));
const JobsPage = lazy(() => import('./components/JobsPage'));
const BlogsPage = lazy(() => import('./components/BlogsPage'));
const BlogPostPage = lazy(() => import('./components/BlogPostPage'));
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
  const navigate = useNavigate();
  const location = useLocation();
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

  // State to track password recovery mode
  const [isInRecoveryMode, setIsInRecoveryMode] = useState(false);

  // Listen for PASSWORD_RECOVERY auth events
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsInRecoveryMode(true);
        console.log('🔒 Password recovery mode activated');
      } else if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setIsInRecoveryMode(false);
        console.log('🔓 Password recovery mode deactivated');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

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

  // Detect password recovery token in URL and redirect to reset password page
  // IMPORTANT: Only redirect if NOT already on /reset-password to preserve URL hash
  useEffect(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;

    // Only redirect if we have a recovery hash but are NOT on the reset-password page
    // This prevents stripping the hash when landing on /reset-password from Supabase
    if (hash && hash.includes('type=recovery') && !path.includes('/reset-password')) {
      console.log('Password recovery token detected in hash, redirecting to reset-password page');
      // Preserve the hash when navigating
      navigate('/reset-password' + window.location.hash, { replace: true });
    }
  }, [navigate]);

  // Redirect admin users to admin page on initial login (only once)
  // Redirect authenticated users to dashboard if on landing page
  useEffect(() => {
    if (user && isAdmin && !hasRedirectedAdmin.current && location.pathname === '/') {
      navigate('/admin', { replace: true });
      hasRedirectedAdmin.current = true;
    } else if (user && location.pathname === '/') {
      // If user is logged in and on landing page, go to dashboard
      navigate('/dashboard', { replace: true });
    } else if (!user) {
      // Reset redirect flag when user logs out
      hasRedirectedAdmin.current = false;
    }
  }, [user, isAdmin, location.pathname, navigate]);

  // Check if welcome message should be shown for the user
  // Skip if in password recovery mode
  useEffect(() => {
    if (user?.email && !isInRecoveryMode) {
      const welcomeKey = `welcome_shown_${user.email.toLowerCase().trim()}`;
      if (!localStorage.getItem(welcomeKey)) {
        setShowWelcomeModal(true);
      }
    }
  }, [user?.email, isInRecoveryMode]);

  const handleLogout = async () => {
    console.log('🔴 handleLogout called');
    try {
      await logout();
      console.log('✅ Logout successful');
      // Redirect to landing page after logout
      navigate('/', { replace: true });
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
        navigate('/pricing');
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
    navigate('/pricing');
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
      <Header
        onGoToHome={() => {
          // Block navigation during password recovery
          if (isInRecoveryMode) {
            console.log('⚠️ Navigation blocked - complete password reset first');
            return;
          }
          navigate(user ? '/dashboard' : '/');
        }}
        onLogout={handleLogout}
        page={location.pathname.slice(1) || 'landing'}
        showLogout={!!user}
      />
      <main className="flex-grow overflow-y-auto relative fade-in">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <>
                <SEO page="homepage" />
                <LandingPage
                  setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)}
                  {...modalProps}
                  openTailorModal={() => openTailorModal()}
                  isAuthenticated={!!user}
                  isAdmin={isAdmin}
                />
              </>
            } />
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" replace /> : (
                <>
                  <SEO page="login" />
                  <AuthPage setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)} />
                </>
              )
            } />
            <Route path="/forgot-password" element={
              <ForgotPasswordPage setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)} />
            } />
            <Route path="/reset-password" element={
              <ResetPasswordPage setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)} />
            } />
            <Route path="/privacy" element={
              <>
                <SEO page="privacy" />
                <PrivacyPolicy setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)} />
              </>
            } />
            <Route path="/terms" element={
              <>
                <SEO page="terms" />
                <TermsOfService setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)} />
              </>
            } />

            {/* Resume Builder - Accessible to both guests and authenticated users */}
            <Route path="/resume-builder" element={
              <>
                <SEO page="resumeBuilder" />
                <ResumeBuilder
                  key={user?.id || 'guest'}
                  {...modalProps}
                  setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)}
                  openTailorModal={openTailorModal}
                  isGuestMode={!user}
                />
              </>
            } />

            {/* Protected Routes - Require Authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <>
                  <SEO page="dashboard" />
                  <Dashboard setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)} openTailorModal={() => openTailorModal()} />
                </>
              </ProtectedRoute>
            } />
            <Route path="/resume-analysis" element={
              <ProtectedRoute>
                <>
                  <SEO page="resumeAnalysis" />
                  <ResumeAnalyserPage {...modalProps} />
                </>
              </ProtectedRoute>
            } />
            <Route path="/cover-letter" element={
              <ProtectedRoute>
                <>
                  <SEO page="coverLetter" />
                  <CoverLetterBuilder {...modalProps} />
                </>
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={
              <ProtectedRoute>
                <>
                  <SEO page="jobs" />
                  <JobsPage />
                </>
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <>
                <SEO page="courses" />
                <CoursesPage />
              </>
            } />
            <Route path="/blogs" element={
              <>
                <SEO page="blogs" />
                <BlogsPage />
              </>
            } />
            <Route path="/blog/:slug" element={
              <BlogPostPage />
            } />
            <Route path="/applications" element={
              <ProtectedRoute>
                <>
                  <SEO page="applications" />
                  <ApplicationTrackerPage />
                </>
              </ProtectedRoute>
            } />
            <Route path="/versions" element={
              <ProtectedRoute>
                <VersionHistoryPage setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)} />
              </ProtectedRoute>
            } />
            <Route path="/pricing" element={
              <ProtectedRoute>
                <PricingPage userToken={null} currentPlan={currentPlan} />
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute>
                <SubscriptionManagement userToken={null} />
              </ProtectedRoute>
            } />
            <Route path="/payment/success" element={
              <ProtectedRoute>
                <PaymentSuccess setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)} />
              </ProtectedRoute>
            } />
            <Route path="/payment/cancel" element={
              <ProtectedRoute>
                <PaymentCancel setPage={(page) => navigate(`/${page === 'landing' ? '' : page}`)} />
              </ProtectedRoute>
            } />

            {/* Admin Routes - Require Admin Authentication */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />

            {/* Catch-all route - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Analytics />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
