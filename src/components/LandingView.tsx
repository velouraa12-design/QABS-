import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useCustomizer } from '../context/CustomizerContext.tsx';
import { AppLink } from '../context/RouterContext.tsx';
import {
  SERVICE_CATEGORY_LABELS,
  getServicesByCategory
} from '../data/pages/index.ts';
import { ServiceCategoryId } from '../types/pages.ts';
import { SUBSCRIPTION_PLANS } from '../data/mockData.ts';
import { US_STATES_PRICING, QABS_FORMATION_PKGS } from '../data/usStatesPricing.ts';
import { usePageSeo } from '../utils/seo.ts';
import {
  Building2,
  Store,
  ShieldCheck,
  CreditCard,
  Globe,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  Landmark,
  FileCheck2,
  Phone,
  HelpCircle,
  ArrowRight,
  Calculator,
  Coins,
  Bot,
  Lock
} from 'lucide-react';

interface LandingViewProps {
  onOpenFormationModal: (stateCode?: string) => void;
  onOpenStoreModal: () => void;
  onOpenAIModal?: () => void;
}

type CalcJurisdiction = 'US_WYOMING' | 'US_DELAWARE' | 'US_KENTUCKY' | 'US_NEW_MEXICO' | 'UK_LTD';

const CALC_JURISDICTIONS: {
  id: CalcJurisdiction;
  stateCode: string;
  labelAr: string;
  labelEn: string;
  entityType: 'LLC' | 'C-CORP' | 'LTD';
  baseUsd: number;
  noteAr: string;
  noteEn: string;
}[] = [
  {
    id: 'US_WYOMING',
    stateCode: 'WY',
    labelAr: 'وايومنغ الأمريكية (Wyoming LLC)',
    labelEn: 'Wyoming LLC (USA)',
    entityType: 'LLC',
    baseUsd: 249,
    noteAr: 'خيار محتمل لبعض الأنشطة الرقمية؛ راجع الرسوم والالتزامات قبل الاختيار',
    noteEn: 'A possible option for some digital businesses; review fees and obligations before choosing'
  },
  {
    id: 'US_DELAWARE',
    stateCode: 'DE',
    labelAr: 'ديلاوير الأمريكية (Delaware LLC / C-Corp)',
    labelEn: 'Delaware LLC / C-Corp',
    entityType: 'LLC',
    baseUsd: 260,
    noteAr: 'المعيار الاستثماري للشركات الناشئة والبنوك',
    noteEn: 'Gold standard for startups & venture scaling'
  },
  {
    id: 'US_KENTUCKY',
    stateCode: 'KY',
    labelAr: 'كنتاكي الأمريكية (Kentucky LLC)',
    labelEn: 'Kentucky LLC (USA)',
    entityType: 'LLC',
    baseUsd: 189,
    noteAr: 'رسوم حكومية اقتصادية وسرعة إيداع عالية',
    noteEn: 'Lowest state filing fee & fast turnaround'
  },
  {
    id: 'US_NEW_MEXICO',
    stateCode: 'NM',
    labelAr: 'نيو مكسيكو (New Mexico LLC)',
    labelEn: 'New Mexico LLC (USA)',
    entityType: 'LLC',
    baseUsd: 199,
    noteAr: 'خصوصية عالية وبدون رسوم تقرير سنوي',
    noteEn: 'Full privacy & $0 annual state report'
  },
  {
    id: 'UK_LTD',
    stateCode: 'UK',
    labelAr: 'المملكة المتحدة (UK LTD)',
    labelEn: 'United Kingdom (UK LTD)',
    entityType: 'LTD',
    baseUsd: 179,
    noteAr: 'تأسيس أوروبي سريع للتجارة وبوابات الدفع',
    noteEn: 'Fast UK Companies House registration'
  }
];

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenFormationModal,
  onOpenStoreModal: _onOpenStoreModal,
  onOpenAIModal: _onOpenAIModal
}) => {
  const { language, setMode, isAuthenticated, requestServiceAction, openClientAuth, sectionSettings } = useApp();
  const { siteContent } = useCustomizer();
  const isAr = language === 'ar';

  usePageSeo({
    titleAr: 'قبس الرقمية QABS | تأسيس الشركات الأمريكية والبريطانية والمتاجر وبوابات الدفع',
    titleEn: 'QABS Digital Platform | US & UK Company Formation, Stores & Payment Gateways',
    descriptionAr:
      'منصة قبس الرقمية المتكاملة: تأسيس شركات LLC و C-Corp في الـ 50 ولاية وبريطانيا، الرقم الضريبي EIN، المتاجر المستقلة، بوابات الدفع، والخدمات الرقمية.',
    descriptionEn:
      'QABS Digital Platform: 50-state US LLC & UK LTD formation, IRS EIN, isolated multi-tenant e-commerce stores, payment gateways, and digital business services.',
    path: '/',
    schemaType: 'WebPage'
  });

  // Interactive Formation Calculator State
  const [calcJurisdiction, setCalcJurisdiction] = useState<CalcJurisdiction>('US_WYOMING');
  const [calcCompanyName, setCalcCompanyName] = useState('');
  const [calcAddons, setCalcAddons] = useState({
    ein: true,
    physicalAddressAgent: true,
    businessBank: false,
    stripePayPal: false
  });

  // Store Package Cycle & Name
  const [storeBillingCycle, setStoreBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showcaseStoreName, setShowcaseStoreName] = useState('');

  // Collapsible states pricing
  const [showStatesPricing, setShowStatesPricing] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | 'popular' | 'zero_tax' | 'low_fee'>('all');
  const [selectedPkgId, setSelectedPkgId] = useState<'starter' | 'complete' | 'premium'>('complete');

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedCalcJur = CALC_JURISDICTIONS.find(j => j.id === calcJurisdiction) || CALC_JURISDICTIONS[0];
  const einFee = sectionSettings.companyFormation.einFeeUsd || 79;
  const agentFee = sectionSettings.companyFormation.registeredAgentFeeUsd || 59;
  const bankFee = 49;
  const gatewayFee = 69;

  const calcTotalUsd =
    selectedCalcJur.baseUsd +
    (calcAddons.ein ? einFee : 0) +
    (calcAddons.physicalAddressAgent ? agentFee : 0) +
    (calcAddons.businessBank ? bankFee : 0) +
    (calcAddons.stripePayPal ? gatewayFee : 0);
  const calcTotalSar = Math.round(calcTotalUsd * 3.75);

  const handleOpenPortalSafe = () => {
    if (isAuthenticated) {
      setMode('portal');
    } else {
      openClientAuth('login');
    }
  };

  const handleFormationAction = (stateCode?: string) => {
    if (isAuthenticated) {
      onOpenFormationModal(stateCode || selectedCalcJur.stateCode);
      return;
    }
    const foundJur = CALC_JURISDICTIONS.find(j => j.stateCode === stateCode) || selectedCalcJur;
    requestServiceAction({
      id: `svc_cf_${Date.now()}`,
      serviceType: 'company_formation',
      titleAr: `تأسيس شركة ${foundJur.labelAr}`,
      titleEn: `Form ${foundJur.labelEn}`,
      subtitleAr: 'تشمل تجهيز ملف التأسيس الرسمي، الوكيل المسجل، والمتابعة حتى الإصدار',
      subtitleEn: 'Includes official filing package, registered agent & full workspace tracking',
      priceUsd: foundJur.baseUsd + einFee + agentFee,
      details: {
        jurisdiction: foundJur.id,
        companyName: calcCompanyName.trim() || undefined,
        entityType: foundJur.entityType,
        addons: {
          ein: true,
          physicalAddressAgent: true,
          businessBank: false,
          stripePayPal: false
        }
      }
    });
  };

  const handleCalculatorOrder = () => {
    const enabledLabelsAr: string[] = [];
    const enabledLabelsEn: string[] = [];
    if (calcAddons.ein) {
      enabledLabelsAr.push('الرقم الضريبي EIN');
      enabledLabelsEn.push('IRS EIN');
    }
    if (calcAddons.physicalAddressAgent) {
      enabledLabelsAr.push('وكيل مسجل وعنوان رسمي');
      enabledLabelsEn.push('Registered Agent & Address');
    }
    if (calcAddons.businessBank) {
      enabledLabelsAr.push('تجهيز البنك التجاري');
      enabledLabelsEn.push('Mercury/Relay Bank Setup');
    }
    if (calcAddons.stripePayPal) {
      enabledLabelsAr.push('ربط Stripe و PayPal');
      enabledLabelsEn.push('Stripe & PayPal Setup');
    }

    requestServiceAction({
      id: `svc_calc_${Date.now()}`,
      serviceType: 'company_formation',
      titleAr: `طلب تأسيس: ${selectedCalcJur.labelAr}`,
      titleEn: `Formation Order: ${selectedCalcJur.labelEn}`,
      subtitleAr: enabledLabelsAr.length > 0 ? `الخدمات المضافة: ${enabledLabelsAr.join(' + ')}` : selectedCalcJur.noteAr,
      subtitleEn: enabledLabelsEn.length > 0 ? `Add-ons: ${enabledLabelsEn.join(' + ')}` : selectedCalcJur.noteEn,
      priceUsd: calcTotalUsd,
      details: {
        jurisdiction: selectedCalcJur.id,
        companyName: calcCompanyName.trim() || undefined,
        entityType: selectedCalcJur.entityType,
        addons: { ...calcAddons }
      }
    });
  };

  const selectedPkg =
    QABS_FORMATION_PKGS.find(p => p.id === selectedPkgId) || QABS_FORMATION_PKGS[1];

  const filteredStates = US_STATES_PRICING.filter(st => {
    const matchesSearch =
      st.nameAr.includes(stateSearch) ||
      st.nameEn.toLowerCase().includes(stateSearch.toLowerCase()) ||
      st.code.toLowerCase().includes(stateSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (stateFilter === 'popular') return st.tags.includes('popular');
    if (stateFilter === 'zero_tax') return st.tags.includes('zero_tax');
    if (stateFilter === 'low_fee') return st.stateFilingFee <= 100;
    return true;
  });

  const faqs = [
    {
      qAr: 'هل يمكن لغير المقيم تأسيس شركة أمريكية؟',
      qEn: 'Can a non-US resident form a US company?',
      aAr: 'تسمح ولايات أمريكية عديدة لغير المقيمين بتأسيس شركات LLC أو C-Corp وتملكها بالكامل، لكن الأهلية والمتطلبات تختلف حسب الولاية ونوع النشاط ووضع المالك. يجب مراجعة الجوانب القانونية والضريبية قبل اختيار مسار التأسيس.',
      aEn: 'Many US states allow non-residents to form and fully own an LLC or C-Corp, but eligibility and requirements vary by state, business activity, and owner circumstances. Legal and tax considerations should be reviewed before choosing a formation path.'
    },
    {
      qAr: 'ما هو الفرق بين التأسيس في وايومنغ (Wyoming) وديلاوير (Delaware)؟',
      qEn: 'What is the difference between Wyoming and Delaware formation?',
      aAr: 'تختلف وايومنغ وديلاوير في الرسوم ومتطلبات التقارير والحوكمة. قد تناسب وايومنغ بعض الأنشطة، بينما تختار شركات تستهدف الاستثمار ديلاوير. لا ينبغي اختيار الولاية بناءً على ضريبة الولاية وحدها؛ فقد تنطبق ضرائب اتحادية ورسوم والتزامات أخرى بحسب الحالة.',
      aEn: 'Wyoming and Delaware differ in fees, reporting requirements, and corporate rules. Wyoming may suit some businesses, while companies seeking venture investment often consider Delaware. State tax alone should not determine the choice; federal taxes, fees, and other obligations may also apply.'
    },
    {
      qAr: 'كم يستغرق إصدار الرقم الضريبي الفيدرالي EIN للشركات لغير المقيمين؟',
      qEn: 'How long does IRS EIN issuance take for non-residents?',
      aAr: 'تختلف مدة إصدار رقم EIN وخطاب CP575 بحسب حالة الطلب وطريقة تقديمه ومتطلبات مصلحة الضرائب الأمريكية (IRS). لا يمكن ضمان مدة محددة قبل مراجعة الحالة والقناة المتاحة.',
      aEn: 'IRS EIN and CP575 processing times vary by application details, submission method, and IRS requirements. A specific timeline cannot be guaranteed before the case and available channel are reviewed.'
    },
    {
      qAr: 'كيف يساعدني الكيان في ربط بوابات الدفع Stripe والحساب البنكي؟',
      qEn: 'How does the entity facilitate Stripe and US banking approval?',
      aAr: 'بمجرد صدور وثائق التأسيس والرقم الضريبي EIN وعنوان الوكيل المسجل، يصبح لديك ملف تجاري أمريكي متكامل يؤهلك لفتح حسابات بنكية أعمال (مثل Mercury و Wise Business) والتقديم على بوابات الدفع العالمية مثل Stripe و PayPal.',
      aEn: 'With state formation papers, IRS EIN, and registered address, you possess a compliant US business profile to open business fintech accounts (Mercury, Wise) and apply for Stripe and PayPal.'
    },
    {
      qAr: 'هل يمكنني إدارة متاجري الإلكترونية وتأسيس الشركات من نفس لوحة التحكم؟',
      qEn: 'Can I manage my online stores and corporate entities from one unified portal?',
      aAr: 'نعم تماماً! تقدم منصة قبس الموحدة لوحة تحكم واحدة تجمع إدارة ملفات تأسيس الشركات ووثائقها القانونية، إلى جانب إدارة متاجرك الإلكترونية المستقلة ومنتجاتها وطلباتها واستوديو التصميم.',
      aEn: 'Yes! QABS provides a unified dashboard merging corporate entity filings and legal compliance with independent online stores, product catalogs, and QABS Studio design.'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. EXECUTIVE HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F2F9F9] to-white dark:from-[#03131D] dark:via-[#062030] dark:to-[#03131D] pt-10 pb-16 border-b-2 border-[#00A896]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Text Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#004457]/10 dark:bg-teal-950/80 border border-[#00A896]/40 text-[#004457] dark:text-teal-300 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5 text-[#00A896]" />
                <span>{isAr ? siteContent.heroBadgeAr : siteContent.heroBadgeEn}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-[#003445] dark:text-white leading-tight">
                {isAr ? siteContent.heroTitleAr : siteContent.heroTitleEn}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl">
                {isAr ? siteContent.heroSubtitleAr : siteContent.heroSubtitleEn}
              </p>

              {/* Primary Hero Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#formation-calculator"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#14243E] via-[#004457] to-[#006D77] text-white font-black text-xs sm:text-sm shadow-lg hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-[#D5B46B]" />
                  <span>{isAr ? 'احسب تكلفة تأسيس شركتك الآن' : 'Calculate Formation Price'}</span>
                </a>

                <button
                  type="button"
                  onClick={handleOpenPortalSafe}
                  className="px-5 py-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-[#14243E] dark:border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B] font-black text-xs sm:text-sm hover:bg-[#F8F7F2] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Store className="w-4 h-4 text-[#92743A]" />
                  <span>{isAuthenticated ? (isAr ? 'دخول مساحة العمل' : 'Open Workspace') : isAr ? 'تسجيل الدخول / حسابي' : 'Sign In / My Account'}</span>
                </button>

                <a
                  href="#store-packages"
                  className="px-4 py-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-[#D5B46B]/60 text-[#14243E] dark:text-[#D5B46B] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-[#92743A]" />
                  <span>{isAr ? 'باقات المتاجر الإلكترونية' : 'Store Packages'}</span>
                </a>
              </div>

              {/* Official Quick Links Strip */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <a
                  href="https://qabs1.store"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00A896] font-mono font-bold flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5 text-[#00A896]" />
                  <span>qabs1.store</span>
                </a>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleOpenPortalSafe}
                  className="hover:text-[#00A896] font-mono font-bold cursor-pointer"
                >
                  portal.qabs1.store
                </button>
                <span>•</span>
                <a
                  href={`https://wa.me/${siteContent.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00A896] font-mono font-bold flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C8A24A]" />
                  <span dir="ltr">{siteContent.whatsappNumber}</span>
                </a>
              </div>
            </div>

            {/* Hero Right Column: Turnkey Package Showcase Card ($349) */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-[#071D2B] border-2 border-[#D5B46B]/60 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <img
                    src="/qabas-logo.png"
                    alt="QABS | قبس"
                    className="h-12 w-auto object-contain bg-white rounded-xl px-2 py-1 border border-slate-100"
                  />
                  <div className="text-left">
                    <span className="text-[11px] text-slate-400 block font-bold">
                      {isAr ? 'باقة التأسيس والدفع الشاملة' : 'Turnkey Launch Package'}
                    </span>
                    <span className="text-2xl font-black text-[#14243E] dark:text-[#D5B46B] font-mono">
                      ${siteContent.showcasePrice}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#14243E] dark:text-white">
                    {isAr ? siteContent.showcasePackageTitleAr : siteContent.showcasePackageTitleEn}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isAr
                      ? 'تشمل تأسيس الشركة الأمريكية، الرقم الضريبي EIN، العنوان، وتجهيز بوابات الدفع والمتجر الإلكتروني'
                      : 'Includes US LLC formation, IRS EIN, Registered Agent address, payment gateway prep & store'}
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {(isAr ? siteContent.showcaseFeaturesAr : siteContent.showcaseFeaturesEn).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#92743A] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      requestServiceAction({
                        id: `svc_turnkey_${Date.now()}`,
                        serviceType: 'company_formation',
                        titleAr: isAr ? siteContent.showcasePackageTitleAr : 'باقة التأسيس الشاملة',
                        titleEn: siteContent.showcasePackageTitleEn,
                        subtitleAr: 'تأسيس شركة أمريكية + EIN + وكيل مسجل + تجهيز الدفع',
                        subtitleEn: 'Full US LLC + IRS EIN + Registered Agent + Gateway prep',
                        priceUsd: Number(siteContent.showcasePrice) || 349,
                        details: {
                          jurisdiction: 'US_WYOMING',
                          entityType: 'LLC',
                          addons: { ein: true, physicalAddressAgent: true, businessBank: true, stripePayPal: true }
                        }
                      })
                    }
                    className="py-3 px-4 rounded-xl bg-[#14243E] hover:bg-[#1c3357] text-white font-black text-xs transition-all cursor-pointer text-center"
                  >
                    {isAr ? 'اطلب الباقة الآن' : 'Order Package Now'}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenPortalSafe}
                    className="py-3 px-4 rounded-xl bg-[#D5B46B] hover:bg-[#c5a45c] text-[#14243E] font-black text-xs transition-all cursor-pointer text-center"
                  >
                    {isAr ? 'مساحة العمل' : 'Workspace'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent service disclaimer — no unverified performance claims */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="max-w-4xl mx-auto text-center text-xs sm:text-sm leading-7 text-slate-600 dark:text-slate-300">
              {isAr
                ? 'تختلف التكلفة والمدة بحسب الولاية ونوع الخدمة والرسوم الحكومية والمتطلبات الرسمية. تُراجع تفاصيل الطلب والتكلفة قبل اعتماد التنفيذ، وإرسال النموذج لا يعني إيداعاً حكومياً أو ضماناً للموافقة.'
                : 'Pricing and timelines vary by jurisdiction, service scope, government fees, and official requirements. Request details and costs are reviewed before work is approved; submitting a form is not a government filing or a guarantee of approval.'}
            </p>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE COMPANY FORMATION PRICING CALCULATOR (US LLC / UK LTD) */}
      <section id="formation-calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-3xl bg-white dark:bg-[#071D2B] border-2 border-[#D5B46B]/60 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EAE6DC] dark:border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F7F2] dark:bg-slate-900 border border-[#D5B46B]/50 text-[#92743A] text-xs font-black">
                <Calculator className="w-3.5 h-3.5" />
                <span>{isAr ? 'تصفح واحسب التكلفة بحرية قبل التسجيل' : 'Browse & Calculate Freely Before Registering'}</span>
              </div>
              <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
                {isAr
                  ? 'حاسبة تأسيس الشركات الدولية التفاعلية (US LLC & UK LTD)'
                  : 'Interactive International Company Formation Calculator'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {isAr
                  ? 'اختر الولاية والخدمات الإضافية لمعرفة التكلفة الإجمالية بالدولار والريال، ثم اضغط "اطلب الخدمة الآن" لإتمام الطلب.'
                  : 'Select your jurisdiction and optional services for instant pricing, then proceed to checkout.'}
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#14243E] text-white shrink-0">
              <div>
                <div className="text-[11px] text-[#D5B46B] font-bold">
                  {isAr ? 'التكلفة التقديرية الشاملة' : 'Estimated Total'}
                </div>
                <div className="text-2xl font-black font-mono">${calcTotalUsd}</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-xs font-bold text-[#EAE6DC]">
                {isAr ? `~ ${calcTotalSar.toLocaleString()} ر.س` : `~ ${calcTotalSar.toLocaleString()} SAR`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Jurisdiction Selection */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-black text-[#14243E] dark:text-slate-200 mb-2">
                  {isAr ? '1. اختر الولاية أو الاختصاص القانوني:' : '1. Choose Jurisdiction:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CALC_JURISDICTIONS.map(jur => {
                    const active = calcJurisdiction === jur.id;
                    return (
                      <button
                        key={jur.id}
                        type="button"
                        onClick={() => setCalcJurisdiction(jur.id)}
                        className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                          active
                            ? 'border-[#14243E] dark:border-[#D5B46B] bg-[#FBFAF6] dark:bg-slate-900 ring-2 ring-[#D5B46B]/40'
                            : 'border-[#EAE6DC] dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-[#D5B46B]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-[#14243E] dark:text-white">
                            {isAr ? jur.labelAr : jur.labelEn}
                          </span>
                          <span className="font-mono text-xs font-black text-[#92743A] dark:text-[#D5B46B]">
                            ${jur.baseUsd}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {isAr ? jur.noteAr : jur.noteEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#14243E] dark:text-slate-200 mb-1.5">
                  {isAr ? '2. اسم الشركة المقترح (اختياري):' : '2. Proposed Company Name (Optional):'}
                </label>
                <input
                  type="text"
                  value={calcCompanyName}
                  onChange={e => setCalcCompanyName(e.target.value)}
                  placeholder={isAr ? 'مثال: Qabs Ventures LLC' : 'e.g. Atlas Ventures LLC'}
                  className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white"
                />
              </div>
            </div>

            {/* Add-ons & Checkout CTA */}
            <div className="lg:col-span-5 rounded-2xl bg-[#F8F7F2] dark:bg-slate-900/70 border border-[#EAE6DC] dark:border-slate-800 p-5 space-y-4">
              <div className="text-xs font-black text-[#14243E] dark:text-white">
                {isAr ? '3. الخدمات الإضافية المشمولة في الطلب:' : '3. Optional Formation Add-Ons:'}
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  {
                    key: 'ein' as const,
                    titleAr: 'استخراج الرقم الضريبي الفيدرالي (EIN)',
                    titleEn: 'Federal IRS EIN Tax ID',
                    price: einFee
                  },
                  {
                    key: 'physicalAddressAgent' as const,
                    titleAr: 'الوكيل المسجل وعنوان أمريكي/بريطاني معتمد',
                    titleEn: 'Registered Agent & Business Address',
                    price: agentFee
                  },
                  {
                    key: 'businessBank' as const,
                    titleAr: 'ملف وتجهيز الحساب البنكي التجاري (Mercury / Relay)',
                    titleEn: 'Business Bank Account Prep (Mercury / Relay)',
                    price: bankFee
                  },
                  {
                    key: 'stripePayPal' as const,
                    titleAr: 'تجهيز وربط بوابات الدفع (Stripe & PayPal)',
                    titleEn: 'Stripe & PayPal Gateway Onboarding',
                    price: gatewayFee
                  }
                ].map(item => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 cursor-pointer hover:border-[#D5B46B]"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={calcAddons[item.key]}
                        onChange={e =>
                          setCalcAddons(prev => ({
                            ...prev,
                            [item.key]: e.target.checked
                          }))
                        }
                        className="rounded border-slate-300 text-[#14243E]"
                      />
                      <span className="font-bold text-[#14243E] dark:text-slate-200">
                        {isAr ? item.titleAr : item.titleEn}
                      </span>
                    </div>
                    <span className="font-mono font-black text-[#92743A] dark:text-[#D5B46B] shrink-0">
                      +${item.price}
                    </span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCalculatorOrder}
                className="w-full py-3.5 px-5 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Lock className="w-4 h-4 text-[#D5B46B]" />
                <span>
                  {isAr
                    ? `اطلب الخدمة الآن — متابعة للدفع ($${calcTotalUsd})`
                    : `Order Service Now — Checkout ($${calcTotalUsd})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INDEPENDENT STORE PACKAGES & PAYMENT GATEWAYS (STRIPE / PAYPAL / CRYPTO) */}
      <section id="store-packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black text-[#92743A] uppercase">
              {isAr ? 'المتاجر الإلكترونية وبوابات الدفع' : 'Independent Stores & Payment Gateways'}
            </span>
            <h2 className="text-2xl font-black text-[#14243E] dark:text-white mt-1">
              {isAr
                ? 'باقات إنشاء المتاجر الإلكترونية المستقلة وربط Stripe / PayPal / Crypto'
                : 'Standalone Store Packages with Stripe, PayPal & Crypto Gateways'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={showcaseStoreName}
              onChange={e => setShowcaseStoreName(e.target.value)}
              placeholder={isAr ? 'اسم متجرك المقترح (اختياري)...' : 'Store name (optional)...'}
              className="rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
            />
            <div className="inline-flex rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-white dark:bg-slate-900 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStoreBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                  storeBillingCycle === 'monthly' ? 'bg-[#14243E] text-white' : 'text-slate-500'
                }`}
              >
                {isAr ? 'شهري' : 'Monthly'}
              </button>
              <button
                type="button"
                onClick={() => setStoreBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                  storeBillingCycle === 'annual' ? 'bg-[#14243E] text-white' : 'text-slate-500'
                }`}
              >
                {isAr ? 'سنوي' : 'Annual'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SUBSCRIPTION_PLANS.map(plan => {
            const unitPrice = storeBillingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            const totalCharge = storeBillingCycle === 'annual' ? unitPrice * 12 : unitPrice;
            return (
              <div
                key={plan.id}
                className={`rounded-3xl bg-white dark:bg-[#071D2B] p-6 border-2 flex flex-col justify-between space-y-5 shadow-sm ${
                  plan.popular
                    ? 'border-[#D5B46B] shadow-lg'
                    : 'border-[#EAE6DC] dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#F8F7F2] dark:bg-slate-900 border border-[#D5B46B]/50 text-[#92743A] text-[10px] font-black">
                      {isAr ? plan.badgeAr : plan.badgeEn}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <span>Stripe</span>
                      <span>•</span>
                      <span>PayPal</span>
                      <span>•</span>
                      <span>Crypto</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-[#14243E] dark:text-white">
                    {isAr ? plan.nameAr : plan.nameEn}
                  </h3>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black font-mono text-[#14243E] dark:text-[#D5B46B]">
                      ${unitPrice}
                    </span>
                    <span className="text-xs text-slate-500">
                      / {isAr ? 'شهرياً' : 'month'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isAr ? plan.descriptionAr : plan.descriptionEn}
                  </p>

                  <ul className="space-y-2 pt-2 border-t border-[#EAE6DC] dark:border-slate-800">
                    {(isAr ? plan.featuresAr : plan.featuresEn).slice(0, 4).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    requestServiceAction({
                      id: `svc_store_${plan.id}_${Date.now()}`,
                      serviceType: 'store_package',
                      titleAr: isAr ? plan.nameAr : plan.nameEn,
                      titleEn: plan.nameEn,
                      subtitleAr: `إنشاء متجر مستقل مع بوابات Stripe / PayPal / Crypto (${storeBillingCycle === 'annual' ? 'اشتراك سنوي' : 'اشتراك شهري'})`,
                      subtitleEn: `Standalone Store + Stripe / PayPal / Crypto (${storeBillingCycle})`,
                      priceUsd: totalCharge,
                      details: {
                        planId: plan.id,
                        billingCycle: storeBillingCycle,
                        storeName: showcaseStoreName.trim() || undefined
                      }
                    })
                  }
                  className="w-full py-3 px-4 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white font-black text-xs cursor-pointer transition-colors"
                >
                  {isAr ? `اطلب الباقة الآن ($${totalCharge})` : `Order Plan Now ($${totalCharge})`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. QABS AI TOOLS & DIGITAL SERVICES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-black text-[#00A896] uppercase">
            {isAr ? 'أدوات قبس AI والخدمات الرقمية' : 'QABS AI Tools & Digital Services'}
          </span>
          <h2 className="text-2xl font-black text-[#14243E] dark:text-white mt-1">
            {isAr
              ? 'باقات قبس AI للأتمتة الذكية وإدارة المنتجات والطلبات'
              : 'QABS AI Smart Automation & Digital Credit Packs'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              id: 'ai_500',
              credits: 500,
              priceUsd: 29,
              titleAr: 'باقة قبس AI الأساسية (500 رصيد)',
              titleEn: 'QABS AI Starter (500 Credits)',
              descAr: 'أوامر ذكية لتسعير المنتجات، صياغة الأوصاف الاحترافية، وإنشاء كوبونات الخصم تلقائياً.',
              descEn: 'Smart commands for product pricing, copywriting, and automated discount generation.',
              icon: Bot
            },
            {
              id: 'ai_1500',
              credits: 1500,
              priceUsd: 69,
              titleAr: 'باقة قبس AI الاحترافية (1,500 رصيد)',
              titleEn: 'QABS AI Pro (1,500 Credits)',
              descAr: 'تجهيز الطلبات الآلي، تحليل المبيعات المباشر، ومساعد إدارة المخزون والربط البنكي.',
              descEn: 'Automated fulfillment, live analytics reports, and inventory assistant.',
              icon: Sparkles
            },
            {
              id: 'ai_5000',
              credits: 5000,
              priceUsd: 149,
              titleAr: 'باقة قبس AI المؤسسية (5,000 رصيد + أتمتة)',
              titleEn: 'QABS AI Enterprise (5,000 Credits)',
              descAr: 'سقف عمليات موسع، مزامنة Shopify Admin API بالذكاء الاصطناعي، ودعم التسوية بالعملات الرقمية.',
              descEn: 'High-volume automation, Shopify API AI sync, and multi-currency crypto tools.',
              icon: Coins
            }
          ].map(pack => {
            const PackIcon = pack.icon;
            return (
              <div
                key={pack.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B] shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#14243E] text-[#D5B46B] flex items-center justify-center">
                      <PackIcon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xl font-black text-[#14243E] dark:text-[#D5B46B]">
                      ${pack.priceUsd}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#14243E] dark:text-white">
                    {isAr ? pack.titleAr : pack.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isAr ? pack.descAr : pack.descEn}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    requestServiceAction({
                      id: `svc_${pack.id}_${Date.now()}`,
                      serviceType: 'ai_credits',
                      titleAr: pack.titleAr,
                      titleEn: pack.titleEn,
                      subtitleAr: `شحن فوري لرصيد ${pack.credits.toLocaleString()} وحدة تشغيل في قبس AI`,
                      subtitleEn: `Instant recharge of ${pack.credits.toLocaleString()} QABS AI credits`,
                      priceUsd: pack.priceUsd,
                      details: { creditsAmount: pack.credits }
                    })
                  }
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-[#14243E] dark:border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B] hover:bg-[#14243E] hover:text-white font-black text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'اطلب الخدمة الآن' : 'Order AI Pack Now'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. QABS INTEGRATED SOVEREIGN SERVICES PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-[#00A896] uppercase">
              {isAr ? 'منظومة قبس الرقمية المتكاملة' : 'QABS Unified Digital Ecosystem'}
            </span>
            <h2 className="text-2xl font-black text-[#003445] dark:text-white mt-1">
              {isAr
                ? 'كل ما تحتاجه لتأسيس شركتك وربط مدفوعاتك وإدارة متاجرك الإلكترونية'
                : 'Everything Needed to Form Companies, Connect Global Payments & Run Online Stores'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1: US & UK Company Formation */}
          <div
            onClick={() => handleFormationAction('WY')}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 hover:border-[#00A896] shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#004457]/10 dark:bg-teal-950 text-[#004457] dark:text-teal-300 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#00A896]" />
              </div>
              <h3 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'تأسيس الشركات الأمريكية والبريطانية' : 'US & UK Company Formation'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'تأسيس LLC أو C-Corp في كافة الولايات الخمسين (وايومنغ، ديلاوير، نيو مكسيكو...) والشركات البريطانية LTD.'
                  : 'Register LLC or C-Corp in all 50 US states or UK LTD with full corporate documents.'}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-[#00A896] flex items-center gap-1">
                <span>{isAr ? 'طلب تأسيس شركة' : 'Request Formation'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </span>
              <AppLink
                to="/services/company-formation"
                onClick={e => e.stopPropagation()}
                className="text-[11px] font-bold text-[#92743A] dark:text-[#D5B46B] hover:underline"
              >
                {isAr ? 'صفحة الخدمة المستقلة' : 'Dedicated Page'}
              </AppLink>
            </div>
          </div>

          {/* Pillar 2: EIN, Registered Agent & Annual Renewals */}
          <div
            onClick={handleOpenPortalSafe}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 hover:border-[#00A896] shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#004457]/10 dark:bg-teal-950 text-[#004457] dark:text-teal-300 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 text-[#C8A24A]" />
              </div>
              <h3 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'الرقم الضريبي EIN والوكيل المسجل والتجديدات' : 'EIN, Registered Agent & Compliance'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'استخراج خطاب EIN الرسمي من IRS، عنوان أمريكي معتمد، وإدارة التقارير والتجديدات السنوية.'
                  : 'Official IRS CP575 EIN issuance, registered agent address, and annual state filings.'}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-[#00A896] flex items-center gap-1">
                <span>{isAr ? 'متابعة الوثائق والامتثال' : 'Manage Compliance'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </span>
              <AppLink
                to="/services/ein"
                onClick={e => e.stopPropagation()}
                className="text-[11px] font-bold text-[#92743A] dark:text-[#D5B46B] hover:underline"
              >
                {isAr ? 'خدمة EIN' : 'EIN Page'}
              </AppLink>
            </div>
          </div>

          {/* Pillar 3: QABS Stores & Studio */}
          <div
            onClick={handleOpenPortalSafe}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 hover:border-[#00A896] shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#004457]/10 dark:bg-teal-950 text-[#004457] dark:text-teal-300 flex items-center justify-center">
                <Store className="w-5 h-5 text-[#00A896]" />
              </div>
              <h3 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'منصة متاجر قبس (QABS Stores & Studio)' : 'QABS Multi-Tenant Stores & Studio'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'متجر إلكتروني مستقل لكل عميل مع لوحة تحكم متكاملة واستوديو تصميم مرئي وعزل كامل للبيانات.'
                  : 'Independent online store per client with full dashboard, visual QABS Studio, and strict isolation.'}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-[#00A896] flex items-center gap-1">
                <span>{isAr ? 'إدارة المتاجر الإلكترونية' : 'Open QABS Stores'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </span>
              <AppLink
                to="/services/store-creation"
                onClick={e => e.stopPropagation()}
                className="text-[11px] font-bold text-[#92743A] dark:text-[#D5B46B] hover:underline"
              >
                {isAr ? 'إنشاء المتاجر' : 'Store Page'}
              </AppLink>
            </div>
          </div>

          {/* Pillar 4: Global Banking & Payment Gateways */}
          <div
            onClick={() => {
              const el = document.getElementById('store-packages');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-6 rounded-2xl bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 hover:border-[#00A896] shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#004457]/10 dark:bg-teal-950 text-[#004457] dark:text-teal-300 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-[#C8A24A]" />
              </div>
              <h3 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'البنوك العالمية وبوابات الدفع والاشتراكات' : 'Global Banking, Gateways & Billing'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'ربط حسابات Mercury و Wise وبوابات الدفع Stripe و PayPal و Tap و Moyasar بعد اعتماد قبس.'
                  : 'Connect Mercury, Wise, Stripe, PayPal, Tap & Moyasar with verified governance.'}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-[#00A896] flex items-center gap-1">
                <span>{isAr ? 'استعراض الباقات وبوابات الدفع' : 'View Plans & Gateways'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </span>
              <AppLink
                to="/services/payment-gateways"
                onClick={e => e.stopPropagation()}
                className="text-[11px] font-bold text-[#92743A] dark:text-[#D5B46B] hover:underline"
              >
                {isAr ? 'بوابات الدفع' : 'Gateways Page'}
              </AppLink>
            </div>
          </div>
        </div>
      </section>

      {/* 5B. INDEPENDENT SERVICES DIRECTORY (20 DEDICATED SERVICE PAGES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black text-[#92743A] dark:text-[#D5B46B]">
              {isAr ? 'الصفحات المستقلة للخدمات' : 'Dedicated Service Pages'}
            </span>
            <h2 className="text-2xl font-black text-[#14243E] dark:text-white mt-1">
              {isAr ? 'تصفح جميع خدمات قبس عبر صفحاتها المستقلة' : 'Explore All 20 Independent QABS Service Pages'}
            </h2>
          </div>
          <AppLink
            to="/pricing"
            className="text-xs font-black text-[#92743A] dark:text-[#D5B46B] hover:underline whitespace-nowrap"
          >
            {isAr ? 'مقارنة الأسعار والباقات ←' : 'Compare Full Pricing →'}
          </AppLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {(['formation', 'compliance', 'stores', 'payments', 'digital'] as ServiceCategoryId[]).map(catId => {
            const items = getServicesByCategory(catId);
            return (
              <div
                key={catId}
                className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-5 space-y-3"
              >
                <h3 className="text-xs font-black text-[#14243E] dark:text-[#D5B46B] border-b border-[#EAE6DC] dark:border-slate-800 pb-2">
                  {isAr ? SERVICE_CATEGORY_LABELS[catId].ar : SERVICE_CATEGORY_LABELS[catId].en}
                </h3>
                <ul className="space-y-2 text-xs">
                  {items.map(svc => (
                    <li key={svc.slug}>
                      <AppLink
                        to={svc.path}
                        className="flex items-center justify-between gap-2 text-slate-700 dark:text-slate-200 hover:text-[#92743A] dark:hover:text-[#D5B46B] font-semibold transition-colors"
                      >
                        <span className="truncate">
                          {isAr ? svc.titleAr.split('(')[0].trim() : svc.titleEn.split('(')[0].trim()}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 tabular-nums shrink-0">
                          ${svc.startingPriceUsd}
                        </span>
                      </AppLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. THE 3-STEP FORMATION JOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#00A896] uppercase tracking-wider">
              {isAr ? 'كيف تبدأ شركتك وتجارتك مع قبس؟' : 'How It Works'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003445] dark:text-white">
              {isAr ? 'ثلاث خطوات فقط للانطلاق نحو العالمية' : '3 Simple Steps to Global Commerce'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {isAr
                ? 'نتولى عنك كافة الإجراءات الحكومية والقانونية والتقنية لتتفرغ لتنمية تجارتك'
                : 'We manage all legal, governmental, and technical procedures so you can focus on scale'}
            </p>
            <div className="pt-1">
              <AppLink
                to="/how-it-works"
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#92743A] dark:text-[#D5B46B] hover:underline"
              >
                <span>{isAr ? 'استعرض الدليل التفصيلي: كيف تعمل المنصة' : 'View Detailed Guide: How QABS Works'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </AppLink>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#004457] text-[#E5C158] font-black text-sm flex items-center justify-center font-mono">
                01
              </div>
              <h3 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'اختيار الولاية وتعبئة البيانات' : 'Select State & Enter Details'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'اختر الولاية الأنسب لنشاطك (وايومنغ للتجارة الإلكترونية، ديلاوير للاستثمار) وقم بتحديد اسم الشركة والمدراء.'
                  : 'Choose the best state (Wyoming for commerce, Delaware for VC) and specify company name & managers.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#00A896] text-white font-black text-sm flex items-center justify-center font-mono">
                02
              </div>
              <h3 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'الإيداع واستخراج EIN والوثائق' : 'State Filing & IRS EIN'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'نقوم بإيداع النظام الأساسي لدى سكرتير الولاية واستخراج الرقم الضريبي الفيدرالي EIN وتجهيز عقد التأسيس.'
                  : 'We file Articles of Organization, obtain IRS EIN letter, and issue the custom Operating Agreement.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#C8A24A] text-slate-950 font-black text-sm flex items-center justify-center font-mono">
                03
              </div>
              <h3 className="text-base font-black text-[#003445] dark:text-white">
                {isAr ? 'تفعيل البنك والدفع وإطلاق المتجر' : 'Banking, Gateways & Launch'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'نوجهك لفتح حساب Mercury أو Wise، وربط بوابة Stripe، وتفعيل متجرك الإلكتروني المستقل في قبس.'
                  : 'Open Mercury or Wise accounts, connect Stripe payment gateway, and launch your store on QABS.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. JURISDICTION COMPARISON TABLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-black text-[#00A896] uppercase tracking-wider">
            {isAr ? 'دليل الاختيار الذكي' : 'Jurisdiction Comparison'}
          </span>
          <h2 className="text-2xl font-black text-[#003445] dark:text-white mt-1">
            {isAr ? 'مقارنة الولايات التأسيسية الأكثر طلباً لرواد الأعمال' : 'Top Jurisdictions Comparison'}
          </h2>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#071D2B]">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">{isAr ? 'الولاية / الاختصاص' : 'Jurisdiction'}</th>
                <th className="p-4">{isAr ? 'ضريبة دخل الولاية' : 'State Income Tax'}</th>
                <th className="p-4">{isAr ? 'سرية الملاك (Privacy)' : 'Owner Privacy'}</th>
                <th className="p-4">{isAr ? 'التقرير السنوي' : 'Annual Report'}</th>
                <th className="p-4">{isAr ? 'الأنسب لـ' : 'Recommended For'}</th>
                <th className="p-4 text-center">{isAr ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr className="hover:bg-teal-50/40 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-black text-[#004457] dark:text-white">
                  {isAr ? 'وايومنغ (Wyoming - WY) ⭐' : 'Wyoming (WY)'}
                </td>
                <td className="p-4 text-emerald-600 font-bold">0% (معفاة تماماً)</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">سرية تامة (لا تظهر بالسجلات العامة)</td>
                <td className="p-4 font-mono">$60 / سنوياً</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">التجارة الإلكترونية، المتاجر الرقمية، والخدمات عن بعد</td>
                <td className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleFormationAction('WY')}
                    className="px-3 py-1.5 rounded-lg bg-[#004457] hover:bg-[#003342] text-white font-bold text-[11px] cursor-pointer"
                  >
                    {isAr ? 'تأسيس في وايومنغ' : 'Form in WY'}
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-teal-50/40 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-black text-[#004457] dark:text-white">
                  {isAr ? 'ديلاوير (Delaware - DE)' : 'Delaware (DE)'}
                </td>
                <td className="p-4 text-slate-700 dark:text-slate-300 font-bold">0% (خارج الولاية)</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">حماية قانونية متقدمة (Court of Chancery)</td>
                <td className="p-4 font-mono">$300 / سنوياً</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">الشركات الناشئة التقنية، جذب الاستثمار وصناديق VC</td>
                <td className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleFormationAction('DE')}
                    className="px-3 py-1.5 rounded-lg bg-[#004457] hover:bg-[#003342] text-white font-bold text-[11px] cursor-pointer"
                  >
                    {isAr ? 'تأسيس في ديلاوير' : 'Form in DE'}
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-teal-50/40 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-black text-[#004457] dark:text-white">
                  {isAr ? 'نيو مكسيكو (New Mexico - NM)' : 'New Mexico (NM)'}
                </td>
                <td className="p-4 text-emerald-600 font-bold">0% (للأعمال الخارجية)</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">سرية تامة ومطلقة للملاك</td>
                <td className="p-4 font-mono text-emerald-600 font-bold">$0 (لا يوجد تقرير سنوي)</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">أقل تكلفة صيانة سنوية وميزانية اقتصادية</td>
                <td className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleFormationAction('NM')}
                    className="px-3 py-1.5 rounded-lg bg-[#004457] hover:bg-[#003342] text-white font-bold text-[11px] cursor-pointer"
                  >
                    {isAr ? 'تأسيس في نيو مكسيكو' : 'Form in NM'}
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-teal-50/40 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-black text-[#004457] dark:text-white">
                  {isAr ? 'بريطانيا (UK LTD)' : 'United Kingdom (LTD)'}
                </td>
                <td className="p-4 text-slate-700 dark:text-slate-300 font-bold">ضريبة الشركات البريطانية</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">سجل Companies House الرسمي</td>
                <td className="p-4 font-mono">£13 تقرير تأكيد سنوي</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">التجارة مع بريطانيا وأوروبا وبوابات الدفع بالجنيه الإسترليني</td>
                <td className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleFormationAction('UK')}
                    className="px-3 py-1.5 rounded-lg bg-[#004457] hover:bg-[#003342] text-white font-bold text-[11px] cursor-pointer"
                  >
                    {isAr ? 'تأسيس في بريطانيا' : 'Form UK LTD'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. COLLAPSIBLE ALL 50 US STATES TRANSPARENT PRICING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white dark:bg-[#071D2B] border-2 border-[#004457]/20 dark:border-cyan-950 p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-[#00A896]">
                {isAr
                  ? 'أسعار كافة الولايات الأمريكية بشفافية تامة — شاملة الرسوم الحكومية'
                  : 'Transparent All 50 US States Formation Pricing — Including State Filing Fees'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[#003445] dark:text-white mt-0.5">
                {isAr
                  ? 'تشمل جميع الباقات: رسوم سكرتير الولاية الحكومية + تأسيس (50 ولاية أمريكية)'
                  : 'All Packages Include: Secretary of State Filing Fee + Formation (All 50 US States)'}
              </h3>
            </div>

            <button
              onClick={() => setShowStatesPricing(!showStatesPricing)}
              className="px-5 py-2.5 rounded-xl bg-[#004457] hover:bg-[#003342] text-white text-xs font-black flex items-center gap-2 cursor-pointer self-start sm:self-center shadow-sm"
            >
              <span>
                {showStatesPricing
                  ? isAr
                    ? 'إخفاء جدول أسعار الولايات الأمريكية (50 ولاية)'
                    : 'Hide All 50 US States Pricing'
                  : isAr
                  ? 'عرض أسعار كافة الولايات الأمريكية (50 ولاية)'
                  : 'Show All 50 US States Pricing'}
              </span>
              {showStatesPricing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showStatesPricing && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-5 animate-fade-in">
              {/* Package Tier Selector & State Search */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {QABS_FORMATION_PKGS.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                        selectedPkgId === pkg.id
                          ? 'bg-[#004457] text-white border-[#004457]'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {isAr ? `باقة ${pkg.nameAr} ($${pkg.price} + رسوم الولاية)` : `${pkg.nameEn} ($${pkg.price} + State Fee)`}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      placeholder={isAr ? 'ابحث عن الولاية (مثال: وايومنغ / WY)...' : 'Search state...'}
                      value={stateSearch}
                      onChange={e => setStateSearch(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pr-8 pl-3 py-1.5 text-xs"
                    />
                  </div>
                  <select
                    value={stateFilter}
                    onChange={e => setStateFilter(e.target.value as any)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold"
                  >
                    <option value="all">{isAr ? 'كل الولايات (50)' : 'All 50 States'}</option>
                    <option value="popular">{isAr ? 'الأكثر شعبية ⭐' : 'Most Popular'}</option>
                    <option value="zero_tax">{isAr ? 'بدون ضريبة ولاية' : 'Zero State Tax'}</option>
                    <option value="low_fee">{isAr ? 'رسوم حكومية منخفضة' : 'Low Filing Fee'}</option>
                  </select>
                </div>
              </div>

              {/* States Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto p-1">
                {filteredStates.map(st => {
                  const totalWithPkg = st.stateFilingFee + selectedPkg.price;
                  return (
                    <div
                      key={st.code}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#00A896] bg-slate-50/60 dark:bg-slate-900/60 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-[#003445] dark:text-white">
                            {isAr ? st.nameAr : st.nameEn}{' '}
                            <span className="text-xs font-mono text-[#00A896]">({st.code})</span>
                          </span>
                          {st.badgeAr && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {isAr ? st.badgeAr : st.badgeEn}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {isAr ? st.recommendedForAr : st.recommendedForEn}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {isAr ? `رسوم الولاية: $${st.stateFilingFee}` : `State Fee: $${st.stateFilingFee}`}
                          </span>
                          <span className="font-mono font-black text-base text-[#004457] dark:text-teal-300">
                            ${totalWithPkg}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isAuthenticated
                            ? onOpenFormationModal(st.code)
                            : requestServiceAction({
                                id: `svc_state_${st.code}_${Date.now()}`,
                                serviceType: 'company_formation',
                                titleAr: `تأسيس شركة في ${st.nameAr} (${selectedPkg.nameAr})`,
                                titleEn: `Form Company in ${st.nameEn} (${selectedPkg.nameEn})`,
                                subtitleAr: `رسوم الولاية: $${st.stateFilingFee} + باقة ${selectedPkg.nameAr}`,
                                subtitleEn: `State fee: $${st.stateFilingFee} + ${selectedPkg.nameEn}`,
                                priceUsd: totalWithPkg,
                                details: {
                                  jurisdiction: st.jurisdictionId as 'US_WYOMING' | 'US_DELAWARE' | 'US_KENTUCKY' | 'US_NEW_MEXICO' | 'UK_LTD',
                                  entityType: 'LLC',
                                  addons: { ein: true, physicalAddressAgent: true, businessBank: false, stripePayPal: false }
                                }
                              })
                        }
                        className="w-full py-2 rounded-xl bg-[#004457] hover:bg-[#003342] text-white text-xs font-bold cursor-pointer"
                      >
                        {isAr ? `اطلب التأسيس في ${st.nameAr}` : `Order in ${st.nameEn}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black text-[#00A896] uppercase tracking-wider">
            {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </span>
          <h2 className="text-2xl font-black text-[#003445] dark:text-white">
            {isAr ? 'كل ما تحتاج معرفته عن تأسيس الشركات وبوابات الدفع' : 'Everything You Need to Know'}
          </h2>
          <div>
            <AppLink
              to="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#92743A] dark:text-[#D5B46B] hover:underline"
            >
              <span>{isAr ? 'تصفح صفحة الأسئلة الشائعة الكاملة' : 'Browse Full FAQ Directory'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </AppLink>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071D2B] overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 cursor-pointer font-bold text-sm text-[#003445] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#00A896] shrink-0" />
                    <span>{isAr ? faq.qAr : faq.qEn}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#00A896] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                    {isAr ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FINAL EXECUTIVE CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#003445] via-[#004D5E] to-[#003445] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-2 border-[#00A896]/30">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-[#E5C158] text-slate-950 font-black text-xs uppercase tracking-wider inline-block">
              {isAr ? 'انطلاقة موثوقة وسريعة' : 'Fast & Compliant Launch'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              {isAr
                ? 'جاهز لنقل تجارتك وأعمالك إلى المستوى العالمي مع قبس؟'
                : 'Ready to Expand Your Business Globally with QABS?'}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
              {isAr
                ? 'ابدأ اليوم بتأسيس شركتك الأمريكية أو البريطانية، واحصل على الرقم الضريبي EIN، وأدر متاجرك الإلكترونية من لوحة واحدة موحدة.'
                : 'Form your US or UK company today, obtain IRS EIN, and run all your e-commerce stores from one unified portal.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleFormationAction('WY')}
              className="px-6 py-3.5 rounded-xl bg-[#E5C158] hover:bg-[#d8b44c] text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-lg text-center"
            >
              {isAr ? 'ابدأ تأسيس شركتك الآن' : 'Start Formation Now'}
            </button>
            <button
              type="button"
              onClick={handleOpenPortalSafe}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs sm:text-sm transition-all cursor-pointer text-center"
            >
              {isAuthenticated ? (isAr ? 'الدخول إلى مساحة العمل' : 'Open Workspace') : isAr ? 'تسجيل الدخول / حسابي' : 'Sign In / My Account'}
            </button>
            <a
              href={`https://wa.me/${siteContent.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isAr ? 'استشارة فورية عبر واتساب' : 'WhatsApp Consultation'}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
