import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';
import { Bot } from 'lucide-react';

export const AiSolutionsPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const service = getServiceBySlug('ai-solutions')!;

  const sampleCommands = [
    {
      promptAr: 'ارفع أسعار منتجات المتجر بنسبة 10%',
      promptEn: 'Increase store product prices by 10%',
      resultAr: 'تم تحديث أسعار جميع المنتجات النشطة وحفظ سجل التدقيق فوراً.',
      resultEn: 'Updated active catalog pricing by +10% and logged to Audit Trail.'
    },
    {
      promptAr: 'جهز الطلبات المدفوعة وأصدر أرقام التتبع',
      promptEn: 'Fulfill pending paid orders and generate tracking numbers',
      resultAr: 'تم تحويل الطلبات المدفوعة إلى حالة الشحن وتوليد أرقام التتبع تلقائياً.',
      resultEn: 'Transitioned paid orders to shipped status with generated tracking IDs.'
    },
    {
      promptAr: 'أنشئ كود خصم QABS15 بنسبة 15%',
      promptEn: 'Create coupon QABS15 for 15% discount',
      resultAr: 'تم تفعيل كوبون الخصم QABS15 في المتجر النشط فوراً.',
      resultEn: 'Activated QABS15 coupon inside your isolated storefront.'
    }
  ];

  const [selectedCmdIdx, setSelectedCmdIdx] = useState(0);

  return (
    <ServicePageTemplate
      service={service}
      extraSection={
        <section className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-[#92743A] dark:text-[#D5B46B]" />
            <h2 className="text-xl font-black text-[#14243E] dark:text-white">
              {isAr ? 'أمثلة حية لأوامر قبس AI التنفيذية' : 'Live Examples of Executable QABS AI Commands'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleCommands.map((cmd, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCmdIdx(idx)}
                className={`p-4 rounded-xl border text-start cursor-pointer transition-colors ${
                  selectedCmdIdx === idx
                    ? 'border-[#14243E] dark:border-[#D5B46B] bg-[#F8F7F2] dark:bg-[#051724]'
                    : 'border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B]'
                }`}
              >
                <div className="text-xs font-black text-[#14243E] dark:text-white">
                  {isAr ? cmd.promptAr : cmd.promptEn}
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#14243E] text-white text-xs sm:text-sm">
            <span className="text-[#D5B46B] font-bold">
              {isAr ? 'النتيجة التنفيذية:' : 'Execution Result:'}
            </span>{' '}
            {isAr
              ? sampleCommands[selectedCmdIdx].resultAr
              : sampleCommands[selectedCmdIdx].resultEn}
          </div>
        </section>
      }
    />
  );
};
