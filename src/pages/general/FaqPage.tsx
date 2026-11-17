import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import {
  ALL_SERVICE_PAGES,
  GENERAL_PAGES,
  SERVICE_CATEGORY_LABELS
} from '../../data/pages/index.ts';
import { GeneralPageTemplate } from '../../components/pages/GeneralPageTemplate.tsx';
import { ServiceCategoryId, ServiceFaq } from '../../types/pages.ts';
import { Search, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';

interface CategorizedFaq extends ServiceFaq {
  category: ServiceCategoryId | 'general';
  sourceTitleAr: string;
  sourceTitleEn: string;
  sourcePath: string;
}

const GENERAL_FAQS: CategorizedFaq[] = [
  {
    questionAr: 'هل يمكنني تأسيس شركة أمريكية أو بريطانية وفتح متجر دون السفر؟',
    questionEn: 'Can I incorporate a US/UK company and launch a store without traveling?',
    answerAr: 'نعم، كافة إجراءات التأسيس في الولايات الأمريكية الـ 50 وبريطانيا واستخراج الرقم الضريبي EIN وتجهيز المتجر تتم إلكترونياً عن بُعد بنسبة ملكية 100%.',
    answerEn: 'Yes, all formation filings across 50 US states and the UK, IRS EIN retrieval, and store setup are completed 100% remotely with full founder ownership.',
    category: 'general',
    sourceTitleAr: 'عن منصة قبس',
    sourceTitleEn: 'About QABS',
    sourcePath: '/about'
  },
  {
    questionAr: 'هل الأسعار المعروضة تشمل الرسوم الحكومية أم هي منفصلة؟',
    questionEn: 'Are statutory government filing fees included or separated?',
    answerAr: 'تعتمد قبس الشفافية التامة: يتم فصل أتعاب المنصة والوكيل المسجل عن رسوم الولاية الحكومية في الحاسبة وصفحة الأسعار لتعرف تكلفة كل بند بدقة قبل الدفع.',
    answerEn: 'QABS enforces full fee transparency: our platform & agent fees are itemized separately from statutory state filing fees before checkout.',
    category: 'general',
    sourceTitleAr: 'الأسعار المعتمدة',
    sourceTitleEn: 'Pricing Overview',
    sourcePath: '/pricing'
  },
  {
    questionAr: 'كيف أتابع مراحل تنفيذ طلبي بعد الإرسال؟',
    questionEn: 'How do I track my service order after submission?',
    answerAr: 'يصدر لك النظام رقماً مرجعياً فورياً (QBS-XXXXXX) عند إرسال الطلب، كما يمكنك تسجيل الدخول لمساحة عمل العملاء لمتابعة حالة الملف والوثائق والفواتير لحظياً.',
    answerEn: 'You receive an instant reference code (QBS-XXXXXX) upon submission and can sign in to the Client Workspace to track milestones, documents, and invoices live.',
    category: 'general',
    sourceTitleAr: 'كيف تعمل المنصة',
    sourceTitleEn: 'How It Works',
    sourcePath: '/how-it-works'
  }
];

export const FaqPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const page = GENERAL_PAGES.faq;
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | ServiceCategoryId>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const allFaqs = useMemo<CategorizedFaq[]>(() => {
    const serviceFaqs: CategorizedFaq[] = ALL_SERVICE_PAGES.flatMap(svc =>
      svc.faqs.map(faq => ({
        ...faq,
        category: svc.category,
        sourceTitleAr: svc.titleAr,
        sourceTitleEn: svc.titleEn,
        sourcePath: svc.path
      }))
    );
    return [...GENERAL_FAQS, ...serviceFaqs];
  }, []);

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allFaqs.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.questionAr.toLowerCase().includes(q) ||
        item.questionEn.toLowerCase().includes(q) ||
        item.answerAr.toLowerCase().includes(q) ||
        item.answerEn.toLowerCase().includes(q) ||
        item.sourceTitleAr.toLowerCase().includes(q) ||
        item.sourceTitleEn.toLowerCase().includes(q)
      );
    });
  }, [allFaqs, search, selectedCategory]);

  const categories: { id: 'all' | 'general' | ServiceCategoryId; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: `الكل (${allFaqs.length})`, labelEn: `All (${allFaqs.length})` },
    { id: 'general', labelAr: 'أسئلة المنصة العامة', labelEn: 'General Platform' },
    {
      id: 'formation',
      labelAr: SERVICE_CATEGORY_LABELS.formation.ar,
      labelEn: SERVICE_CATEGORY_LABELS.formation.en
    },
    {
      id: 'compliance',
      labelAr: SERVICE_CATEGORY_LABELS.compliance.ar,
      labelEn: SERVICE_CATEGORY_LABELS.compliance.en
    },
    {
      id: 'stores',
      labelAr: SERVICE_CATEGORY_LABELS.stores.ar,
      labelEn: SERVICE_CATEGORY_LABELS.stores.en
    },
    {
      id: 'payments',
      labelAr: SERVICE_CATEGORY_LABELS.payments.ar,
      labelEn: SERVICE_CATEGORY_LABELS.payments.en
    },
    {
      id: 'digital',
      labelAr: SERVICE_CATEGORY_LABELS.digital.ar,
      labelEn: SERVICE_CATEGORY_LABELS.digital.en
    }
  ];

  return (
    <GeneralPageTemplate
      page={page}
      schemaType="FAQPage"
      faqs={allFaqs.slice(0, 12)}
      headerAction={
        <AppLink
          to="/support"
          className="px-5 py-3 rounded-xl bg-[#D5B46B] hover:bg-[#c5a358] text-[#14243E] font-black text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span>{isAr ? 'لم تجد إجابتك؟ تواصل مع الدعم' : 'Need Help? Open Support Ticket'}</span>
          <ArrowIcon className="w-4 h-4" />
        </AppLink>
      }
    >
      {/* Search & Category Filter */}
      <section className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 space-y-5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-4" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setOpenIndex(0);
            }}
            placeholder={
              isAr
                ? 'ابحث في جميع الأسئلة (مثال: EIN، وايومنغ، Stripe، Shopify، الوكيل المسجل)...'
                : 'Search all FAQs (e.g. EIN, Wyoming, Stripe, Shopify, Registered Agent)...'
            }
            className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] ps-11 pe-4 py-3 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setOpenIndex(0);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#14243E] text-[#D5B46B] border border-[#D5B46B]'
                  : 'bg-[#F8F7F2] dark:bg-[#051724] text-slate-700 dark:text-slate-300 border border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B]'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>
      </section>

      {/* Accordion List */}
      <section className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-10 text-center space-y-3">
            <HelpCircle className="w-8 h-8 text-[#92743A] mx-auto" />
            <div className="text-sm font-black text-[#14243E] dark:text-white">
              {isAr ? 'لا توجد أسئلة مطابقة لبحثك' : 'No matching questions found'}
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#14243E] text-white text-xs font-bold cursor-pointer"
            >
              {isAr ? 'إعادة ضبط البحث' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={`${faq.sourcePath}-${idx}`}
                className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-start flex items-center justify-between gap-4 hover:bg-[#F8F7F2]/60 dark:hover:bg-[#051724]/50 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-[#92743A] dark:text-[#D5B46B]">
                      {isAr ? faq.sourceTitleAr : faq.sourceTitleEn}
                    </div>
                    <div className="text-sm sm:text-base font-black text-[#14243E] dark:text-white">
                      {isAr ? faq.questionAr : faq.questionEn}
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#92743A] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-[#EAE6DC]/60 dark:border-slate-800 space-y-3">
                    <p>{isAr ? faq.answerAr : faq.answerEn}</p>
                    <div>
                      <AppLink
                        to={faq.sourcePath}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-[#14243E] dark:text-[#D5B46B] hover:underline"
                      >
                        <span>
                          {isAr
                            ? `عرض صفحة الخدمة: ${faq.sourceTitleAr}`
                            : `Open Related Page: ${faq.sourceTitleEn}`}
                        </span>
                        <ArrowIcon className="w-3.5 h-3.5" />
                      </AppLink>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </GeneralPageTemplate>
  );
};
