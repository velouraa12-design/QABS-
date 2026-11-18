import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { OWNER_USER_PROFILE } from '../data/mockData.ts';
import { studioApi, StudioConfig } from '../services/qabsStudioApi.ts';
import {
  X,
  Lock,
  Mail,
  User,
  Building,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Crown,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    language,
    backendStatus,
    authError,
    setAuthError,
    authLoading,
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    authIntent,
    setAuthIntent,
    pendingServiceOrder,
    login,
    loginOwner,
    register,
    requestPasswordReset,
    confirmPasswordReset,
    previewResetToken,
    confirmEmailVerification,
    resendVerificationEmail,
    previewVerifyToken,
    isAuthenticated
  } = useApp();

  const isAr = language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [verifyTokenInput, setVerifyTokenInput] = useState('');
  const [showVerifyPanel, setShowVerifyPanel] = useState(authMode === 'verify');
  const [authConfig, setAuthConfig] = useState<StudioConfig | null>(null);
  const [authConfigLoading, setAuthConfigLoading] = useState(false);

  useEffect(() => {
    setShowVerifyPanel(authMode === 'verify');
  }, [authMode]);

  useEffect(() => {
    if (!authModalOpen) return;
    let cancelled = false;
    setAuthConfigLoading(true);
    studioApi.config()
      .then(config => { if (!cancelled) setAuthConfig(config); })
      .catch(() => { if (!cancelled) setAuthConfig(null); })
      .finally(() => { if (!cancelled) setAuthConfigLoading(false); });
    return () => { cancelled = true; };
  }, [authModalOpen]);

  const studioAuthReady = authConfig?.registration === true
    && authConfig?.emailVerification === true
    && authConfig?.passwordRecovery === true;
  const authActionsReady = backendStatus === 'connected' && studioAuthReady && !authConfigLoading;
  const [verifyDone, setVerifyDone] = useState(false);
  const [recoveryStage, setRecoveryStage] = useState<'request' | 'confirm'>('request');
  const [resetDone, setResetDone] = useState(false);

  if (!authModalOpen) return null;

  const isOwnerIntent = authIntent === 'owner';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authActionsReady) {
      setAuthError(isAr ? 'المصادقة غير متاحة حتى يكتمل إعداد التحقق من البريد والاستعادة على الخادم.' : 'Authentication is unavailable until server-side email verification and recovery are enabled.');
      return;
    }
    if (isOwnerIntent) {
      await loginOwner(email.trim() || OWNER_USER_PROFILE.email, password);
      return;
    }
    if (!email.trim() || !password) return;
    await login(email.trim(), 'customer', password);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authActionsReady) {
      setAuthError(isAr ? 'التسجيل متوقف حتى تفعيل التحقق من البريد والاستعادة على الخادم.' : 'Registration is disabled until server-side email verification and recovery are enabled.');
      return;
    }
    if (!email.trim() || !name.trim() || password.length < 8) {
      setAuthError(
        isAr
          ? 'يرجى إدخال الاسم والبريد وكلمة مرور من 8 أحرف على الأقل.'
          : 'Name, valid email, and password (8+ chars) are required.'
      );
      return;
    }
    await register(name.trim(), email.trim(), companyName.trim() || 'QABS Client Venture', 'customer', password);
  };

  const handleRecoverRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authActionsReady) {
      setAuthError(isAr ? 'المصادقة متوقفة حتى تفعيل التحقق من البريد واستعادة كلمة المرور في الخادم.' : 'Authentication is disabled until the server enables email verification and password recovery.');
      return;
    }
    if (!email.trim()) return;
    const tok = await requestPasswordReset(email.trim());
    if (tok) setResetTokenInput(tok);
    setRecoveryStage('confirm');
  };

  const handleRecoverConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authActionsReady) return;
    const ok = await confirmPasswordReset(resetTokenInput, newPasswordInput);
    if (ok) {
      setResetDone(true);
      setTimeout(() => {
        setResetDone(false);
        setRecoveryStage('request');
        setAuthMode('login');
      }, 1500);
    }
  };

  const fillTestClientCreds = () => {
    setEmail('client@qabs1.store');
    setAuthError(null);
  };

  const fillTestOwnerCreds = () => {
    setEmail(OWNER_USER_PROFILE.email);
    setAuthError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#082030] border border-[#D5B46B]/50 rounded-2xl shadow-2xl max-w-md w-full text-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-950/60 bg-[#03131D]/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#D5B46B]/15 text-[#D5B46B] rounded-xl border border-[#D5B46B]/30">
              {isOwnerIntent ? <Crown className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-black text-white">
                {isOwnerIntent
                  ? isAr
                    ? 'دخول لوحة الإدارة والصلاحيات'
                    : 'Admin & Staff Control Center Sign In'
                  : authMode === 'login'
                  ? isAr
                    ? 'تسجيل الدخول الآمن'
                    : 'Secure Client Sign In'
                  : authMode === 'register'
                  ? isAr
                    ? 'إنشاء حساب عميل جديد'
                    : 'Register Client Account'
                  : authMode === 'verify'
                  ? isAr
                    ? 'تأكيد البريد الإلكتروني'
                    : 'Verify Email Address'
                  : isAr
                  ? 'استعادة كلمة المرور'
                  : 'Recover Password'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {authActionsReady
                  ? isAr
                    ? 'مصادقة خادمية مع تحقق البريد والاستعادة مفعّلين'
                    : 'Server authentication with email verification and recovery enabled'
                  : authConfigLoading
                    ? isAr ? 'جارٍ التحقق من جاهزية المصادقة' : 'Checking authentication readiness'
                    : isAr
                      ? 'المصادقة متوقفة حتى اكتمال متطلبات الأمان'
                      : 'Authentication disabled until security requirements are met'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!authActionsReady && (
          <div role="status" className="px-6 py-3 bg-amber-950/50 border-b border-amber-800 text-amber-200 text-[11px] leading-6">
            {isAr
              ? authConfigLoading
                ? 'جارٍ التحقق من قدرات المصادقة... تبقى جميع إجراءات الحساب معطلة حتى اكتمال التحقق.'
                : backendStatus !== 'connected'
                  ? 'المعاينة غير متصلة بخدمة المصادقة. الدخول والتسجيل والتحقق والاستعادة معطلة؛ لن يتم إنشاء جلسة أو حساب أو إرسال رسالة.'
                  : 'الخادم لا يفعّل حالياً التحقق من البريد واستعادة كلمة المرور معاً؛ لذلك تبقى المصادقة معطلة.'
              : authConfigLoading
                ? 'Checking authentication capabilities... account actions remain disabled until the check completes.'
                : backendStatus !== 'connected'
                  ? 'This preview is not connected to authentication. Sign-in, registration, verification, and recovery are disabled; no session, account, or email will be created.'
                  : 'The server does not currently enable both email verification and password recovery; authentication therefore remains disabled.'}
          </div>
        )}

        {/* Auth Gate Notice when Pending Service Order exists */}
        {pendingServiceOrder && !isOwnerIntent && (
          <div className="px-6 py-3 bg-[#14243E] border-b border-[#D5B46B]/40 flex items-start gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#D5B46B] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-[#F3E5AB] leading-relaxed">
                {isAr
                  ? 'سجّل الدخول أو أنشئ حسابك لربط الطلب بحسابك المعزول'
                  : 'Sign in or create an account to attach this request to your isolated workspace.'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                <span className="truncate font-semibold">
                  {isAr ? pendingServiceOrder.titleAr : pendingServiceOrder.titleEn}
                </span>
                <span className="font-mono font-black text-[#D5B46B] shrink-0 ms-2">
                  ${pendingServiceOrder.priceUsd}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        {!isOwnerIntent && (
          <div className="flex border-b border-cyan-950/40 bg-[#051724] text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setShowVerifyPanel(false);
                setAuthMode('login');
              }}
              className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
                !showVerifyPanel && authMode === 'login'
                  ? 'text-[#D5B46B] border-b-2 border-[#D5B46B] font-bold bg-[#082030]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setShowVerifyPanel(false);
                setAuthMode('register');
              }}
              className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
                !showVerifyPanel && authMode === 'register'
                  ? 'text-[#00A389] border-b-2 border-[#00A389] font-bold bg-[#082030]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'حساب جديد' : 'Register'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setShowVerifyPanel(false);
                setRecoveryStage('request');
                setAuthMode('recover');
              }}
              className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
                !showVerifyPanel && authMode === 'recover'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold bg-[#082030]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'استعادة' : 'Recover'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setShowVerifyPanel(true);
              }}
              className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
                showVerifyPanel
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold bg-[#082030]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'تأكيد البريد' : 'Verify Email'}
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          {authError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-950/70 border border-rose-700 text-rose-200 text-xs flex items-center gap-2 font-bold"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          {isOwnerIntent ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#051724] border border-[#D5B46B]/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D5B46B]/15 text-[#D5B46B] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-black text-white">{OWNER_USER_PROFILE.name}</div>
                    <div className="text-[11px] text-[#D5B46B] font-bold">
                      Super Admin / Admin / Staff / Support
                    </div>
                  </div>
                </div>
                {backendStatus === 'connected' && (
                  <button
                    type="button"
                    onClick={fillTestOwnerCreds}
                    className="px-2.5 py-1 rounded-lg bg-[#D5B46B]/15 hover:bg-[#D5B46B]/25 text-[#D5B46B] text-[10px] font-bold cursor-pointer"
                  >
                    {isAr ? 'تعبئة البريد' : 'Fill Email'}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'البريد الإلكتروني الإداري' : 'Admin / Staff Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder={OWNER_USER_PROFILE.email}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D5B46B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D5B46B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading || !authActionsReady}
                className="w-full py-2.5 bg-gradient-to-r from-[#D5B46B] to-[#F3E5AB] text-slate-950 font-black rounded-xl text-xs hover:opacity-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {authLoading
                  ? isAr
                    ? 'جاري التحقق...'
                    : 'Verifying...'
                  : isAr
                  ? 'دخول لوحة الإدارة المركزية'
                  : 'Sign In to Admin Portal'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthIntent('client');
                  setAuthMode('login');
                }}
                className="w-full text-center text-[11px] text-slate-400 hover:text-[#D5B46B] cursor-pointer pt-1"
              >
                {isAr ? 'هل أنت عميل؟ الانتقال لدخول العملاء' : 'Switch to Client Sign In'}
              </button>
            </form>
          ) : (
            <>
              {showVerifyPanel ? (
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setAuthError(null);
                    const tok = verifyTokenInput.trim() || previewVerifyToken || '';
                    if (!tok) return;
                    const ok = await confirmEmailVerification(tok);
                    if (ok) {
                      setVerifyDone(true);
                      setTimeout(() => {
                        setVerifyDone(false);
                        setShowVerifyPanel(false);
                        setAuthMode('login');
                      }, 1200);
                    }
                  }}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr
                      ? 'أدخل رمز تأكيد البريد الإلكتروني الصادر لحسابك أو أعد إصداره بعد تسجيل الدخول.'
                      : 'Enter your email verification token or resend it after signing in.'}
                  </p>
                  {previewVerifyToken && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-[11px] font-mono text-emerald-200 break-all">
                      Preview Verify Token: {previewVerifyToken}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'رمز تأكيد البريد الإلكتروني' : 'Email Verification Token'}
                    </label>
                    <input
                      type="text"
                      required
                      value={verifyTokenInput || previewVerifyToken || ''}
                      onChange={e => setVerifyTokenInput(e.target.value)}
                      placeholder="verify token..."
                      className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  {verifyDone && (
                    <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{isAr ? 'تم تأكيد البريد الإلكتروني بنجاح!' : 'Email verified!'}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={authLoading || !authActionsReady}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
                    >
                      {isAr ? 'تأكيد البريد الآن ✓' : 'Verify Email Now ✓'}
                    </button>
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={async () => {
                          const tok = await resendVerificationEmail();
                          if (tok) setVerifyTokenInput(tok);
                        }}
                        className="px-3 py-2.5 bg-[#051724] border border-cyan-900 text-cyan-300 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {isAr ? 'إعادة الإرسال' : 'Resend Token'}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <>
                  {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="client@qabs1.store"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D5B46B]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        {isAr ? 'كلمة المرور' : 'Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthMode('recover');
                        }}
                        className="text-[11px] text-[#D5B46B] hover:underline cursor-pointer"
                      >
                        {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D5B46B]"
                      />
                    </div>
                  </div>

                  {backendStatus === 'connected' && (
                    <div className="p-3 rounded-xl bg-[#051724] border border-cyan-950/60 text-[11px] flex items-center justify-between gap-2">
                      <span className="text-slate-400">
                        {isAr ? 'بريد عميل المعاينة التجريبي:' : 'Preview client email hint:'}
                      </span>
                      <button
                        type="button"
                        onClick={fillTestClientCreds}
                        className="px-2.5 py-1 bg-[#00A389]/20 hover:bg-[#00A389]/30 border border-[#00A389]/40 text-[#2DD4BF] font-bold rounded-lg text-[10px] cursor-pointer"
                      >
                        {isAr ? 'تعبئة البريد' : 'Fill Email'}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading || !authActionsReady}
                    className="w-full py-2.5 bg-gradient-to-r from-[#D5B46B] to-[#F3E5AB] text-slate-950 font-black rounded-xl text-xs hover:opacity-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {authLoading
                      ? isAr
                        ? 'جاري تسجيل الدخول...'
                        : 'Signing In...'
                      : isAr
                      ? 'تسجيل الدخول إلى حسابي'
                      : 'Sign In to My Account'}
                  </button>
                </form>
              )}

              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder={isAr ? 'مثال: محمد العتيبي' : 'e.g. Mohammed Al-Otaibi'}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A389]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A389]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'اسم الشركة أو المتجر (اختياري)' : 'Company or Brand Name (Optional)'}
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. Atlas Commerce LLC"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A389]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'كلمة المرور (8 أحرف على الأقل) *' : 'Password (8+ characters) *'}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A389]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || !authActionsReady}
                    className="w-full py-2.5 bg-gradient-to-r from-[#00A389] to-[#2DD4BF] text-slate-950 font-black rounded-xl text-xs hover:opacity-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {authLoading
                      ? isAr
                        ? 'جاري إنشاء المساحة المعزولة...'
                        : 'Creating Workspace...'
                      : isAr
                      ? 'إنشاء حساب عميل جديد'
                      : 'Create Isolated Client Account'}
                  </button>
                </form>
              )}

              {authMode === 'recover' && (
                recoveryStage === 'request' ? (
                  <form onSubmit={handleRecoverRequest} className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isAr
                        ? 'أدخل بريدك الإلكتروني لإصدار رمز استعادة مشفر صالح لمرة واحدة.'
                        : 'Enter your registered email to issue a one-time cryptographic recovery token.'}
                    </p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="client@qabs1.store"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading || !authActionsReady}
                      className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {isAr ? 'إصدار رمز الاستعادة' : 'Request Recovery Token'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRecoverConfirm} className="space-y-4">
                    {previewResetToken && (
                      <div className="p-2.5 rounded-lg bg-cyan-950/70 border border-cyan-800 text-[11px] font-mono text-cyan-200 break-all">
                        Preview Token: {previewResetToken}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isAr ? 'رمز الاستعادة' : 'Reset Token'}
                      </label>
                      <input
                        type="text"
                        required
                        value={resetTokenInput}
                        onChange={e => setResetTokenInput(e.target.value)}
                        className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isAr ? 'كلمة المرور الجديدة (8+ أحرف)' : 'New Password (8+ chars)'}
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={newPasswordInput}
                        onChange={e => setNewPasswordInput(e.target.value)}
                        className="w-full bg-[#051724] border border-cyan-950 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    {resetDone && (
                      <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{isAr ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated!'}</span>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={authLoading || !authActionsReady}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      {isAr ? 'تأكيد تغيير كلمة المرور' : 'Confirm Password Reset'}
                    </button>
                  </form>
                )
              )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
