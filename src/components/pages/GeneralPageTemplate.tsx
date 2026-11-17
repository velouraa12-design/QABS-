import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { GeneralPageData, ServiceFaq } from '../../types/pages.ts';
import { usePageSeo } from '../../utils/seo.ts';

interface GeneralPageTemplateProps {
  page: GeneralPageData;
  schemaType?: 'WebPage' | 'FAQPage' | 'AboutPage' | 'ContactPage';
  faqs?: ServiceFaq[];
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export const GeneralPageTemplate: React.FC<GeneralPageTemplateProps> = ({
  page,
  schemaType = 'WebPage',
  faqs,
  headerAction,
  children
}) => {
  const { language } = useApp();
  const isAr = language === 'ar';

  usePageSeo({
    titleAr: page.seoTitleAr,
    titleEn: page.seoTitleEn,
    descriptionAr: page.seoDescriptionAr,
    descriptionEn: page.seoDescriptionEn,
    path: page.path,
    schemaType,
    faqs
  });

  return (
    <div className="pb-20">
      <section className="bg-[#14243E] text-white border-b border-[#D5B46B]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-slate-300"
          >
            <AppLink to="/" className="hover:text-[#D5B46B] transition-colors">
              {isAr ? 'الرئيسية' : 'Home'}
            </AppLink>
            <span aria-hidden="true">/</span>
            <span className="text-[#D5B46B] font-bold">
              {isAr ? page.titleAr : page.titleEn}
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="text-xs font-mono text-[#D5B46B]">{page.path}</div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight text-balance">
                {isAr ? page.titleAr : page.titleEn}
              </h1>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {isAr ? page.subtitleAr : page.subtitleEn}
              </p>
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        {children}
      </div>
    </div>
  );
};
