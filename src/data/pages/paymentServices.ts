import { ServicePageData } from '../../types/pages.ts';

export const PAYMENT_SERVICES_DATA: ServicePageData[] = [
  {
    slug: 'payment-gateways',
    path: '/services/payment-gateways',
    category: 'payments',
    categoryLabelAr: 'بوابات الدفع والحسابات',
    categoryLabelEn: 'Payments & Banking',
    titleAr: 'تجهيز وتفعيل بوابات الدفع العالمية (Stripe / PayPal / Tap / Moyasar)',
    titleEn: 'Global & Regional Payment Gateway Onboarding',
    subtitleAr:
      'تأهيل ملف متجرك وشركتك الأمريكية أو الخليجية لتفعيل Stripe و PayPal و Tap و Moyasar و Apple Pay واستلام المدفوعات بعملات متعددة.',
    subtitleEn:
      'Prepare your corporate dossier and storefront compliance to activate Stripe, PayPal Business, Tap, Moyasar, and Apple Pay.',
    seoTitleAr: 'تجهيز وتفعيل بوابات الدفع Stripe و PayPal | قبس',
    seoTitleEn: 'Stripe, PayPal, Tap & Moyasar Payment Gateways | QABS',
    seoDescriptionAr:
      'احصل على تجهيز احترافي لبوابات الدفع العالمية Stripe و PayPal والمحلية Tap و Moyasar مع مطابقة سياسات المتجر والملف القانوني عبر قبس.',
    seoDescriptionEn:
      'Get end-to-end preparation and merchant onboarding for Stripe, PayPal, Tap, and Moyasar backed by compliant US/UK corporate records.',
    detailedDescriptionAr: [
      'رفض طلبات بوابات الدفع العالمية غالباً ما يحدث بسبب نقص صفحة سياسات واضحة، أو عدم تطابق بيانات الشركة والـ EIN مع الحساب البنكي، أو وجود ثغرات في عرض المنتج وتفاصيل الشحن.',
      'تراجع خدمة بوابات الدفع في قبس متجرك وملف شركتك بالكامل قبل التقديم، وتضبط الصفحات القانونية والربط التقني وإعدادات الأمان، ثم ترشدك خطوة بخطوة في التقديم الرسمي لـ Stripe أو PayPal أو بوابات الدفع الخليجية مثل Tap و Moyasar (مع خضوع القبول النهائي لسياسات المزود).'
    ],
    detailedDescriptionEn: [
      'Payment gateway rejections rarely stem from the business model itself—they usually result from mismatched KYB corporate details, missing refund/privacy disclosures, or incomplete checkout verification.',
      'QABS audits your storefront policies, aligns your US/UK entity and EIN records with your business bank account, and configures gateway onboarding for Stripe, PayPal, Tap, and Moyasar (final approval remains subject to provider compliance).'
    ],
    deliveryTimeAr: '2 – 5 أيام عمل لتجهيز الملف والربط',
    deliveryTimeEn: '2 – 5 Business Days Setup & Audit',
    startingPriceUsd: 99,
    pricingNoteAr: 'رسوم التجهيز والمطابقة والربط الفني (خاضع لموافقة مزود الدفع الرسمي).',
    pricingNoteEn: 'Preparation, compliance audit & integration fee (provider approval subject to eligibility).',
    features: [
      {
        titleAr: 'تدقيق امتثال المتجر (Gateway KYB Audit)',
        titleEn: 'Merchant Website KYB Compliance Audit',
        descriptionAr: 'ضبط صفحات الشحن، الاسترجاع، الخصوصية، وبيانات التواصل الرسمية.',
        descriptionEn: 'Verify refund, privacy, shipping, and corporate contact disclosures.'
      },
      {
        titleAr: 'تجهيز Stripe و PayPal عبر الكيان الأمريكي/البريطاني',
        titleEn: 'Stripe & PayPal US/UK Readiness',
        descriptionAr: 'مطابقة اسم الشركة، رقم EIN، العنوان الأمريكي، والحساب البنكي التجاري.',
        descriptionEn: 'Align legal name, IRS EIN, registered address, and fintech routing numbers.'
      },
      {
        titleAr: 'تفعيل بوابات الخليج مدى و Apple Pay',
        titleEn: 'MENA Tap, Moyasar & Mada Setup',
        descriptionAr: 'إعداد بوابات الدفع الخليجية لقبول مدى وبطاقات الائتمان و Apple Pay.',
        descriptionEn: 'Configure Mada, Apple Pay, and local GCC cards via Tap or Moyasar.'
      },
      {
        titleAr: 'دعم العملات الرقمية المستقرة (USDT / BTC)',
        titleEn: 'Stablecoin Crypto Settlement Option',
        descriptionAr: 'إعداد خيارات تسوية بالعملات الرقمية عند الحاجة مع حفظ السجل المالي.',
        descriptionEn: 'Optional USDT/BTC settlement routing integrated into your ledger.'
      }
    ],
    benefitsAr: [
      'تقليل احتمالية رفض أو تجميد حسابات الدفع بنسبة كبيرة عبر التأسيس الصحيح من البداية.',
      'قبول Visa و Mastercard و Apple Pay و مدى من عملائك حول العالم.',
      'إمكانية الربط المباشر داخل متجرك في منصة قبس فور اعتماد الإدارة والمزود.'
    ],
    benefitsEn: [
      'Avoid avoidable merchant holds or rejections caused by incomplete policy disclosures.',
      'Accept Visa, Mastercard, Apple Pay, and Mada across global markets.',
      'Direct activation inside your QABS store workspace upon verification.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'مراجعة الكيان القانوني والنشاط',
        titleEn: 'Review Entity & Business Model',
        descriptionAr: 'التأكد من توافق نشاط المتجر مع قوائم الأنشطة المقبولة لدى البوابة.',
        descriptionEn: 'Verify business category eligibility against provider restricted lists.',
        durationAr: '24 ساعة',
        durationEn: '24 Hours'
      },
      {
        stepNumber: '02',
        titleAr: 'تجهيز المتجر وصفحات الامتثال',
        titleEn: 'Configure Policies & Disclosures',
        descriptionAr: 'إضافة السياسات القانونية، شهادات SSL، وتوضيح بيانات الشركة في التذييل.',
        descriptionEn: 'Publish required terms, refund policies, SSL, and corporate footer details.',
        durationAr: '1–2 يوم',
        durationEn: '1–2 Days'
      },
      {
        stepNumber: '03',
        titleAr: 'تقديم الطلب وربط مفاتيح التشغيل',
        titleEn: 'Submit Application & Connect Keys',
        descriptionAr: 'رفع الوثائق للمزود وربط مفاتيح الدفع و Webhooks في المتجر.',
        descriptionEn: 'Submit KYB verification documents and configure live webhook keys.',
        durationAr: '2–3 أيام عمل',
        durationEn: '2–3 Business Days'
      }
    ],
    packages: [
      {
        id: 'pg_single',
        nameAr: 'تجهيز وربط بوابة دفع واحدة',
        nameEn: 'Single Gateway Onboarding',
        priceUsd: 99,
        billingNoteAr: 'Stripe أو PayPal أو Tap أو Moyasar',
        billingNoteEn: 'Stripe, PayPal, Tap, or Moyasar',
        descriptionAr: 'تدقيق كامل للمتجر وملف الشركة وتجهيز التقديم لبوابة دفع واحدة.',
        descriptionEn: 'Full store audit, compliance check, and integration for one gateway.',
        featuresAr: [
          'مراجعة امتثال المتجر والصفحات القانونية',
          'مطابقة بيانات الشركة والـ EIN والبنك',
          'إعداد واختبار مفاتيح الدفع و Webhooks',
          'دعم فني خلال مرحلة مراجعة المزود'
        ],
        featuresEn: [
          'Storefront legal & policy compliance audit',
          'Corporate & EIN record alignment',
          'Live checkout & webhook configuration',
          'Onboarding review guidance'
        ]
      },
      {
        id: 'pg_bundle',
        nameAr: 'باقة الدفع المزدوجة (Stripe + PayPal / Tap)',
        nameEn: 'Dual Global Gateway Suite',
        priceUsd: 169,
        billingNoteAr: 'الأكثر طلباً للمتاجر العالمية',
        billingNoteEn: 'Best for global stores',
        recommended: true,
        descriptionAr: 'تجهيز وربط بوابتين معاً لرفع معدل إتمام الدفع وتوفير بدائل للعملاء.',
        descriptionEn: 'Configure two payment gateways simultaneously to maximize checkout conversion.',
        featuresAr: [
          'تجهيز بوابة دولية (Stripe / PayPal) + بوابة خليجية أو ثانية',
          'تفعيل Apple Pay وبطاقات الائتمان',
          'حماية ضد النزاعات (Chargeback Readiness)',
          'اختبار عملية شراء فعلية قبل الإطلاق'
        ],
        featuresEn: [
          'Two gateways configured & tested',
          'Apple Pay & multi-currency checkout',
          'Dispute & chargeback prevention setup',
          'Live end-to-end test transaction'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل تضمن قبس قبول Stripe بشكل مطلق؟',
        questionEn: 'Does QABS guarantee 100% Stripe approval?',
        answerAr: 'يخضع القبول النهائي دائماً لسياسات Stripe أو PayPal وأهلية النشاط، لكن قبس تضمن لك تجهيز ملف قانوني ومتجر مطابق لكافة المعايير الفنية والمالية المطلوبة.',
        answerEn: 'Final underwriting always rests with Stripe or PayPal based on eligibility, while QABS ensures your entity, banking, and website meet all technical and compliance standards.'
      },
      {
        questionAr: 'ما المستندات المطلوبة لربط Tap أو Moyasar لمتاجر الخليج؟',
        questionEn: 'What documents are needed for Tap or Moyasar in the GCC?',
        answerAr: 'يلزم سجل تجاري أو رخصة عمل حر سارية مع حساب بنكي مطابق لاسم الكيان وصفحات سياسات استرجاع وخصوصية واضحة باللغتين.',
        answerEn: 'An active commercial registration or freelance permit, matching IBAN, and clear Arabic/English refund and privacy pages are required.'
      }
    ],
    formFields: [
      {
        name: 'gatewayChoice',
        labelAr: 'بوابة الدفع المستهدفة',
        labelEn: 'Target Payment Gateway',
        type: 'select',
        required: true,
        options: [
          { value: 'stripe', labelAr: 'Stripe (عالمي)', labelEn: 'Stripe Global' },
          { value: 'paypal', labelAr: 'PayPal Business', labelEn: 'PayPal Business' },
          { value: 'tap', labelAr: 'Tap Payments (الخليج والشرق الأوسط)', labelEn: 'Tap Payments (MENA)' },
          { value: 'moyasar', labelAr: 'Moyasar / مدى (السعودية)', labelEn: 'Moyasar (Saudi Arabia)' }
        ]
      },
      {
        name: 'hasCompany',
        labelAr: 'هل لديك شركة مسجلة حالياً؟',
        labelEn: 'Do you have a registered company?',
        type: 'select',
        required: true,
        options: [
          { value: 'us_llc', labelAr: 'نعم، شركة أمريكية (US LLC) + EIN', labelEn: 'Yes, US LLC + EIN' },
          { value: 'local_cr', labelAr: 'نعم، سجل تجاري محلي / خليجي', labelEn: 'Yes, Local Commercial Registration' },
          { value: 'need_formation', labelAr: 'لا، أحتاج تأسيس شركة أولاً مع البوابة', labelEn: 'No, I need company formation first' }
        ]
      }
    ],
    relatedPaths: ['/services/business-accounts', '/services/payment-integration', '/services/us-llc', '/services/store-creation']
  },
  {
    slug: 'business-accounts',
    path: '/services/business-accounts',
    category: 'payments',
    categoryLabelAr: 'بوابات الدفع والحسابات',
    categoryLabelEn: 'Payments & Banking',
    titleAr: 'تجهيز الحسابات البنكية التجارية العالمية (Mercury / Wise / Relay)',
    titleEn: 'Global Business Banking Setup (Mercury / Wise / Relay)',
    subtitleAr:
      'إعداد ومراجعة ملف شركتك الأمريكية أو البريطانية للتقديم بنجاح على حسابات الأعمال الرقمية مع أرقام حساب (ACH / Wire / IBAN) وبطاقات شركات افتراضية.',
    subtitleEn:
      'Prepare your US/UK entity dossier to open commercial fintech bank accounts with ACH/Wire routing, multi-currency IBANs, and virtual corporate cards.',
    seoTitleAr: 'فتح الحسابات البنكية التجارية الأمريكية للشركات | قبس',
    seoTitleEn: 'US & UK Business Bank Account Setup | QABS',
    seoDescriptionAr:
      'جهّز ملف شركتك الأمريكية لفتح حساب بنكي تجاري في Mercury أو Wise Business أو Relay مع قرار مجلس الإدارة وخطابات التأسيس عبر قبس.',
    seoDescriptionEn:
      'Prepare your corporate banking application for Mercury, Wise Business, and Relay with certified formation filings and banking resolutions.',
    detailedDescriptionAr: [
      'تُعد الحسابات البنكية الرقمية للأعمال مثل Mercury و Relay و Wise Business و Payoneer العصب المالي لأي شركة عالمية؛ فهي تمنحك أرقام حساب وتوجيه أمريكية (Checking & Routing Numbers)، بطاقات Visa/Mastercard للشركات، وإدارة تحويلات دولية برسوم منخفضة.',
      'يقوم فريق قبس بتجهيز حزمة المستندات البنكية الدقيقة المطلوبة في إجراءات التحقق (KYB): شهادة التأسيس المصدقة، خطاب EIN، اتفاقية التشغيل الموقعة، قرار فتح الحساب البنكي، ومراجعة الموقع الإلكتروني للشركة لضمان توافق كل التفاصيل قبل تقديم الطلب.'
    ],
    detailedDescriptionEn: [
      'Commercial fintech platforms such as Mercury, Relay, Wise Business, and Payoneer provide global founders with US ACH/Wire routing numbers, corporate debit cards, and multi-currency treasury management.',
      'QABS compiles and audits your complete KYB banking package—Articles of Organization, IRS EIN confirmation, signed Operating Agreement, Banking Resolution, and corporate website alignment—before you submit your application.'
    ],
    deliveryTimeAr: '2 – 5 أيام عمل لتجهيز الملف والتقديم',
    deliveryTimeEn: '2 – 5 Business Days Dossier & Filing',
    startingPriceUsd: 89,
    pricingNoteAr: 'تشمل مراجعة الملف البنكي، صياغة قرار البنك، وتوجيه التقديم الرسمي.',
    pricingNoteEn: 'Covers KYB dossier assembly, Banking Resolution, and guided application.',
    features: [
      {
        titleAr: 'ملف KYB متكامل ومطابق للبنوك',
        titleEn: 'Bank-Grade KYB Compliance Dossier',
        descriptionAr: 'تطابق تام بين الاسم، العنوان التجاري، هيكل الملكية، ووصف النشاط.',
        descriptionEn: 'Exact consistency across legal name, address, ownership table, and business bio.'
      },
      {
        titleAr: 'صياغة قرار فتح الحساب (Banking Resolution)',
        titleEn: 'Custom Corporate Banking Resolution',
        descriptionAr: 'مستند قانوني يخول المفوض بالتوقيع بفتح وإدارة الحسابات البنكية.',
        descriptionEn: 'Signed resolution authorizing account signers and treasury access.'
      },
      {
        titleAr: 'تجهيز Mercury و Wise Business و Relay',
        titleEn: 'Mercury, Wise & Relay Guidance',
        descriptionAr: 'اختيار البنك الأنسب لبلد إقامة المؤسس وتقليل احتمالية طلب مستندات متكررة.',
        descriptionEn: 'Match your founder residency and business model to the right banking partner.'
      }
    ],
    benefitsAr: [
      'استلام عوائد Stripe و Amazon و PayPal مباشرة بالدولار الأمريكي دون خسائر تحويل.',
      'إصدار بطاقات شركات افتراضية لتمويل الإعلانات والاشتراكات البرمجية.',
      'إدارة التحويلات الدولية للموردين والشركاء بوضوح محاسبي.'
    ],
    benefitsEn: [
      'Receive Stripe, PayPal, and marketplace payouts directly in USD.',
      'Issue virtual corporate cards for ad spend and SaaS subscriptions.',
      'Send low-cost international wires to suppliers and contractors.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'مراجعة أهلية الدولة والنشاط',
        titleEn: 'Eligibility & Bank Matching',
        descriptionAr: 'تحديد البنك الأنسب (Mercury، Relay، أو Wise) وفق جنسية المؤسس ونوع النشاط.',
        descriptionEn: 'Identify optimal fintech banks matching founder residency and business vertical.',
        durationAr: '24 ساعة',
        durationEn: '24 Hours'
      },
      {
        stepNumber: '02',
        titleAr: 'إعداد المستندات والموقع التعريفي',
        titleEn: 'Compile Docs & Web Presence',
        descriptionAr: 'تجهيز ملف التأسيس و EIN واتفاقية التشغيل وقرار البنك وربط النطاق.',
        descriptionEn: 'Assemble Articles, EIN, Operating Agreement, Resolution, and site links.',
        durationAr: '1–2 يوم',
        durationEn: '1–2 Days'
      },
      {
        stepNumber: '03',
        titleAr: 'رفع الطلب ومتابعة التحقق',
        titleEn: 'Guided Submission & Follow-Up',
        descriptionAr: 'إرسال الطلب والإجابة الدقيقة على أسئلة فريق الامتثال في البنك حتى التفعيل.',
        descriptionEn: 'Submit application and respond accurately to bank compliance questionnaires.',
        durationAr: '2–5 أيام عمل',
        durationEn: '2–5 Business Days'
      }
    ],
    packages: [
      {
        id: 'bank_prep',
        nameAr: 'تجهيز وتقديم لحساب بنكي تجاري واحد',
        nameEn: 'Single Business Bank Prep',
        priceUsd: 89,
        billingNoteAr: 'Mercury أو Wise أو Relay',
        billingNoteEn: 'Mercury, Wise, or Relay',
        recommended: true,
        descriptionAr: 'إعداد كامل الملف البنكي القانوني وإرشاد التقديم لبنك أعمال واحد.',
        descriptionEn: 'Complete KYB dossier assembly and guided submission for one fintech bank.',
        featuresAr: [
          'فحص وتدقيق كافة مستندات الشركة',
          'إصدار قرار فتح الحساب البنكي (Resolution)',
          'صياغة وصف النشاط ومصادر الدخل المتوقعة',
          'مرافقة حتى الرد على استفسارات البنك'
        ],
        featuresEn: [
          'Full corporate document verification',
          'Custom Corporate Banking Resolution',
          'Underwriting-ready business & revenue narrative',
          'Support during compliance review'
        ]
      },
      {
        id: 'bank_dual',
        nameAr: 'باقة الحسابين الاحتياطية (Mercury + Wise / Relay)',
        nameEn: 'Dual Treasury Banking Suite',
        priceUsd: 149,
        billingNoteAr: 'تأمين استمرارية السيولة',
        billingNoteEn: 'Redundant business banking',
        descriptionAr: 'تجهيز ملفين بنكيين منفصلين لضمان عدم اعتماد الشركة على حساب واحد فقط.',
        descriptionEn: 'Prepare two parallel commercial bank applications for financial redundancy.',
        featuresAr: [
          'إعداد الطلب الأساسي (Mercury / Relay) + حساب متعدد العملات (Wise)',
          'مراجعة تطابق العنوان التجاري والموقع الإلكتروني',
          'دعم تفعيل البطاقات الافتراضية والتحويلات',
          'ربط البيانات المالية داخل لوحة قبس'
        ],
        featuresEn: [
          'Primary USD bank + multi-currency Wise setup',
          'Corporate website & address verification check',
          'Virtual card & ACH setup guidance',
          'Workspace banking registry integration'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل يجب السفر إلى أمريكا لفتح حساب Mercury أو Wise Business؟',
        questionEn: 'Do I need to visit the US to open Mercury or Wise Business?',
        answerAr: 'لا، يتم التقديم إلكترونياً بالكامل عبر الإنترنت باستخدام جواز السفر ومستندات الشركة الأمريكية أو البريطانية.',
        answerEn: 'No, applications are 100% online using your passport and corporate formation documents.'
      },
      {
        questionAr: 'هل تصدر بطاقات فيزا وماستركارد للشركات مع الحساب؟',
        questionEn: 'Are virtual corporate Visa/Mastercard debit cards included?',
        answerAr: 'نعم، تتيح منصات مثل Mercury و Relay و Wise Business إصدار بطاقات شركات افتراضية وفعلية بمجرد تفعيل الحساب التجاري.',
        answerEn: 'Yes, once verified, Mercury, Relay, and Wise Business allow issuing virtual and physical corporate cards linked to your company treasury.'
      }
    ],
    formFields: [
      {
        name: 'preferredBank',
        labelAr: 'البنك التجاري المفضل',
        labelEn: 'Preferred Banking Platform',
        type: 'select',
        required: true,
        options: [
          { value: 'mercury', labelAr: 'Mercury Business (USA)', labelEn: 'Mercury Business (USA)' },
          { value: 'wise', labelAr: 'Wise Business (Multi-Currency)', labelEn: 'Wise Business (Multi-Currency)' },
          { value: 'relay', labelAr: 'Relay Financial (USA)', labelEn: 'Relay Financial (USA)' },
          { value: 'payoneer', labelAr: 'Payoneer Commercial', labelEn: 'Payoneer Commercial' }
        ]
      },
      {
        name: 'companyStatus',
        labelAr: 'حالة الشركة والرقم الضريبي EIN',
        labelEn: 'Company & EIN Status',
        type: 'select',
        required: true,
        options: [
          { value: 'ready', labelAr: 'لدي شركة مؤسسة ورقم EIN جاهز', labelEn: 'Company & EIN ready' },
          { value: 'formation_only', labelAr: 'الشركة مؤسسة وبانتظار EIN', labelEn: 'Formed, waiting for EIN' },
          { value: 'need_both', labelAr: 'أحتاج التأسيس + الحساب البنكي معاً', labelEn: 'Need formation + bank setup' }
        ]
      }
    ],
    relatedPaths: ['/services/payment-gateways', '/services/ein', '/services/company-formation']
  },
  {
    slug: 'payment-integration',
    path: '/services/payment-integration',
    category: 'payments',
    categoryLabelAr: 'بوابات الدفع والحسابات',
    categoryLabelEn: 'Payments & Banking',
    titleAr: 'الربط البرمجي لبوابات الدفع وأنظمة التسوية (Payment Integration)',
    titleEn: 'Technical Payment API & Webhook Integration',
    subtitleAr:
      'تكامل برمجي آمن وموثوق لبوابات الدفع في متجرك أو تطبيقك مع معالجة Webhooks، الفوترة التلقائية، تسوية العملات، وتجارب الدفع السريع.',
    subtitleEn:
      'Secure technical API & webhook integration for Stripe, Moyasar, Tap, PayPal, and Apple Pay with automated invoicing and reconciliation.',
    seoTitleAr: 'الربط البرمجي لبوابات الدفع والـ API | قبس QABS',
    seoTitleEn: 'Payment Gateway API & Webhook Integration | QABS',
    seoDescriptionAr:
      'ربط برمجي احترافي لبوابات Stripe و Moyasar و Tap و PayPal مع متاجر قبس أو المواقع المخصصة وتفعيل Webhooks و Apple Pay واختبارات الإنتاج.',
    seoDescriptionEn:
      'Full technical API integration for Stripe, Moyasar, Tap, and PayPal including 3D Secure, Apple Pay domain verification, and webhooks.',
    detailedDescriptionAr: [
      'تتطلب بوابات الدفع الحديثة أكثر من مجرد لصق مفاتيح API؛ فإهمال التحقق من توقيع الـ Webhooks أو عدم ضبط Apple Pay Domain Association أو ثغرات تحديث حالة الطلب يؤدي إلى خسارة الطلبات المدفوعة أو فشل إصدار الفواتير.',
      'يتولى مهندسو التكامل في قبس ربط بوابات الدفع المعتمدة برمجياً في متجرك أو موقعك المخصص، ضبط بيئة الاختبار ثم الإنتاج، التحقق من 3D Secure، وربط الإشعارات المالية مع لوحة المحاسبة.'
    ],
    detailedDescriptionEn: [
      'Production payment engineering requires far more than pasting API keys. Unverified webhooks, missing Apple Pay domain verification, or race conditions in order fulfillment lead to lost revenue and reconciliation headaches.',
      'QABS integration engineers implement end-to-end payment APIs with cryptographic webhook validation, 3D Secure flows, Apple Pay domain association, and automated invoice synchronization.'
    ],
    deliveryTimeAr: '2 – 4 أيام عمل للتنفيذ والاختبار',
    deliveryTimeEn: '2 – 4 Business Days Integration & QA',
    startingPriceUsd: 129,
    pricingNoteAr: 'تشمل الربط الكامل، التحقق من Webhooks، وتنفيذ معاملات اختبار حية.',
    pricingNoteEn: 'Includes API integration, webhook signature validation, and sandbox/live verification.',
    features: [
      {
        titleAr: 'ربط Stripe Connect / Payment Intents',
        titleEn: 'Stripe Payment Intents & Webhooks',
        descriptionAr: 'دعم البطاقات، Apple Pay، التحقق من 3DS، وإدارة المرتجعات برمجياً.',
        descriptionEn: 'Cards, Apple Pay, 3D Secure authentication, and automated refund sync.'
      },
      {
        titleAr: 'ربط بوابات الخليج Tap و Moyasar',
        titleEn: 'Tap & Moyasar Saudi/GCC APIs',
        descriptionAr: 'دعم بطاقات مدى، STC Pay، Apple Pay، والعملات الخليجية بدقة.',
        descriptionEn: 'Native support for Mada, STC Pay, Apple Pay, and GCC currencies.'
      },
      {
        titleAr: 'تأمين Webhooks ومطابقة الفواتير',
        titleEn: 'Signed Webhooks & Auto-Invoicing',
        descriptionAr: 'منع تكرار المعاملات وتحديث حالة الطلب وإصدار الفاتورة تلقائياً.',
        descriptionEn: 'Idempotent webhook listeners updating order status and invoices instantly.'
      }
    ],
    benefitsAr: [
      'منع أخطاء تضارب الدفع أو عدم تسجيل الطلبات بعد خصم المبلغ من العميل.',
      'رفع سرعة إتمام الدفع عبر Apple Pay و PayPal Express.',
      'جاهزية كاملة لتشغيل وضع الإنتاج المباشر بعد موافقة الإدارة.'
    ],
    benefitsEn: [
      'Eliminate dropped orders between payment capture and database fulfillment.',
      'Higher conversion with one-tap Apple Pay and PayPal Express.',
      'Clean sandbox-to-production deployment checklist.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'فحص البوابة والبيئة التقنية',
        titleEn: 'Inspect Stack & Gateway Keys',
        descriptionAr: 'تحديد نوع المنصة (متاجر قبس، React، Next.js، Shopify) ومفاتيح Sandbox.',
        descriptionEn: 'Review your tech stack and verify merchant sandbox credentials.',
        durationAr: 'نفس اليوم',
        durationEn: 'Same Day'
      },
      {
        stepNumber: '02',
        titleAr: 'البرمجة وتثبيت الـ Webhooks',
        titleEn: 'Implement API & Webhook Handlers',
        descriptionAr: 'ربط تدفق الدفع، تشفير المفاتيح في الخادم، وضبط إشعارات الدفع الفاشل والناجح.',
        descriptionEn: 'Build server-side payment sessions, webhook verification, and callbacks.',
        durationAr: '1–2 يوم عمل',
        durationEn: '1–2 Business Days'
      },
      {
        stepNumber: '03',
        titleAr: 'اختبارات الأمان والتشغيل الفعلي',
        titleEn: 'Security QA & Production Cutover',
        descriptionAr: 'تنفيذ اختبارات 3D Secure والمرتجعات ثم التبديل الآمن إلى مفاتيح الإنتاج.',
        descriptionEn: 'Validate 3DS flows, refunds, and safely promote to production keys.',
        durationAr: '1 يوم',
        durationEn: '1 Day'
      }
    ],
    packages: [
      {
        id: 'pi_standard',
        nameAr: 'ربط بوابة دفع واحدة برمجياً',
        nameEn: 'Single Gateway API Integration',
        priceUsd: 129,
        billingNoteAr: 'تسليم كامل',
        billingNoteEn: 'One-time integration',
        recommended: true,
        descriptionAr: 'ربط بوابة دفع واحدة (Stripe / Moyasar / Tap / PayPal) مع Webhooks والفواتير.',
        descriptionEn: 'End-to-end API & webhook setup for one gateway plus live test verification.',
        featuresAr: [
          'ربط Checkout API على الخادم بأمان',
          'برمجة والتحقق من Webhooks',
          'إعداد Apple Pay (ملف التحقق)',
          'اختبار الدفع والاسترجاع في البيئة الحية'
        ],
        featuresEn: [
          'Server-side Checkout API integration',
          'Cryptographic webhook handler',
          'Apple Pay domain verification',
          'Live payment & refund verification'
        ]
      },
      {
        id: 'pi_multi',
        nameAr: 'منظومة دفع متعددة البوابات + عملات رقمية',
        nameEn: 'Multi-Gateway + Crypto Routing',
        priceUsd: 279,
        billingNoteAr: 'حل متقدم',
        billingNoteEn: 'Advanced routing',
        descriptionAr: 'ربط عدة بوابات مع التوجيه الذكي حسب عملة العميل أو بلده.',
        descriptionEn: 'Integrate multiple gateways with geo/currency smart routing and crypto.',
        featuresAr: [
          'ربط حتى 3 بوابات دفع (محلية + عالمية)',
          'توجيه ذكي حسب العملة والدولة',
          'تفعيل خيار الدفع بالعملات الرقمية USDT',
          'مراقبة الأخطاء وتوثيق الكود بالكامل'
        ],
        featuresEn: [
          'Up to 3 gateways (local + global)',
          'Currency & country smart routing',
          'USDT stablecoin checkout option',
          'Error logging & full technical docs'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل تحفظون مفاتيح الـ API السرية بأمان؟',
        questionEn: 'How are secret API keys stored during integration?',
        answerAr: 'يتم عزل كافة المفاتيح السرية في متغيرات البيئة على الخادم (Server-Side Env) ولا تُكشف أبداً في كود المتصفح.',
        answerEn: 'All secret credentials remain strictly in server-side environment variables and are never exposed client-side.'
      },
      {
        questionAr: 'كم يستغرق اختبار وضع Sandbox قبل التحويل إلى الإنتاج؟',
        questionEn: 'How long does sandbox verification take before production cutover?',
        answerAr: 'تُختبر معاملات 3DS و Webhooks والاسترجاع خلال 24 ساعة من الربط، ولا يُفعّل التشغيل المباشر إلا بعد تحقق الإدارة ومفاتيح المزود الحية.',
        answerEn: '3D Secure, webhook signatures, and refund callbacks are tested in sandbox within 24 hours before switching to approved live credentials.'
      }
    ],
    formFields: [
      {
        name: 'targetApp',
        labelAr: 'نوع الموقع أو التطبيق',
        labelEn: 'Website / Platform Type',
        type: 'select',
        required: true,
        options: [
          { value: 'qabs_store', labelAr: 'متجر في منصة قبس', labelEn: 'QABS Storefront' },
          { value: 'custom_react_node', labelAr: 'تطبيق ويب مخصص (React / Next / Node)', labelEn: 'Custom Web App (React/Next/Node)' },
          { value: 'shopify_woo', labelAr: 'Shopify / WooCommerce', labelEn: 'Shopify / WooCommerce' }
        ]
      },
      {
        name: 'gatewaysList',
        labelAr: 'البوابات المطلوب ربطها',
        labelEn: 'Gateways to Integrate',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: Stripe + Moyasar + Apple Pay',
        placeholderEn: 'e.g. Stripe + Moyasar + Apple Pay'
      }
    ],
    relatedPaths: ['/services/payment-gateways', '/services/web-development', '/services/store-development']
  }
];
