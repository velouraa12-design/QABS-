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
      taxAr: 'لا ضريبة دخل شخصية أو شركات على مستوى الولاية؛ قد تنطبق ضرائب أخرى',
      taxEn: 'No state personal or corporate income tax; other taxes may apply',
      privacyAr: 'تخضع لإفصاحات السجلات المطلوبة',
      privacyEn: 'Subject to required public-record disclosures',
      annualAr: 'تقرير سنوي ورسوم حكومية حالية',
      annualEn: 'Annual report; current state fees apply',
      fitAr: 'قد تناسب بعض الأنشطة الرقمية بعد مراجعة الالتزامات',
      fitEn: 'May suit some digital businesses after reviewing obligations'
    },
    {
      jurAr: 'ديلاوير (Delaware LLC)',
      jurEn: 'Delaware LLC (DE)',
      taxAr: 'تختلف الالتزامات بحسب النشاط ومكان ممارسة الأعمال ونوع الكيان',
      taxEn: 'Obligations vary by activity, business location, and entity type',
      privacyAr: 'تطبق متطلبات السجل والإفصاح الخاصة بالكيان',
      privacyEn: 'Entity-specific public-record and disclosure rules apply',
      annualAr: 'قد تنطبق ضريبة امتياز ورسوم بحسب الكيان',
      annualEn: 'Franchise tax and entity-specific fees may apply',
      fitAr: 'قد تناسب شركات تخطط لجذب استثمار',
      fitEn: 'May suit companies planning to seek investment'
    },
    {
      jurAr: 'نيو مكسيكو (New Mexico LLC)',
      jurEn: 'New Mexico LLC (NM)',
      taxAr: 'تُحدد وفق مصدر الدخل والالتزامات المحلية والفيدرالية',
      taxEn: 'Depends on income source and applicable state and federal obligations',
      privacyAr: 'تطبق متطلبات الإفصاح والسجل القانوني',
      privacyEn: 'Required disclosures and public-record rules apply',
      annualAr: 'تُراجع المتطلبات والرسوم الحالية للكيان',
      annualEn: 'Check current entity requirements and fees',
      fitAr: 'قد تناسب من يوازن التكلفة مع المتطلبات',
      fitEn: 'May suit founders balancing cost and requirements'
    },
    {
      jurAr: 'المملكة المتحدة (UK LTD)',
      jurEn: 'United Kingdom (UK LTD)',
      taxAr: 'ضريبة الشركات وفق الأرباح والقواعد البريطانية',
      taxEn: 'Corporation tax under applicable UK rules',
      privacyAr: 'بيانات الشركة متاحة وفق قواعد Companies House',
      privacyEn: 'Company details are public under Companies House rules',
      annualAr: 'رسوم الإيداع الحالية لدى Companies House',
      annualEn: 'Current Companies House filing fees',
      fitAr: 'قد تناسب نشاطاً يستهدف المملكة المتحدة',
      fitEn: 'May suit businesses targeting the UK market'
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
                  ? 'مقارنة إرشادية عامة؛ تختلف الضرائب والرسوم والإفصاحات بحسب الكيان والنشاط ومكان ممارسة الأعمال.'
                  : 'General guidance only; taxes, fees, and disclosures vary by entity, activity, and where business is conducted.'}
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
