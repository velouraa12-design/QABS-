import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { studioApi, StudioConfig, StudioProjectWorkspace, StudioServiceRequest, StudioStoreDraft } from '../services/qabsStudioApi.ts';

type StudioUser = {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  csrf: string;
};

type StudioTemplate = { key: string; ar: string; en: string; type: string };
type StudioService = { key: string; title?: string; titleAr?: string; name?: string; nameAr?: string; description?: string; [key: string]: unknown };

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'تعذر إكمال العملية. حاول مرة أخرى.';

const labelOf = (value: unknown, fallback = '—'): string =>
  typeof value === 'string' && value.trim() ? value : fallback;

export const StudioWorkspaceView: React.FC = () => {
  const [config, setConfig] = useState<StudioConfig | null>(null);
  const [user, setUser] = useState<StudioUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaces, setWorkspaces] = useState<StudioProjectWorkspace[]>([]);
  const [templates, setTemplates] = useState<StudioTemplate[]>([]);
  const [services, setServices] = useState<StudioService[]>([]);
  const [requests, setRequests] = useState<StudioServiceRequest[]>([]);
  const [drafts, setDrafts] = useState<StudioStoreDraft[]>([]);
  const [workspaceName, setWorkspaceName] = useState('مساحة أعمالي');
  const [displayName, setDisplayName] = useState('');
  const [draftName, setDraftName] = useState('');
  const [templateKey, setTemplateKey] = useState('');

  const loadData = useCallback(async () => {
    const results = await Promise.allSettled([
      studioApi.projectWorkspaces(),
      studioApi.projectCatalog(),
      studioApi.servicesCatalog(),
      studioApi.serviceRequests(),
      studioApi.storeDrafts()
    ]);
    if (results[0].status === 'fulfilled') setWorkspaces(results[0].value.workspaces || []);
    if (results[1].status === 'fulfilled') {
      const next = results[1].value.templates || [];
      setTemplates(next);
      setTemplateKey(current => current || next[0]?.key || '');
    }
    if (results[2].status === 'fulfilled') setServices(results[2].value.services as StudioService[]);
    if (results[3].status === 'fulfilled') setRequests(results[3].value.requests || []);
    if (results[4].status === 'fulfilled') setDrafts(results[4].value.drafts || []);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const nextConfig = await studioApi.config();
        if (!active) return;
        setConfig(nextConfig);
        try {
          const session = await studioApi.me();
          if (!active) return;
          setUser(session);
          await loadData();
        } catch (sessionError) {
          const status = (sessionError as { status?: number })?.status;
          if (status !== 401) throw sessionError;
        }
      } catch (loadError) {
        if (active) setError(messageOf(loadError));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [loadData]);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (authMode === 'register') {
        if (!config?.registration) throw new Error('التسجيل غير متاح حالياً.');
        await studioApi.register(email.trim(), password);
      } else {
        await studioApi.login(email.trim(), password);
      }
      const session = await studioApi.me();
      setUser(session);
      await loadData();
    } catch (authError) {
      setError(messageOf(authError));
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    setError('');
    try {
      await studioApi.logout();
      setUser(null);
      setWorkspaces([]);
      setRequests([]);
      setDrafts([]);
      setServices([]);
    } catch (logoutError) {
      setError(messageOf(logoutError));
    } finally {
      setBusy(false);
    }
  };

  const createWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await studioApi.createProjectWorkspace({ name: workspaceName.trim(), display_name: displayName.trim() });
      await loadData();
    } catch (createError) {
      setError(messageOf(createError));
    } finally {
      setBusy(false);
    }
  };

  const createDraft = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!templateKey) return;
    setBusy(true);
    setError('');
    try {
      await studioApi.createStoreDraft({
        attempt_id: crypto.randomUUID(),
        template_key: templateKey,
        name: draftName.trim()
      });
      setDraftName('');
      await loadData();
    } catch (createError) {
      setError(messageOf(createError));
    } finally {
      setBusy(false);
    }
  };

  const templateLabel = useMemo(
    () => new Map(templates.map(template => [template.key, template.ar || template.en])),
    [templates]
  );

  if (loading) {
    return <section dir="rtl" className="min-h-[65vh] grid place-items-center bg-[#071A2A] text-[#D5B46B]">جارٍ الاتصال بمساحة قبس الآمنة…</section>;
  }

  if (error && !config) {
    return <section dir="rtl" className="min-h-[65vh] grid place-items-center bg-[#071A2A] px-5 text-center"><div className="max-w-lg rounded-2xl border border-[#D5B46B]/30 bg-[#0D2639] p-8 text-white"><h1 className="text-2xl font-black text-[#D5B46B]">تعذر الاتصال بخدمات قبس</h1><p className="mt-3 text-sm text-slate-300">{error}</p><button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-[#D5B46B] px-5 py-3 font-bold text-[#14243E]">إعادة المحاولة</button></div></section>;
  }

  if (!user) {
    return (
      <section dir="rtl" className="min-h-[72vh] bg-[#071A2A] px-4 py-12 text-white">
        <div className="mx-auto max-w-md rounded-3xl border border-[#D5B46B]/30 bg-[#0D2639] p-7 shadow-2xl">
          <div className="mb-6 text-center"><div className="text-sm font-bold tracking-[.25em] text-[#D5B46B]">QABS STUDIO</div><h1 className="mt-3 text-2xl font-black">مساحة أعمالك في قبس</h1><p className="mt-2 text-sm text-slate-300">سجّل الدخول لإدارة مساحات العمل وطلبات الخدمات ومسودات المتاجر.</p></div>
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-[#071A2A] p-1 text-sm"><button onClick={() => setAuthMode('login')} className={`rounded-lg py-2 font-bold ${authMode === 'login' ? 'bg-[#D5B46B] text-[#14243E]' : 'text-slate-300'}`}>تسجيل الدخول</button><button onClick={() => setAuthMode('register')} disabled={!config?.registration} className={`rounded-lg py-2 font-bold disabled:opacity-40 ${authMode === 'register' ? 'bg-[#D5B46B] text-[#14243E]' : 'text-slate-300'}`}>إنشاء حساب</button></div>
          <form onSubmit={handleAuth} className="space-y-4">
            <label className="block text-sm font-bold">البريد الإلكتروني<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071A2A] px-4 py-3 text-left text-white outline-none focus:border-[#D5B46B]" /></label>
            <label className="block text-sm font-bold">كلمة المرور<input type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={12} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071A2A] px-4 py-3 text-left text-white outline-none focus:border-[#D5B46B]" /><span className="mt-1 block text-xs text-slate-400">12 حرفاً على الأقل.</span></label>
            {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            <button disabled={busy || (authMode === 'register' && !config?.registration)} className="w-full rounded-xl bg-[#D5B46B] px-5 py-3 font-black text-[#14243E] disabled:opacity-50">{busy ? 'جارٍ التنفيذ…' : authMode === 'login' ? 'دخول آمن' : 'إنشاء الحساب'}</button>
          </form>
          {config?.emailVerification !== true && <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-6 text-amber-100">تنبيه المعاينة: التحقق من البريد واستعادة كلمة المرور غير مفعّلين بعد. لا تُدخل بيانات حساسة أو مستندات حقيقية في هذه البيئة.</p>}
          <p className="mt-4 text-center text-xs text-slate-400">الدفع غير مفعّل في بيئة المعاينة.</p>
        </div>
      </section>
    );
  }

  return (
    <section dir="rtl" className="min-h-[75vh] bg-[#071A2A] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D5B46B]/25 bg-[#0D2639] p-5">
          <div><div className="text-xs font-bold tracking-[.2em] text-[#D5B46B]">QABS STUDIO · PREVIEW</div><h1 className="mt-2 text-2xl font-black">مرحباً بك في مساحة قبس</h1><p className="mt-1 text-sm text-slate-300">{user.email} · {user.emailVerified ? 'البريد موثّق' : 'البريد غير موثّق'}</p></div>
          <button onClick={handleLogout} disabled={busy} className="rounded-xl border border-[#D5B46B]/50 px-4 py-2 text-sm font-bold text-[#E8CD91] disabled:opacity-50">تسجيل الخروج</button>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#0D2639] p-5"><div className="text-xs text-slate-400">مساحات العمل</div><div className="mt-2 text-3xl font-black text-[#D5B46B]">{workspaces.length}</div></div>
          <div className="rounded-2xl border border-white/10 bg-[#0D2639] p-5"><div className="text-xs text-slate-400">طلبات الخدمات</div><div className="mt-2 text-3xl font-black text-[#D5B46B]">{requests.length}</div></div>
          <div className="rounded-2xl border border-white/10 bg-[#0D2639] p-5"><div className="text-xs text-slate-400">مسودات المتاجر</div><div className="mt-2 text-3xl font-black text-[#D5B46B]">{drafts.length}</div></div>
        </div>

        {error && <p role="alert" className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        {!user.emailVerified && <div className="mb-6 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">حسابك غير موثّق. بعض عمليات الطلب والمستندات تتطلب توثيق البريد، وهي غير متاحة في هذه المعاينة.</div>}

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-[#0D2639] p-5">
            <h2 className="text-lg font-black text-[#D5B46B]">مساحة العمل</h2>
            {workspaces.length ? <div className="mt-4 space-y-3">{workspaces.map(workspace => <div key={workspace.id} className="rounded-xl bg-[#071A2A] p-4"><div className="font-bold">{workspace.name}</div><div className="mt-1 text-xs text-slate-400">{workspace.display_name} · {workspace.role}</div></div>)}</div> : <p className="mt-3 text-sm text-slate-300">لم تنشئ مساحة عمل بعد.</p>}
            {!workspaces.length && <form onSubmit={createWorkspace} className="mt-4 space-y-3"><input required maxLength={100} value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} aria-label="اسم مساحة العمل" className="w-full rounded-xl border border-white/10 bg-[#071A2A] px-4 py-3" placeholder="اسم مساحة العمل" /><input required maxLength={80} value={displayName} onChange={e => setDisplayName(e.target.value)} aria-label="اسم صاحب الحساب" className="w-full rounded-xl border border-white/10 bg-[#071A2A] px-4 py-3" placeholder="اسم العرض" /><button disabled={busy} className="rounded-xl bg-[#D5B46B] px-4 py-3 text-sm font-black text-[#14243E] disabled:opacity-50">إنشاء مساحة العمل</button></form>}
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0D2639] p-5">
            <h2 className="text-lg font-black text-[#D5B46B]">مسودات المتاجر</h2>
            {drafts.length ? <div className="mt-4 space-y-2">{drafts.map(draft => <div key={draft.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#071A2A] p-3"><div><div className="font-bold">{draft.name}</div><div className="text-xs text-slate-400">{templateLabel.get(draft.template_key) || draft.template_key}</div></div><span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">مسودة</span></div>)}</div> : <p className="mt-3 text-sm text-slate-300">لا توجد مسودات متاجر حتى الآن.</p>}
            <form onSubmit={createDraft} className="mt-4 space-y-3"><input required maxLength={120} value={draftName} onChange={e => setDraftName(e.target.value)} aria-label="اسم المتجر" className="w-full rounded-xl border border-white/10 bg-[#071A2A] px-4 py-3" placeholder="اسم المتجر الجديد" /><select value={templateKey} onChange={e => setTemplateKey(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-[#071A2A] px-4 py-3">{templates.map(template => <option key={template.key} value={template.key}>{template.ar || template.en}</option>)}</select><button disabled={busy || !templates.length} className="rounded-xl bg-[#D5B46B] px-4 py-3 text-sm font-black text-[#14243E] disabled:opacity-50">إنشاء مسودة متجر</button></form>
            <p className="mt-3 text-xs text-slate-400">المتجر يُنشأ كمسودة فقط؛ لا نشر ولا نطاق ولا تحصيل مدفوعات.</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0D2639] p-5">
            <h2 className="text-lg font-black text-[#D5B46B]">طلبات الخدمات</h2>
            {requests.length ? <div className="mt-4 space-y-2">{requests.slice(0, 8).map(request => <div key={request.id} className="rounded-xl bg-[#071A2A] p-3"><div className="font-bold">{labelOf(request.title, request.service)}</div><div className="mt-1 text-xs text-slate-400">{request.status} · {request.created_at || '—'}</div></div>)}</div> : <p className="mt-3 text-sm text-slate-300">لا توجد طلبات مسجلة في هذه المساحة.</p>}
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0D2639] p-5">
            <h2 className="text-lg font-black text-[#D5B46B]">دليل الخدمات</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">{services.slice(0, 12).map((service, index) => <div key={String(service.key || index)} className="rounded-xl bg-[#071A2A] p-3 text-sm">{labelOf(service.titleAr || service.nameAr || service.title || service.name || service.ar || service.en, 'خدمة قبس')}</div>)}</div>
            <div className="mt-4 rounded-xl border border-[#D5B46B]/20 bg-[#071A2A] p-3 text-xs text-slate-300">حالة الدفع: {config?.payments === true ? 'متاح وفق إعدادات البيئة' : 'غير مفعّل'} · بيئة: {labelOf(config?.stage, 'معاينة')}</div>
          </article>
        </div>
      </div>
    </section>
  );
};
