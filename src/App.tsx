import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { IntroductionPage } from './pages/IntroductionPage';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentWaitingPage } from './pages/PaymentWaitingPage';
import { AdminApprovalsPage } from './pages/AdminApprovalsPage';

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-slate-800 antialiased relative">
        {/* Persistent Top Navigation Bar */}
        <Navbar />

        {/* Routes Definition */}
        <Routes>
          {/* Auth: Login & Register */}
          <Route path="/" element={<AuthPage />} />

          {/* VIP Step 1: Penawaran & Manfaat VIP Member (Rp 60.000) */}
          <Route path="/introduction" element={<IntroductionPage />} />

          {/* VIP Step 2: Form Konfirmasi Data Diri, Kode Promo RPC & QRIS */}
          <Route path="/payment" element={<PaymentPage />} />

          {/* VIP Step 3: Status Menunggu Verifikasi Admin Realtime */}
          <Route path="/payment/waiting" element={<PaymentWaitingPage />} />

          {/* VIP Step 4: Admin Approvals Portal */}
          <Route path="/admin/approvals" element={<AdminApprovalsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/introduction" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
