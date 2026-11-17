import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const PaymentGatewaysPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const service = getServiceBySlug('payment-gateways')!;

  const gateways = [
    {
      name: 'Stripe',
      regionsAr: 'عالمي (135+ عملة)',
      regionsEn: 'Global (135+ Currencies)',
      methodsAr: 'Visa, Mastercard, Apple Pay',
      methodsEn: 'Cards, Apple Pay, Link',
      reqAr: 'US LLC / UK LTD + EIN + موقع متوافق',
      reqEn: 'US LLC / UK LTD + EIN + Compliant Store'
    },
    {
      name: 'PayPal Business',
      regionsAr: 'عالمي (200+ سوق)',
      regionsEn: 'Global (200+ Markets)',
      methodsAr: 'محفظة PayPal + البطاقات',
      methodsEn: 'PayPal Balance & Cards',
      reqAr: 'حساب شركة + مستندات المالك + سياسة استرجاع',
      reqEn: 'Registered Entity + KYC + Refund Policy'
    },
    {
      name: 'Moyasar & Tap',
      regionsAr: 'السعودية والخليج العربي',
      regionsEn: 'Saudi Arabia & GCC',
      methodsAr: 'مدى، STC Pay، Apple Pay، فيزا',
      methodsEn: 'Mada, STC Pay, Apple Pay, Visa',
      reqAr: 'سجل تجاري خليجي أو وثيقة نشاط معتمدة',
      reqEn: 'GCC CR or verified commercial license'
    },
    {
      name: 'USDT / BTC Crypto',
      regionsAr: 'تسوية دولية فورية',
      regionsEn: 'Borderless Instant Settlement',
      methodsAr: 'TRC20, ERC20, BTC',
      methodsEn: 'TRC20, ERC20, BTC',
      reqAr: 'عنوان محفظة تجاري معتمد في إعدادات قبس',
      reqEn: 'Verified treasury wallet in QABS Crypto Settings'
    }
  ];

  return (
    <ServicePageTemplate
      service={service}
      extraSection={
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
            {isAr ? 'مقارنة بوابات الدفع المدعومة' : 'Supported Payment Gateways Matrix'}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#EAE6DC] dark:border-slate-800 bg-white dark:bg-[#071D2B]">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#F8F7F2] dark:bg-[#051724] text-[#14243E] dark:text-slate-200 font-black border-b border-[#EAE6DC] dark:border-slate-800">
                <tr>
                  <th className="p-4 text-start">{isAr ? 'البوابة' : 'Gateway'}</th>
                  <th className="p-4 text-start">{isAr ? 'التغطية الجغرافية' : 'Coverage'}</th>
                  <th className="p-4 text-start">{isAr ? 'وسائل الدفع' : 'Payment Methods'}</th>
                  <th className="p-4 text-start">{isAr ? 'متطلبات القبول الأساسية' : 'Primary Requirements'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DC] dark:divide-slate-800">
                {gateways.map(gw => (
                  <tr key={gw.name}>
                    <td className="p-4 font-black text-[#14243E] dark:text-[#D5B46B]">{gw.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{isAr ? gw.regionsAr : gw.regionsEn}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{isAr ? gw.methodsAr : gw.methodsEn}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{isAr ? gw.reqAr : gw.reqEn}</td>
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
