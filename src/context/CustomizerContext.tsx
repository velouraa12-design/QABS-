import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { qabsApi } from '../services/qabsApi.ts';

export interface CustomPage {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  active: boolean;
}

export interface SiteContent {
  heroBadgeAr: string;
  heroBadgeEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroCtaTextAr: string;
  heroCtaTextEn: string;
  heroCtaLink: string;
  heroImageUrl: string;
  cardImageUrl: string;
  whatsappNumber: string;
  storeDomain: string;
  showcasePackageTitleAr: string;
  showcasePackageTitleEn: string;
  showcasePrice: number;
  showcaseFeaturesAr: string[];
  showcaseFeaturesEn: string[];
  customPages: CustomPage[];
}

const DEFAULT_SITE_CONTENT: SiteContent = {
  heroBadgeAr: 'خدمات تأسيس وتجهيز الأعمال',
  heroBadgeEn: 'Business Formation & Setup Services',
  heroTitleAr: 'خلّ تجارتك تنطلق عالميًا مع قبس!',
  heroTitleEn: 'Propel Your Global Commerce with QABS!',
  heroSubtitleAr:
    'نساعدك في مراجعة خيارات تأسيس الشركات وتجهيز مستندات التقديم للحسابات وبوابات الدفع، بعد التحقق من أهلية بلد الإقامة والنشاط ومتطلبات الجهات.',
  heroSubtitleEn:
    'We help review company-formation options and prepare application documents for banking and payment providers, subject to residence, business-activity, and provider eligibility.',
  heroCtaTextAr: 'ابدأ الآن — اطلب مراجعة باقتك',
  heroCtaTextEn: 'Start Now — Review Package',
  heroCtaLink: 'https://qabs1.store',
  heroImageUrl: '/src/assets/images/qabs_global_hero_1794351468325.jpg',
  cardImageUrl: '/src/assets/images/qabs_banking_card_1794351469053.jpg',
  whatsappNumber: '+159 710 784 967',
  storeDomain: 'qabs1.store',
  showcasePackageTitleAr: 'باقة تأسيس وتجهيز الدفع',
  showcasePackageTitleEn: 'Formation & Payment Application Support',
  showcasePrice: 349,
  showcaseFeaturesAr: [
    'مساعدة في طلب تأسيس LLC وفق الأهلية والاختصاص',
    'مساعدة في إعداد مستندات طلب Stripe و PayPal دون ضمان القبول',
    'مساعدة في طلب EIN وفق متطلبات IRS والأهلية',
    'الوكيل المسجل والعنوان حسب الباقة والاختصاص وتأكيد التوفر'
  ],
  showcaseFeaturesEn: [
    'US LLC formation assistance, subject to eligibility',
    'Stripe & PayPal application-document support; approval is not guaranteed',
    'EIN application assistance, subject to IRS requirements',
    'Registered-agent and address service, subject to package and availability'
  ],
  customPages: [
    {
      id: 'page_01',
      slug: 'about-us',
      titleAr: 'عن قبس الرقمية',
      titleEn: 'About QABS',
      contentAr: 'قبس منصة خدمات رقمية تساعد رواد الأعمال والتجار العرب في مراجعة خيارات تأسيس الأعمال وتجهيز الطلبات وخدمات المتاجر والحلول الرقمية وفق الأهلية والتوفر ونطاق العمل.',
      contentEn: 'QABS is a digital services platform helping Arab entrepreneurs review business-formation options, prepare applications, and assess store and digital-service needs subject to eligibility, availability, and scope.',
      active: true
    },
    {
      id: 'page_02',
      slug: 'privacy-policy',
      titleAr: 'سياسة الخصوصية والأمان',
      titleEn: 'Privacy & Security Policy',
      contentAr: 'نطوّر ضوابط لحماية الحسابات والبيانات، وتخضع حدود العزل والتخزين والتكاملات للتحقق الفني قبل إتاحتها تشغيلياً.',
      contentEn: 'We are developing account and data-protection controls; isolation, storage, and integration capabilities require technical verification before operational availability.',
      active: true
    }
  ]
};

interface CustomizerContextType {
  siteContent: SiteContent;
  updateSiteContent: (updates: Partial<SiteContent>) => void;
  resetToDefault: () => void;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
  addCustomPage: (page: Omit<CustomPage, 'id'>) => void;
  updateCustomPage: (id: string, updates: Partial<CustomPage>) => void;
  deleteCustomPage: (id: string) => void;
}

const CustomizerContext = createContext<CustomizerContextType | undefined>(undefined);

export const CustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem('qabs_site_content');
      if (saved) return { ...DEFAULT_SITE_CONTENT, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SITE_CONTENT;
  });

  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await qabsApi.getSiteContent();
        if (active && res.siteContent && typeof res.siteContent === 'object') {
          setSiteContent(prev => ({ ...prev, ...(res.siteContent as Partial<SiteContent>) }));
        }
      } catch {
        // Keep local fallback when backend is unreachable in static preview
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('qabs_site_content', JSON.stringify(siteContent));
    } catch {}
  }, [siteContent]);

  const persistServerContent = useCallback((nextContent: SiteContent) => {
    void qabsApi.adminUpdateSiteContent(nextContent as unknown as Record<string, unknown>).catch(() => {
      // Non-blocking: only admins can persist CMS content to DB
    });
  }, []);

  const updateSiteContent = (updates: Partial<SiteContent>) => {
    setSiteContent(prev => {
      const next = { ...prev, ...updates };
      persistServerContent(next);
      return next;
    });
  };

  const resetToDefault = () => {
    setSiteContent(DEFAULT_SITE_CONTENT);
    persistServerContent(DEFAULT_SITE_CONTENT);
  };

  const addCustomPage = (page: Omit<CustomPage, 'id'>) => {
    const newPage: CustomPage = { ...page, id: `page_${Date.now()}` };
    setSiteContent(prev => {
      const next = { ...prev, customPages: [...prev.customPages, newPage] };
      persistServerContent(next);
      return next;
    });
  };

  const updateCustomPage = (id: string, updates: Partial<CustomPage>) => {
    setSiteContent(prev => {
      const next = {
        ...prev,
        customPages: prev.customPages.map(p => (p.id === id ? { ...p, ...updates } : p))
      };
      persistServerContent(next);
      return next;
    });
  };

  const deleteCustomPage = (id: string) => {
    setSiteContent(prev => {
      const next = {
        ...prev,
        customPages: prev.customPages.filter(p => p.id !== id)
      };
      persistServerContent(next);
      return next;
    });
  };

  return (
    <CustomizerContext.Provider
      value={{
        siteContent,
        updateSiteContent,
        resetToDefault,
        editorOpen,
        setEditorOpen,
        addCustomPage,
        updateCustomPage,
        deleteCustomPage
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};

export const useCustomizer = () => {
  const context = useContext(CustomizerContext);
  if (!context) {
    throw new Error('useCustomizer must be used within a CustomizerProvider');
  }
  return context;
};
