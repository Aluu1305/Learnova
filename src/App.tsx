import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";

// Pages
import { Home } from "./pages/Home";
import { Login, Register } from "./pages/Auth";
import { Explore } from "./pages/Explore";
import { CourseDetail } from "./pages/CourseDetail";
import { LearningInterface } from "./pages/LearningInterface";
import { MyLearning } from "./pages/MyLearning";
import { CreatorDashboard } from "./pages/CreatorDashboard";
import { CourseBuilder } from "./pages/CourseBuilder";
import { Profile } from "./pages/Profile";
import { Notifications } from "./pages/Notifications";
import { Achievements } from "./pages/Achievements";
import { Goals } from "./pages/Goals";
import { Wishlist } from "./pages/Wishlist";
import { Subscription } from "./pages/Subscription";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Affiliate } from "./pages/Affiliate";
import { Analytics } from "./pages/Analytics";
import { StudySchedule } from "./pages/StudySchedule";
import { Privacy, Terms, Refund } from "./pages/Legal";

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Protected route
function ProtectedRoute({ children, requireRole }: { children: React.ReactNode; requireRole?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && !requireRole.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Layout wrapper (adds header/footer except for learning interface)
function AppLayout({ children, noLayout }: { children: React.ReactNode; noLayout?: boolean }) {
  if (noLayout) return <>{children}</>;
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<AppLayout><PageTransition><Home /></PageTransition></AppLayout>} />
      <Route path="/login" element={<AppLayout><PageTransition><Login /></PageTransition></AppLayout>} />
      <Route path="/register" element={<AppLayout><PageTransition><Register /></PageTransition></AppLayout>} />
      <Route path="/explore" element={<AppLayout><PageTransition><Explore /></PageTransition></AppLayout>} />
      <Route path="/course/:id" element={<AppLayout><PageTransition><CourseDetail /></PageTransition></AppLayout>} />
      <Route path="/privacy" element={<AppLayout><PageTransition><Privacy /></PageTransition></AppLayout>} />
      <Route path="/terms" element={<AppLayout><PageTransition><Terms /></PageTransition></AppLayout>} />
      <Route path="/refund" element={<AppLayout><PageTransition><Refund /></PageTransition></AppLayout>} />

      {/* Learning (no header/footer, fullscreen) */}
      <Route path="/learn/:courseId" element={
        <ProtectedRoute>
          <LearningInterface />
        </ProtectedRoute>
      } />

      {/* Student routes */}
      <Route path="/my-learning" element={
        <AppLayout>
          <ProtectedRoute>
            <PageTransition><MyLearning /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/achievements" element={
        <AppLayout>
          <ProtectedRoute>
            <PageTransition><Achievements /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/goals" element={
        <AppLayout>
          <ProtectedRoute>
            <PageTransition><Goals /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/schedule" element={
        <AppLayout>
          <ProtectedRoute>
            <PageTransition><StudySchedule /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/wishlist" element={
        <AppLayout>
          <ProtectedRoute>
            <PageTransition><Wishlist /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/notifications" element={
        <AppLayout>
          <ProtectedRoute>
            <PageTransition><Notifications /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/profile" element={
        <AppLayout>
          <ProtectedRoute>
            <PageTransition><Profile /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/affiliate" element={
        <AppLayout>
          <ProtectedRoute>
            <PageTransition><Affiliate /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />

      {/* Creator routes */}
      <Route path="/creator" element={
        <AppLayout>
          <ProtectedRoute requireRole={["creator", "admin"]}>
            <PageTransition><CreatorDashboard /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/creator/create" element={
        <AppLayout>
          <ProtectedRoute requireRole={["creator", "admin"]}>
            <PageTransition><CourseBuilder /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/creator/edit/:id" element={
        <AppLayout>
          <ProtectedRoute requireRole={["creator", "admin"]}>
            <PageTransition><CourseBuilder /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/analytics" element={
        <AppLayout>
          <ProtectedRoute requireRole={["creator", "admin"]}>
            <PageTransition><Analytics /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/subscription" element={
        <AppLayout>
          <ProtectedRoute requireRole={["creator", "admin"]}>
            <PageTransition><Subscription /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <AppLayout>
          <ProtectedRoute requireRole={["admin"]}>
            <PageTransition><AdminDashboard /></PageTransition>
          </ProtectedRoute>
        </AppLayout>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="dark">
            <AppRoutes />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
