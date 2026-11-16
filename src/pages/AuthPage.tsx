import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Mail, Lock, User, Check, Sparkles } from 'lucide-react';
import { GoogleButton } from '../components/GoogleButton';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { OtpVerificationModal } from '../components/OtpVerificationModal';
import { WhatsAppInterceptorModal } from '../components/WhatsAppInterceptorModal';
import { TermsModal } from '../components/TermsModal';
import { DestinationViews } from '../components/DestinationViews';
import { supabase } from '../lib/supabaseClient';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  // Navigation / View State
  const [view, setView] = useState<'login' | 'register'>('login');
  const [isFromCheckout, setIsFromCheckout] = useState<boolean>(false);
  const [redirectedTo, setRedirectedTo] = useState<'home' | 'checkout' | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modals state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [registeredEmailForOtp, setRegisteredEmailForOtp] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Register Form State
  const [regFirstName, setRegFirstName] = useState('');
  const [regSurname, setRegSurname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // Google OAuth Loading
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Check URL params on initial mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      if (redirectParam === 'checkout') {
        setIsFromCheckout(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Post-auth redirect handler according to specifications
  const handlePostAuthRedirect = async (userObj: any) => {
    setCurrentUser(userObj);

    if (!isFromCheckout) {
      // 1. If NOT from checkout -> Go to /introduction (if is_vip is false)
      if (!userObj?.user_metadata?.is_vip) {
        navigate('/introduction');
      } else {
        setRedirectedTo('home');
      }
      return;
    }

    // 2. If YES from checkout -> check phone number
    let phoneNumber: string | null = userObj?.user_metadata?.phone_number || null;

    // Double check profiles table in Supabase
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', userObj.id)
        .single();

      if (profileData && profileData.phone_number) {
        phoneNumber = profileData.phone_number;
      }
    } catch {
      // ignore fallback
    }

    if (phoneNumber && phoneNumber.trim() !== '') {
      // Phone is already registered -> direct to checkout
      setRedirectedTo('checkout');
    } else {
      // Phone is missing -> trigger WhatsApp interceptor modal
      setIsWhatsAppModalOpen(true);
    }
  };

  // ----------------------------------------------------
  // SUBMIT: LOGIN
  // ----------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrimmed = loginEmail.trim();
    if (!emailTrimmed) {
      setLoginError('Alamat email wajib diisi.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Kata sandi wajib diisi.');
      return;
    }

    setIsLoginLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password: loginPassword,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Pengguna tidak ditemukan.');

      // Success -> post auth flow
      handlePostAuthRedirect(data.user);
    } catch (err: any) {
      setLoginError(
        err?.message || 'Email atau kata sandi tidak cocok. Silakan coba lagi.'
      );
    } finally {
      setIsLoginLoading(false);
    }
  };

  // ----------------------------------------------------
  // SUBMIT: REGISTER
  // ----------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Validation 1: First Name
    if (regFirstName.trim().length < 2) {
      setRegError('First Name minimal harus terdiri dari 2 karakter.');
      return;
    }

    // Validation 2: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setRegError('Alamat email tidak valid. Masukkan format email yang benar.');
      return;
    }

    // Validation 3: Phone number (9-13 digits)
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 13) {
      setRegError('Nomor telepon harus antara 9 hingga 13 digit angka.');
      return;
    }

    // Validation 4: Password min 8 chars
    if (regPassword.length < 8) {
      setRegError('Password minimal harus 8 karakter.');
      return;
    }

    // Validation 5: Exact match confirm password
    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi Password tidak sesuai dengan Password.');
      return;
    }

    // Validation 6: Terms & Conditions
    if (!acceptTerms) {
      setRegError('Anda wajib menyetujui Terms & Conditions sebelum mendaftar.');
      return;
    }

    setIsRegisterLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            first_name: regFirstName.trim(),
            surname: regSurname.trim(),
            phone_number: cleanPhone,
          },
        },
      });

      if (error) throw error;

      // Temporary store profile data
      setCurrentUser(data.user);
      setRegisteredEmailForOtp(regEmail.trim());

      // Open OTP Verification Pop-up directly
      setIsOtpModalOpen(true);
    } catch (err: any) {
      setRegError(err?.message || 'Gagal melakukan pendaftaran. Silakan coba lagi.');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  // ----------------------------------------------------
  // GOOGLE OAUTH
  // ----------------------------------------------------
  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setLoginError(null);
    setRegError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + (isFromCheckout ? '?redirect=checkout' : ''),
        },
      });

      if (error) throw error;

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        handlePostAuthRedirect(userData.user);
      }
    } catch (err: any) {
      const msg = err?.message || 'Gagal menghubungkan ke Google. Silakan coba lagi.';
      if (view === 'login') setLoginError(msg);
      else setRegError(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ----------------------------------------------------
  // OTP VERIFIED SUCCESS
  // ----------------------------------------------------
  const handleOtpVerified = () => {
    setIsOtpModalOpen(false);
    if (currentUser) {
      handlePostAuthRedirect(currentUser);
    } else {
      setRedirectedTo(isFromCheckout ? 'checkout' : 'home');
    }
  };

  // ----------------------------------------------------
  // WHATSAPP INTERCEPTOR SUCCESS
  // ----------------------------------------------------
  const handleWhatsAppSaved = (savedPhone: string) => {
    setIsWhatsAppModalOpen(false);
    if (currentUser) {
      currentUser.user_metadata = {
        ...currentUser.user_metadata,
        phone_number: savedPhone,
      };
    }
    // Proceed to checkout page
    setRedirectedTo('checkout');
  };

  // Reset to Auth view from destination screen
  const handleBackToAuth = () => {
    setRedirectedTo(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setRedirectedTo(null);
  };

  // If already redirected to /home or /checkout, show Destination Screen
  if (redirectedTo) {
    return (
      <DestinationViews
        type={redirectedTo}
        user={currentUser}
        onLogout={handleLogout}
        onBackToAuth={handleBackToAuth}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-x-hidden">
      {/* 1. Full-screen Background Image with bg-cover bg-center bg-no-repeat and overlay bg-black/15 */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat min-h-screen w-full"
        style={{ backgroundImage: "url('/bg-auth.jpg'), url('/images/bg-auth.jpg')" }}
      >
        {/* Soft subtle overlay bg-black/15 for crystal clear, luxurious glassmorphism effect */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      </div>

      {/* 2. Glassmorphism Card */}
      <div
        className={`relative z-10 w-full glass-panel rounded-3xl transition-all duration-300 ${
          view === 'login' ? 'max-w-md p-6 sm:p-8' : 'max-w-xl p-6 sm:p-9'
        }`}
      >
        {/* Authentic Circular Kukusyuk Image Logo */}
        <img
          src="/logo-kukusyuk.png"
          alt="Logo Kukusyuk"
          className="w-20 h-20 object-contain mx-auto mb-3 rounded-full shadow-md"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('/images/logo-kukusyuk.png')) {
              target.src = '/images/logo-kukusyuk.png';
            }
          }}
        />

        {/* ---------------------------------------------------- */}
        {/* VIEW 1: LOGIN ("Welcome back")                      */}
        {/* ---------------------------------------------------- */}
        {view === 'login' && (
          <div className="w-full animate-fadeIn">
            {/* Title & Subtitle */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Hallo
              </h2>
              <p className="text-sm font-medium text-gray-700/90 mt-1">
                Please enter your details to sign in.
              </p>
            </div>

            {/* Google OAuth Button */}
            <GoogleButton
              onClick={handleGoogleAuth}
              isLoading={isGoogleLoading}
              text="Sign in with Google"
            />

            {/* Inline Error Message */}
            {loginError && (
              <div className="mb-4 bg-red-100/90 border border-red-300 text-red-900 text-xs sm:text-sm rounded-xl p-3 flex items-start gap-2 shadow-sm animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <span>{loginError}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* E-Mail Address */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">
                  E-Mail Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginError(null);
                  }}
                  placeholder="Enter your email"
                  required
                  className="mockup-underline-input w-full"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="Enter your Password"
                    required
                    className="mockup-underline-input w-full pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-1 top-2.5 text-gray-700 hover:text-black transition"
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-1 pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-800 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-400 text-zinc-900 focus:ring-zinc-900 accent-zinc-900"
                  />
                  <span>Remember me</span>
                </label>

                {/* High Contrast Link */}
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-emerald-900 hover:text-emerald-700 font-semibold underline transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoginLoading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white rounded-xl py-3 px-4 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoginLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            {/* Footer Text */}
            <div className="text-center mt-5 text-xs sm:text-sm text-gray-800">
              <span>Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => {
                  setView('register');
                  setLoginError(null);
                }}
                className="text-emerald-900 hover:text-emerald-700 font-semibold underline transition cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: REGISTER ("Sign Up")                         */}
        {/* ---------------------------------------------------- */}
        {view === 'register' && (
          <div className="w-full animate-fadeIn">
            {/* Title & Subtitle */}
            <div className="text-center mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Sign Up
              </h2>
              <p className="text-xs sm:text-sm font-medium text-gray-800 mt-1">
                Daftar sekarang untuk mulai hidup sehat bersama Kukusyuk
              </p>
            </div>

            {/* Google OAuth Button */}
            <GoogleButton
              onClick={handleGoogleAuth}
              isLoading={isGoogleLoading}
              text="Sign up with Google"
            />

            {/* Inline Error Message */}
            {regError && (
              <div className="mb-4 bg-red-100/90 border border-red-300 text-red-900 text-xs sm:text-sm rounded-xl p-3 flex items-start gap-2 shadow-sm animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <span>{regError}</span>
                </div>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1 Left: First Name * */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">
                    First Name <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={regFirstName}
                    onChange={(e) => {
                      setRegFirstName(e.target.value);
                      setRegError(null);
                    }}
                    placeholder="Enter your first name"
                    required
                    className="mockup-underline-input w-full"
                  />
                </div>

                {/* Row 1 Right: Surname (optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 tracking-wider mb-0.5">
                    Surname <span className="text-gray-600 font-normal text-[11px]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={regSurname}
                    onChange={(e) => setRegSurname(e.target.value)}
                    placeholder="Enter your surname"
                    className="mockup-underline-input w-full"
                  />
                </div>

                {/* Row 2 Left: E-Mail Address * */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">
                    E-Mail Address <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      setRegError(null);
                    }}
                    placeholder="example@gmail.com"
                    required
                    className="mockup-underline-input w-full"
                  />
                </div>

                {/* Row 2 Right: Phone Number * */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">
                    Phone Number <span className="text-red-600 font-bold">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 border-b border-gray-700/60 pb-1 focus-within:border-black transition">
                    <div className="flex items-center gap-1.5 bg-white/95 px-2 py-0.5 rounded-full shadow-sm border border-gray-300 shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full bg-white border border-gray-400 flex items-center justify-center text-[9px] font-bold text-emerald-700">
                        •
                      </div>
                      <span className="text-xs font-bold text-gray-800">+62</span>
                    </div>
                    <span className="text-gray-400 font-light text-xs">~</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={regPhone}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/\D/g, '');
                        setRegPhone(numeric);
                        setRegError(null);
                      }}
                      placeholder="812345678"
                      required
                      className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-600 text-sm py-1 font-medium"
                    />
                  </div>
                </div>

                {/* Row 3 Left: Password * */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">
                    Password <span className="text-red-600 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        setRegError(null);
                      }}
                      placeholder="Minimum 8 characters"
                      required
                      className="mockup-underline-input w-full pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-1 top-2.5 text-gray-700 hover:text-black transition"
                      aria-label="Toggle password visibility"
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Row 3 Right: Confirm Password * */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">
                    Confirm Password <span className="text-red-600 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => {
                        setRegConfirmPassword(e.target.value);
                        setRegError(null);
                      }}
                      placeholder="Confirm Password"
                      required
                      className="mockup-underline-input w-full pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-1 top-2.5 text-gray-700 hover:text-black transition"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showRegConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkbox: T&C */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-gray-800 font-medium">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      setRegError(null);
                    }}
                    className="w-4 h-4 mt-0.5 rounded border-gray-400 text-zinc-900 focus:ring-zinc-900 accent-zinc-900 shrink-0"
                  />
                  <span>
                    Saya menyetujui{' '}
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="text-emerald-900 hover:text-emerald-700 font-semibold underline inline cursor-pointer text-left"
                    >
                      Syarat &amp; Ketentuan Kuksyuk-CampusFit
                    </button>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isRegisterLoading || !acceptTerms}
                className="w-full bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white rounded-xl py-3 px-4 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isRegisterLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Sign up</span>
                )}
              </button>
            </form>

            {/* Footer Text */}
            <div className="text-center mt-5 text-xs sm:text-sm text-gray-800">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setRegError(null);
                }}
                className="text-emerald-900 hover:text-emerald-700 font-semibold underline transition cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={loginEmail}
        onSuccess={(email) => {
          setLoginEmail(email);
          setView('login');
        }}
      />

      {/* MODAL 2: OTP Verification 6-Digit Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        email={registeredEmailForOtp}
        onSuccess={handleOtpVerified}
        onCancel={() => setIsOtpModalOpen(false)}
      />

      {/* MODAL 3: WhatsApp Number Interceptor Modal */}
      <WhatsAppInterceptorModal
        isOpen={isWhatsAppModalOpen}
        userId={currentUser?.id || 'google-user'}
        userEmail={currentUser?.email || ''}
        onSuccess={handleWhatsAppSaved}
      />

      {/* MODAL 4: Terms and Conditions Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={() => {
          setAcceptTerms(true);
          setIsTermsModalOpen(false);
          setRegError(null);
        }}
      />
    </div>
  );
};
