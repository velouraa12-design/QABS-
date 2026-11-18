import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { US_STATES_PRICING, QABS_FORMATION_PKGS } from '../../data/usStatesPricing.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';
import { Search } from 'lucide-react';

export const UsLlcPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const service = getServiceBySlug('us-llc')!;

  const [stateSearch, setStateSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | 'popular' | 'zero_tax' | 'low_fee'>('all');
  const [tierId, setTierId] = useState<'starter' | 'complete' | 'premium'>('complete');

  const selectedTier = QABS_FORMATION_PKGS.find(p => p.id === tierId) || QABS_FORMATION_PKGS[1];

  const filteredStates = US_STATES_PRICING.filter(st => {
    const q = stateSearch.trim().toLowerCase();
    const matches =
      !q ||
      st.nameAr.includes(stateSearch) ||
      st.nameEn.toLowerCase().includes(q) ||
      st.code.toLowerCase().includes(q);
    if (!matches) return false;
    if (stateFilter === 'popular') return st.tags.includes('popular');
    if (stateFilter === 'zero_tax') return st.tags.includes('zero_tax');
    if (stateFilter === 'low_fee') return st.stateFilingFee <= 100;
    return true;
  });

  return (
    <ServicePageTemplate
      service={service}
      extraSection={
        <section className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EAE6DC] dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
                {isAr ? 'دليل أسعار تأسيس US LLC في جميع الولايات الـ 50' : 'All 50 US States LLC Formation Pricing'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isAr
                  ? 'اختر مستوى الباقة وابحث عن الولاية لمعرفة رسوم الولاية الحكومية والتكلفة الإجمالية بشفافية.'
                  : 'Filter by tier and state to view transparent Secretary of State fees and total cost.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {QABS_FORMATION_PKGS.map(pkg => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setTierId(pkg.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                    tierId === pkg.id
                      ? 'bg-[#14243E] text-white border-[#14243E]'
                      : 'bg-[#F8F7F2] dark:bg-slate-900 text-[#14243E] dark:text-slate-200 border-[#EAE6DC] dark:border-slate-700'
                  }`}
                >
                  {isAr ? `${pkg.nameAr} ($${pkg.price})` : `${pkg.nameEn} ($${pkg.price})`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
              <input
                type="text"
                value={stateSearch}
                onChange={e => setStateSearch(e.target.value)}
                placeholder={isAr ? 'ابحث باسم الولاية أو الرمز (WY / DE)...' : 'Search state name or code (WY, DE)...'}
                className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] ps-9 pe-3 py-2 text-xs text-[#14243E] dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', ar: 'جميع الولايات', en: 'All States' },
                  { id: 'popular', ar: 'الأكثر طلباً', en: 'Popular' },
                  { id: 'zero_tax', ar: 'لا ضريبة دخل على مستوى الولاية', en: 'No State-Level Income Tax' },
                  { id: 'low_fee', ar: 'رسوم ≤ $100', en: 'Fee ≤ $100' }
                ] as const
              ).map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStateFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    stateFilter === f.id
                      ? 'bg-[#D5B46B] text-[#14243E]'
                      : 'bg-[#F8F7F2] dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isAr ? f.ar : f.en}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] leading-6 text-slate-500 dark:text-slate-400">
            {isAr
              ? 'الرسوم المعروضة إرشادية وقد تتغير. لا تشمل بالضرورة الضرائب الفيدرالية أو رسوم الوكيل المسجل أو الجهات الخارجية؛ تحقّق من الرسوم الرسمية والالتزامات الضريبية قبل التقديم.'
              : 'Displayed fees are indicative and may change. They may exclude federal taxes, registered-agent fees, and third-party charges; verify current official fees and tax obligations before filing.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-0.5">
            {filteredStates.map(st => {
              const total = st.stateFilingFee + selectedTier.price;
              return (
                <div
                  key={st.code}
                  className="p-4 rounded-xl border border-[#EAE6DC] dark:border-slate-800 bg-[#F8F7F2] dark:bg-[#051724] flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-[#14243E] dark:text-white">
                        {isAr ? st.nameAr : st.nameEn}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#92743A] dark:text-[#D5B46B]">
                        {st.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr ? st.recommendedForAr : st.recommendedForEn}
                    </p>
                    <div className="pt-2 border-t border-[#EAE6DC] dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {isAr ? `الولاية: $${st.stateFilingFee}` : `State: $${st.stateFilingFee}`}
                      </span>
                      <span className="font-mono font-black text-[#14243E] dark:text-[#D5B46B] tabular-nums">
                        ${total}
                      </span>
                    </div>
                  </div>
                  <AppLink
                    to={`/order/us-llc?state=${st.code}`}
                    className="w-full py-2 rounded-lg bg-[#14243E] hover:bg-[#1d3559] text-white text-xs font-bold text-center transition-colors"
                  >
                    {isAr ? `اطلب التأسيس في ${st.nameAr}` : `Order ${st.code} LLC`}
                  </AppLink>
                </div>
              );
            })}
          </div>
        </section>
      }
    />
  );
};
