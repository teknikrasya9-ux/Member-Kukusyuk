import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AdminFloatingButton } from './components/AdminFloatingButton';
import { AuthPage } from './pages/AuthPage';
import { IntroductionPage } from './pages/IntroductionPage';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentWaitingPage } from './pages/PaymentWaitingPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-slate-800 antialiased relative">
        {/* Navigation Bar (hidden on /admin routes automatically) */}
        <Navbar />

        {/* Global Floating Admin Panel Button in bottom-right (hidden on /admin routes automatically) */}
        <AdminFloatingButton />

        {/* Routes Definition */}
        <Routes>
          {/* Member Auth: Login & Register */}
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />

          {/* Dedicated Admin Portal Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/approvals" element={<Navigate to="/admin/dashboard" replace />} />

          {/* VIP Member Registration Flow */}
          <Route path="/introduction" element={<IntroductionPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/waiting" element={<PaymentWaitingPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
