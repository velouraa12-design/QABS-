import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { OWNER_USER_PROFILE } from '../data/mockData.ts';
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
  ShoppingBag
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    language,
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
    showToast
  } = useApp();

  const isAr = language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!authModalOpen) return null;

  const isOwnerIntent = authIntent === 'owner';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwnerIntent) {
      loginOwner(email.trim() || OWNER_USER_PROFILE.email);
      return;
    }
    if (!email.trim()) return;
    login(email.trim(), 'merchant');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    register(name.trim(), email.trim(), companyName.trim() || 'QABS Client Venture', 'merchant');
  };

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setResetSent(true);
    showToast(
      isAr
        ? `تم إرسال رابط استعادة كلمة المرور إلى ${email}`
        : `Password recovery link dispatched to ${email}`
    );
    setTimeout(() => {
      setResetSent(false);
      setAuthMode('login');
    }, 2500);
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
                    ? 'دخول لوحة الإدارة (المالك)'
                    : 'Owner Admin Portal Sign In'
                  : authMode === 'login'
                  ? isAr
                    ? 'تسجيل الدخول / حسابي'
                    : 'Client Sign In / My Account'
                  : authMode === 'register'
                  ? isAr
                    ? 'إنشاء حساب عميل سريع'
                    : 'Quick Client Registration'
                  : isAr
                  ? 'استعادة كلمة المرور'
                  : 'Recover Password'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isOwnerIntent
                  ? isAr
                    ? `حساب المالك الوحيد: ${OWNER_USER_PROFILE.name} (Super Admin)`
                    : `Sole Owner: ${OWNER_USER_PROFILE.name} (Super Admin)`
                  : isAr
                  ? 'بوابة عملاء قبس — تأسيس الشركات والمتاجر والطلبات'
                  : 'QABS Client Portal — Companies, Stores & Orders'}
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

        {/* Auth Gate Notice when Pending Service Order exists */}
        {pendingServiceOrder && !isOwnerIntent && (
          <div className="px-6 py-3 bg-[#14243E] border-b border-[#D5B46B]/40 flex items-start gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#D5B46B] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-[#F3E5AB] leading-relaxed">
                {isAr
                  ? 'يرجى تسجيل الدخول أو إنشاء حساب سريع لإتمام طلبك وحفظ مستنداتك في مساحة العمل'
                  : 'Please sign in or create a quick account to complete your order and save your documents in the workspace.'}
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

        {/* Tab switcher (only for Client auth; Owner has dedicated single login) */}
        {!isOwnerIntent && (
          <div className="flex border-b border-cyan-950/40 bg-[#051724] text-xs">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
                authMode === 'login'
                  ? 'text-[#D5B46B] border-b-2 border-[#D5B46B] font-bold bg-[#082030]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
                authMode === 'register'
                  ? 'text-[#00A389] border-b-2 border-[#00A389] font-bold bg-[#082030]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'حساب سريع جديد' : 'Quick Register'}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('recover')}
              className={`flex-1 py-2.5 font-medium transition-colors cursor-pointer text-center ${
                authMode === 'recover'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold bg-[#082030]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'استعادة' : 'Recover'}
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {isOwnerIntent ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#051724] border border-[#D5B46B]/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D5B46B]/15 text-[#D5B46B] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-black text-white">{OWNER_USER_PROFILE.name}</div>
                  <div className="text-[11px] text-[#D5B46B] font-bold">
                    {isAr ? 'المالك والمدير العام الوحيد (Super Admin)' : 'Sole Owner & Super Admin'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'بريد المالك الإلكتروني' : 'Owner Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder={OWNER_USER_PROFILE.email}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D5B46B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'رمز الدخول الإداري' : 'Admin Password'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D5B46B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#D5B46B] to-[#F3E5AB] text-slate-950 font-black rounded-xl text-xs hover:opacity-95 transition-all cursor-pointer shadow-md"
              >
                {isAr
                  ? `دخول لوحة الإدارة كـ ${OWNER_USER_PROFILE.name}`
                  : `Sign In as Owner (${OWNER_USER_PROFILE.name})`}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthIntent('client');
                  setAuthMode('login');
                }}
                className="w-full text-center text-[11px] text-slate-400 hover:text-[#D5B46B] cursor-pointer pt-1"
              >
                {isAr ? 'هل أنت عميل؟ الانتقال لتسجيل دخول العملاء' : 'Are you a client? Switch to Client Sign In'}
              </button>
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
                        placeholder="client@company.com"
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
                        onClick={() => setAuthMode('recover')}
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

                  {/* Quick Client Sign-in */}
                  <div className="p-3 rounded-xl bg-[#051724] border border-cyan-950/60 text-[11px] flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-semibold">
                      {isAr ? 'دخول سريع للعميل:' : 'Quick Client Access:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => login('client@qabs1.store', 'merchant')}
                      className="px-3 py-1.5 bg-[#00A389]/20 hover:bg-[#00A389]/30 border border-[#00A389]/40 text-[#2DD4BF] font-bold rounded-lg text-[11px] cursor-pointer"
                    >
                      {isAr ? 'دخول حساب عميل الآن' : 'Instant Client Sign In'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-[#D5B46B] to-[#F3E5AB] text-slate-950 font-black rounded-xl text-xs hover:opacity-95 transition-all cursor-pointer shadow-md"
                  >
                    {pendingServiceOrder
                      ? isAr
                        ? 'تسجيل الدخول ومتابعة الدفع'
                        : 'Sign In & Continue to Checkout'
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
                      {isAr ? 'كلمة المرور *' : 'Password *'}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A389]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-[#00A389] to-[#2DD4BF] text-slate-950 font-black rounded-xl text-xs hover:opacity-95 transition-all cursor-pointer shadow-md"
                  >
                    {pendingServiceOrder
                      ? isAr
                        ? 'إنشاء الحساب ومتابعة إتمام الطلب'
                        : 'Create Account & Proceed to Checkout'
                      : isAr
                      ? 'إنشاء حساب عميل جديد'
                      : 'Create Client Account'}
                  </button>
                </form>
              )}

              {authMode === 'recover' && (
                <form onSubmit={handleRecoverSubmit} className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr
                      ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً مشفراً لإعادة تعيين كلمة المرور فوراً.'
                      : 'Enter your registered email address and we will dispatch a secure password reset token.'}
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
                        placeholder="user@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#051724] border border-cyan-950 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {resetSent && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{isAr ? 'تم إرسال رابط التعيين بنجاح!' : 'Reset link sent successfully!'}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {isAr ? 'إرسال رابط الاستعادة' : 'Send Recovery Link'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
