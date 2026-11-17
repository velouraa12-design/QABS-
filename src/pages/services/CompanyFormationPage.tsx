import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const CompanyFormationPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const service = getServiceBySlug('company-formation')!;

  const comparisonRows = [
    {
      jurAr: 'وايومنغ (Wyoming LLC)',
      jurEn: 'Wyoming LLC (WY)',
      taxAr: '0% ضريبة دخل ولاية',
      taxEn: '0% State Income Tax',
      privacyAr: 'سرية تامة للملاك',
      privacyEn: 'Full Member Privacy',
      annualAr: '$60 / سنوياً',
      annualEn: '$60 / year',
      fitAr: 'التجارة الإلكترونية والأنشطة الرقمية',
      fitEn: 'E-Commerce & Digital Agencies'
    },
    {
      jurAr: 'ديلاوير (Delaware LLC)',
      jurEn: 'Delaware LLC (DE)',
      taxAr: '0% خارج الولاية',
      taxEn: '0% Out-of-State',
      privacyAr: 'حماية قانونية متقدمة',
      privacyEn: 'Court of Chancery',
      annualAr: '$300 / سنوياً',
      annualEn: '$300 / year',
      fitAr: 'الشركات الناشئة وجذب الاستثمار',
      fitEn: 'Tech Startups & VC Scaling'
    },
    {
      jurAr: 'نيو مكسيكو (New Mexico LLC)',
      jurEn: 'New Mexico LLC (NM)',
      taxAr: '0% للأعمال الخارجية',
      taxEn: '0% Foreign-Sourced',
      privacyAr: 'سرية مطلقة',
      privacyEn: 'Full Anonymity',
      annualAr: '$0 تقرير سنوي',
      annualEn: '$0 Annual Report',
      fitAr: 'أقل تكلفة سنوية ممكنة',
      fitEn: 'Lowest Annual Maintenance'
    },
    {
      jurAr: 'المملكة المتحدة (UK LTD)',
      jurEn: 'United Kingdom (UK LTD)',
      taxAr: 'ضريبة شركات بريطانية',
      taxEn: 'UK Corporation Tax',
      privacyAr: 'سجل Companies House',
      privacyEn: 'Companies House Registry',
      annualAr: '£13 بيان تأكيد',
      annualEn: '£13 Confirmation Statement',
      fitAr: 'الأسواق الأوروبية والـ GBP',
      fitEn: 'UK/EU Trade & GBP Gateways'
    }
  ];

  return (
    <ServicePageTemplate
      service={service}
      extraSection={
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
                {isAr ? 'مقارنة أبرز الولايات والاختصاصات القانونية' : 'Top Formation Jurisdictions Comparison'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isAr
                  ? 'قارن الضرائب والتكاليف السنوية لتحديد الأنسب لنشاطك التجاري.'
                  : 'Compare state tax treatment, privacy rules, and annual maintenance costs.'}
              </p>
            </div>
            <AppLink
              to="/services/us-llc"
              className="text-xs font-black text-[#92743A] dark:text-[#D5B46B] hover:underline whitespace-nowrap"
            >
              {isAr ? 'استعرض أسعار الـ 50 ولاية ←' : 'Explore All 50 US States →'}
            </AppLink>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#EAE6DC] dark:border-slate-800 bg-white dark:bg-[#071D2B]">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#F8F7F2] dark:bg-[#051724] text-[#14243E] dark:text-slate-200 font-black border-b border-[#EAE6DC] dark:border-slate-800">
                <tr>
                  <th className="p-4 text-start">{isAr ? 'الاختصاص' : 'Jurisdiction'}</th>
                  <th className="p-4 text-start">{isAr ? 'الضريبة' : 'State Tax'}</th>
                  <th className="p-4 text-start">{isAr ? 'الخصوصية' : 'Privacy'}</th>
                  <th className="p-4 text-start">{isAr ? 'الرسوم السنوية' : 'Annual Fee'}</th>
                  <th className="p-4 text-start">{isAr ? 'الأنسب لـ' : 'Best For'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DC] dark:divide-slate-800">
                {comparisonRows.map(row => (
                  <tr key={row.jurEn} className="hover:bg-[#F8F7F2]/60 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-black text-[#14243E] dark:text-white">
                      {isAr ? row.jurAr : row.jurEn}
                    </td>
                    <td className="p-4 font-bold text-emerald-700 dark:text-emerald-400">
                      {isAr ? row.taxAr : row.taxEn}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {isAr ? row.privacyAr : row.privacyEn}
                    </td>
                    <td className="p-4 font-mono tabular-nums font-bold text-[#92743A] dark:text-[#D5B46B]">
                      {isAr ? row.annualAr : row.annualEn}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {isAr ? row.fitAr : row.fitEn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      }
    />
  );
};
