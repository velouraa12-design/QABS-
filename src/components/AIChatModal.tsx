import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ApiError, qabsApi } from '../services/qabsApi.ts';
import { X, Sparkles, Send, Bot, Copy, Check, RefreshCw } from 'lucide-react';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const { language, showToast, backendStatus, isAuthenticated, activeStoreId, user, refreshWorkspace, openClientAuth } = useApp();
  const isAr = language === 'ar';

  const welcomeText = backendStatus === 'connected' && isAuthenticated
    ? isAr
      ? 'مرحباً بك في مستشار قبس الذكي. عند توفر رصيد كافٍ واتصال الخادم، تُرسل الطلبات إلى محرك الذكاء الاصطناعي وتُسجل نتائجها.'
      : 'Welcome to QABS AI. When the server is connected and credits are available, requests are sent to the AI engine and recorded.'
    : isAr
      ? 'مرحباً بك في معاينة قبس AI. محرك الذكاء الاصطناعي غير متصل حالياً؛ لن يتم تنفيذ الطلبات أو خصم الأرصدة في هذه المعاينة.'
      : 'Welcome to the QABS AI preview. The AI engine is not connected; prompts will not execute and no credits will be deducted in this preview.';

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; provider?: string }[]
  >([{ role: 'assistant', text: welcomeText }]);

  useEffect(() => {
    setMessages(prev => prev.length === 1 && prev[0].role === 'assistant'
      ? [{ role: 'assistant', text: welcomeText }]
      : prev);
  }, [welcomeText]);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      titleAr: 'صياغة قرار بنكي لمصرف Mercury',
      titleEn: 'Draft Mercury Bank Board Resolution',
      promptAr: 'اكتب صيغة قرار مجلس إدارة رسمي (Banking Authorization Resolution) لشركة ذات مسؤولية محدودة في وايومنغ لفتح حساب لدى مصرف Mercury.',
      promptEn: 'Draft a formal Banking Authorization Resolution for a Wyoming LLC to open a commercial account with Mercury Bank.'
    },
    {
      titleAr: 'تهيئة بوابة Tap و Moyasar لمتجري',
      titleEn: 'Configure Tap & Moyasar for GCC Store',
      promptAr: 'لخّص متطلبات ربط بوابتي Tap Payments و Moyasar لقبول مدى وأبل باي في متجر خليجي مع عرض حالة المتجر الحالية.',
      promptEn: 'Outline Tap Payments & Moyasar setup requirements for mada/Apple Pay alongside current store inventory metrics.'
    },
    {
      titleAr: 'حملة إعلانية لزيادة المبيعات',
      titleEn: 'Multi-Channel Ad Copy & Hooks',
      promptAr: 'اقترح 3 أفكار إعلانية مع خطافات قوية (Hooks) لحملة تيك توك وسناب شات لمنتجات متجرنا الحالية.',
      promptEn: 'Generate 3 high-impact hooks and scripts for TikTok & Snapchat ads tailored to our store catalog.'
    }
  ];

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || prompt).trim();
    if (!textToSend) return;

    if (backendStatus === 'connected' && !isAuthenticated) {
      showToast(isAr ? 'يرجى تسجيل الدخول لاستخدام QABS AI وخصم الرصيد الموثق' : 'Please sign in to execute AI requests');
      openClientAuth('login');
      return;
    }

    const newMsgs = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMsgs);
    setPrompt('');
    setLoading(true);

    try {
      if (backendStatus === 'connected') {
        const res = await qabsApi.executeAI(textToSend, activeStoreId || undefined, 'chat', language);
        await refreshWorkspace();
        const replyText = isAr ? res.result.responseAr : res.result.responseEn;
        setMessages([...newMsgs, { role: 'assistant', text: replyText, provider: res.provider || res.result.provider }]);
        showToast(isAr ? `تم التنفيذ — الرصيد المتبقي: ${res.creditsBalance}` : `Executed — Credits left: ${res.creditsBalance}`);
      } else {
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            text: isAr
              ? 'الخادم غير متصل حالياً (وضع المعاينة غير المتصل). أعد تشغيل الخادم للاتصال بمحرك QABS AI وسجل الرصيد.'
              : 'Backend is unreachable in offline preview mode. Connect to the QABS server to execute AI requests.'
          }
        ]);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      const msg =
        apiErr?.code === 'INSUFFICIENT_CREDITS'
          ? isAr
            ? 'رصيد الذكاء الاصطناعي غير كافٍ. يرجى شحن الرصيد من قسم الفوترة.'
            : 'Insufficient AI credits. Please top up credits in Billing.'
          : apiErr?.message || (isAr ? 'تعذر تنفيذ الطلب في الخادم.' : 'Failed to execute AI request.');
      setMessages([...newMsgs, { role: 'assistant', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(isAr ? 'تم نسخ النص إلى الحافظة' : 'Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#082030] border border-cyan-950/80 rounded-xl shadow-2xl max-w-2xl w-full h-[85vh] text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-950/60 bg-[#03131D]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg border border-[#D4AF37]/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'استوديو قبس للذكاء الاصطناعي' : 'QABS AI Business Studio'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00A389]/20 text-[#00A389] font-mono">
                  {backendStatus === 'connected' && isAuthenticated
                    ? `${user.credits} credits`
                    : backendStatus === 'connected'
                    ? (isAr ? 'يتطلب تسجيل الدخول' : 'Sign-in required')
                    : (isAr ? 'معاينة غير متصلة' : 'Offline Preview')}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'صياغة المستندات القانونية، أوصاف المتاجر، وحملات التسويق' : 'Legal resolution drafting, store copywriter & ad strategist'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-[#051724] border-b border-cyan-950/40 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            {isAr ? 'أوامر سريعة:' : 'Quick Prompts:'}
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(isAr ? qp.promptAr : qp.promptEn)}
              className="text-[11px] px-2.5 py-1 bg-[#082030] hover:bg-[#0E2E44] border border-cyan-950/80 rounded-md text-slate-300 hover:text-[#D4AF37] whitespace-nowrap transition-colors cursor-pointer"
            >
              {isAr ? qp.titleAr : qp.titleEn}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-[#00A389] to-[#008F78] text-white shadow-sm'
                    : 'bg-[#051724] border border-cyan-950/70 text-slate-200 shadow-md'
                }`}
              >
                {m.text}

                {m.role === 'assistant' && idx > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">QABS-AI v2.4</span>
                    <button
                      onClick={() => copyToClipboard(m.text)}
                      className="flex items-center gap-1 text-[11px] text-[#D4AF37] hover:underline cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{isAr ? 'نسخ النص' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-3 bg-[#051724] border border-cyan-950 rounded-lg max-w-[50%]">
              <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
              <span>{isAr ? 'جاري الصياغة بواسطة الذكاء الاصطناعي...' : 'Generating tailored draft...'}</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-[#03131D]/90 border-t border-cyan-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={isAr ? 'اكتب طلبك للذكاء الاصطناعي (مثال: صياغة عقد تأسيس أو خطة تسويق)...' : 'Type your legal or business request...'}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 bg-[#051724] border border-cyan-950 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !prompt.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-slate-950 font-bold rounded-lg text-xs hover:from-[#C59B27] hover:to-[#E5D28A] transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>{isAr ? 'إرسال' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
