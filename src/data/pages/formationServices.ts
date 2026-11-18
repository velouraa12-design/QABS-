import { ServicePageData } from '../../types/pages.ts';

export const FORMATION_SERVICES: ServicePageData[] = [
  {
    slug: 'company-formation',
    path: '/services/company-formation',
    category: 'formation',
    categoryLabelAr: 'تأسيس الشركات',
    categoryLabelEn: 'Company Formation',
    titleAr: 'تأسيس الشركات الأمريكية والبريطانية الدولية',
    titleEn: 'US & UK International Company Formation',
    subtitleAr:
      'ابدأ طلب تأسيس كيان في الولايات المتحدة أو المملكة المتحدة. أهلية الملكية الأجنبية ومتطلبات التأسيس والضرائب تختلف حسب الولاية ونوع الكيان والنشاط؛ كما أن التسجيل لا يضمن فتح حساب بنكي أو قبول بوابة دفع.',
    subtitleEn:
      'Request US or UK entity formation. Foreign-ownership eligibility, filing, and tax requirements vary by jurisdiction, entity type, and activity; incorporation does not guarantee a bank account or payment-processor approval.',
    seoTitleAr: 'تأسيس الشركات الأمريكية والبريطانية | منصة قبس QABS',
    seoTitleEn: 'US & UK Company Formation Services | QABS Digital Platform',
    seoDescriptionAr:
      'معلومات عن المساعدة في تأسيس بعض الكيانات الأمريكية والبريطانية، مع مراجعة الأهلية والرسوم والمتطلبات قبل قبول الطلب.',
    seoDescriptionEn:
      'Formation assistance for eligible US and UK entities, subject to jurisdictional requirements, provider availability, and confirmation of the service scope.',
    detailedDescriptionAr: [
      'توفر منصة قبس الرقمية خدمة مساعدة في تأسيس الشركات الدولية عن بُعد للمتقدمين المؤهلين. تختلف متطلبات الإقامة والتحقق والحضور بحسب الاختصاص ونوع الكيان والنشاط.',
      'تساعد قبس في إعداد المستندات ومراجعتها وتجهيز الإيداع لدى الجهة المختصة بعد قبول الطلب وتأكيد نطاق الخدمة. يصدر السجل الحكومي المستندات الرسمية، ويُحدد وقتها وإمكانية تسليمها بحسب الجهة وتفعيل قناة الوثائق.'
    ],
    detailedDescriptionEn: [
      'QABS provides remote formation assistance for eligible applicants. Residency, identity verification, and in-person requirements vary by jurisdiction, entity type, and activity.',
      'QABS can assist with document preparation and filing coordination after eligibility review and service-scope confirmation. The relevant registry issues official records and controls processing times and document delivery.'
    ],
    deliveryTimeAr: 'المدة تقديرية وتتغير حسب الجهة الحكومية واكتمال المستندات',
    deliveryTimeEn: 'Estimated timing varies by registry and document completeness',
    startingPriceUsd: 179,
    pricingNoteAr: 'رسوم الإيداع الحكومية تُضاف حسب الاختصاص. الخدمة تخضع لمراجعة الأهلية والمستندات وتأكيد التوفر والسعر قبل التنفيذ؛ لا تضمن قبس إصدار EIN أو فتح حساب أو موافقة أي مزود.',
    pricingNoteEn: 'Government filing fees vary by jurisdiction. Service is subject to eligibility, document review, availability, and price confirmation; QABS does not guarantee EIN issuance, account opening, or provider approval.',
    features: [
      {
        titleAr: 'إمكانية الملكية لغير المقيمين',
        titleEn: 'Non-Resident Ownership Eligibility',
        descriptionAr: 'قد تسمح بعض الولايات والهياكل بملكية غير المقيمين؛ تُراجع أهلية المالك والنشاط ومتطلبات الإفصاح قبل التقديم.',
        descriptionEn: 'Some jurisdictions and entity structures may permit non-resident ownership; owner eligibility, business activity, and disclosure rules must be reviewed before filing.'
      },
      {
        titleAr: 'مستندات مساعدة لطلبات الحسابات والدفع',
        titleEn: 'Banking & Payment Application Support',
        descriptionAr: 'نساعد في تنظيم مستندات الشركة لطلبات مقدمي الخدمات؛ لكل مزود شروطه وفحوصه وقراره المستقل.',
        descriptionEn: 'We help organize company documents for provider applications; each provider applies its own eligibility checks and makes independent approval decisions.'
      },
      {
        titleAr: 'اتفاقية تشغيل وصلاحيات مخصصة',
        titleEn: 'Custom Operating Agreement',
        descriptionAr: 'صياغة احترافية لاتفاقية التشغيل وقرارات التوقيع البنكي جاهزة للاعتماد.',
        descriptionEn: 'Professionally drafted Operating Agreement and Banking Resolution ready for signing.'
      },
      {
        titleAr: 'خزينة مستندات موثقة',
        titleEn: 'Digital Corporate Vault',
        descriptionAr: 'تُسلّم المستندات عبر القناة المتاحة بعد اكتمال الخدمة وتأكيد تفعيل خزينة الوثائق.',
        descriptionEn: 'Documents are delivered through the available channel after service completion and confirmation that the document vault is enabled.'
      }
    ],
    benefitsAr: [
      'قد يوفر الكيان فصلاً قانونياً بين أصول الشركة والأصول الشخصية عند الالتزام بالقوانين والإدارة السليمة؛ لا يُعد ذلك حماية مطلقة.',
      'إمكانية التقديم على بوابات الدفع العالمية مثل Stripe و PayPal.',
      'البيع في الأسواق الأمريكية والأوروبية ومنصات أمازون وشوبيفاي باسم شركة رسمية.',
      'إدارة التأسيس والمتاجر والفوترة من لوحة تحكم موحدة.'
    ],
    benefitsEn: [
      'An entity may provide legal separation between business and personal assets when properly maintained; this is not absolute protection.',
      'Eligibility to apply for global payment processors like Stripe and PayPal.',
      'Sell on Amazon US, Shopify, and B2B global contracts under a registered entity.',
      'Unified QABS workspace linking corporate compliance with online store operations.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'اختيار الولاية ونوع الكيان',
        titleEn: 'Select Jurisdiction & Entity Type',
        descriptionAr: 'حدد الاختصاص القانوني الأنسب (وايومنغ، ديلاوير، نيو مكسيكو، كنتاكي أو بريطانيا) واسم الشركة.',
        descriptionEn: 'Choose your ideal jurisdiction (Wyoming, Delaware, New Mexico, UK LTD) and entity structure.',
        durationAr: '10 دقائق',
        durationEn: '10 mins'
      },
      {
        stepNumber: '02',
        titleAr: 'مراجعة البيانات وفحص الاسم',
        titleEn: 'Name Screening & KYC Review',
        descriptionAr: 'يتحقق فريق الامتثال في قبس من توفر الاسم التجاري ومطابقة بيانات المؤسسين.',
        descriptionEn: 'Our compliance desk verifies corporate name availability and founder documentation.',
        durationAr: 'بعد اكتمال المراجعة',
        durationEn: 'After review is completed'
      },
      {
        stepNumber: '03',
        titleAr: 'الإيداع الرسمي وإصدار الشهادة',
        titleEn: 'Official State Filing & Issuance',
        descriptionAr: 'يُقدّم الملف بعد اكتمال المتطلبات؛ تصدر الشهادة وفق وقت معالجة الجهة الحكومية.',
        descriptionEn: 'The filing is submitted after requirements are complete; the registry determines issuance timing.',
        durationAr: 'حسب مدة معالجة الجهة الحكومية',
        durationEn: 'Subject to government processing times'
      },
      {
        stepNumber: '04',
        titleAr: 'استخراج EIN وتجهيز الحسابات',
        titleEn: 'EIN & Banking Readiness',
        descriptionAr: 'متابعة طلب EIN عند انطباق الأهلية، وتنظيم المستندات المطلوبة لتقديمات الحسابات والدفع دون ضمان الموافقة.',
        descriptionEn: 'Assist with the EIN request where eligible and organize documents for banking and payment applications without guaranteeing approval.',
        durationAr: 'تختلف حسب معالجة IRS واكتمال الطلب',
        durationEn: 'Varies with IRS processing and application completeness'
      }
    ],
    packages: [
      {
        id: 'cf_starter',
        nameAr: 'باقة البداية (Starter)',
        nameEn: 'Starter Formation',
        priceUsd: 179,
        billingNoteAr: 'تأسيس أساسي + رسوم الولاية',
        billingNoteEn: 'Core filing + state fee',
        descriptionAr: 'مناسبة لمن يحتاج تأسيس الكيان الرسمي في بريطانيا أو الولايات الاقتصادية.',
        descriptionEn: 'Ideal for founders seeking official registration with essential compliance.',
        featuresAr: [
          'فحص توفر الاسم التجاري',
          'إيداع عقد التأسيس الرسمي',
          'وكيل مسجل مجاني لمدة شهرين',
          'نسخة رقمية في خزينة الوثائق'
        ],
        featuresEn: [
          'Corporate name availability check',
          'Official Articles of Organization filing',
          '2 months complimentary Registered Agent',
          'Digital delivery in QABS Vault'
        ]
      },
      {
        id: 'cf_complete',
        nameAr: 'الباقة المتكاملة (Complete)',
        nameEn: 'Complete Formation',
        priceUsd: 299,
        billingNoteAr: '+ رسوم الولاية الحكومية',
        billingNoteEn: '+ statutory state fee',
        descriptionAr: 'الباقة المعتمدة للتجارة الإلكترونية، تشمل التأسيس والرقم الضريبي والوكيل.',
        descriptionEn: 'Recommended e-commerce package including EIN, Operating Agreement, and Agent.',
        recommended: true,
        featuresAr: [
          'تأسيس الشركة في الولاية المختارة',
          'استخراج الرقم الضريبي الفيدرالي EIN',
          'صياغة اتفاقية التشغيل Operating Agreement',
          'وكيل مسجل وعنوان رسمي لمدة شهرين مجاناً',
          'قرار التوقيع البنكي Banking Resolution'
        ],
        featuresEn: [
          'Full state entity incorporation',
          'Federal IRS EIN Tax ID issuance',
          'Custom Operating Agreement drafting',
          'Registered Agent & street address (2 months free)',
          'Official Banking Resolution'
        ]
      },
      {
        id: 'cf_turnkey',
        nameAr: 'باقة الانطلاقة الشاملة (Turnkey)',
        nameEn: 'Turnkey Executive',
        priceUsd: 599,
        billingNoteAr: 'تشمل أولوية التنفيذ وسنة وكيل',
        billingNoteEn: 'Includes priority filing & 1-yr agent',
        descriptionAr: 'حل متكامل يشمل سنة وكيل مسجل وتجهيز ملف البنك وبوابات الدفع وأولوية التنفيذ.',
        descriptionEn: 'All-inclusive launch with 1 full year registered agent, banking prep, and priority queue.',
        featuresAr: [
          'جميع مزايا الباقة المتكاملة',
          'وكيل مسجل وعنوان أمريكي لسنة كاملة',
          'أولوية معالجة سريعة للإيداع',
          'تجهيز ملف Mercury / Wise و Stripe',
          'دعم استشاري مخصص بعد التأسيس'
        ],
        featuresEn: [
          'All Complete package deliverables',
          'Full 1-year Registered Agent & US address',
          'Priority state filing handling',
          'Mercury / Wise & Stripe readiness file',
          'Dedicated post-formation specialist support'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل أحتاج إلى تأشيرة أو سفر لأمريكا لتأسيس الشركة؟',
        questionEn: 'Do I need a US visa or travel to form a company?',
        answerAr: 'غالباً يمكن إنجاز أجزاء كبيرة عن بُعد، لكن قد تتطلب بعض الحالات توثيقاً أو تحققاً إضافياً أو إجراءات حضور وفق الجهة والكيان.',
        answerEn: 'Much of the process can often be handled remotely, but some cases may require notarization, additional verification, or in-person steps depending on the registry and entity.'
      },
      {
        questionAr: 'ما هي المستندات المطلوبة لبدء طلب التأسيس؟',
        questionEn: 'What documents are required to begin formation?',
        answerAr: 'صورة واضحة لجواز سفر ساري المفعول للمؤسس أو الشركاء، واسم الشركة المقترح، ونشاط الشركة.',
        answerEn: 'A clear copy of a valid passport for the founder(s), proposed company name, and business activity description.'
      },
      {
        questionAr: 'هل تشمل الباقة استخراج الرقم الضريبي EIN؟',
        questionEn: 'Does the package include Federal EIN issuance?',
        answerAr: 'نعم، الباقة المتكاملة وباقة الانطلاقة الشاملة تشملان استخراج الرقم الضريبي الفيدرالي EIN رسمياً من IRS.',
        answerEn: 'Yes, both our Complete and Turnkey packages include official IRS EIN issuance for non-US residents.'
      }
    ],
    formFields: [
      {
        name: 'jurisdiction',
        labelAr: 'الولاية أو الدولة المطلوبة',
        labelEn: 'Target Jurisdiction',
        type: 'select',
        required: true,
        options: [
          { value: 'Wyoming LLC', labelAr: 'وايومنغ الأمريكية (Wyoming LLC)', labelEn: 'Wyoming LLC (USA)' },
          { value: 'Delaware LLC', labelAr: 'ديلاوير الأمريكية (Delaware LLC)', labelEn: 'Delaware LLC (USA)' },
          { value: 'New Mexico LLC', labelAr: 'نيو مكسيكو (New Mexico LLC)', labelEn: 'New Mexico LLC (USA)' },
          { value: 'Kentucky LLC', labelAr: 'كنتاكي (Kentucky LLC)', labelEn: 'Kentucky LLC (USA)' },
          { value: 'UK LTD', labelAr: 'شركة بريطانية (UK LTD)', labelEn: 'United Kingdom (UK LTD)' }
        ]
      },
      {
        name: 'businessActivity',
        labelAr: 'النشاط التجاري للشركة',
        labelEn: 'Primary Business Activity',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: التجارة الإلكترونية والبرمجيات',
        placeholderEn: 'e.g. E-Commerce & Digital Services'
      }
    ],
    relatedPaths: ['/services/us-llc', '/services/ein', '/services/registered-agent', '/services/business-accounts']
  },
  {
    slug: 'ein',
    path: '/services/ein',
    category: 'formation',
    categoryLabelAr: 'تأسيس الشركات',
    categoryLabelEn: 'Company Formation',
    titleAr: 'استخراج الرقم الضريبي الفيدرالي الأمريكي (EIN)',
    titleEn: 'Federal IRS EIN Tax ID Issuance',
    subtitleAr:
      'احصل على الرقم التعريفي لصاحب العمل (EIN) من مصلحة الضرائب الأمريكية IRS لغير المقيمين دون رقم SSN، مع تسليم خطاب CP575 الرسمي.',
    subtitleEn:
      'Obtain your official IRS Employer Identification Number (EIN) as a non-US resident without an SSN, including official IRS confirmation.',
    seoTitleAr: 'استخراج الرقم الضريبي الأمريكي EIN لغير المقيمين | قبس',
    seoTitleEn: 'Federal EIN Application for Non-US Residents | QABS',
    seoDescriptionAr:
      'خدمة استخراج الرقم الضريبي الفيدرالي EIN للشركات الأمريكية المملوكة لغير المقيمين عبر نموذج SS-4 الرسمي لفتح الحسابات البنكية وربط Stripe.',
    seoDescriptionEn:
      'Fast, compliant IRS Form SS-4 filing and EIN retrieval for international founders without an SSN or ITIN.',
    detailedDescriptionAr: [
      'يُعد الرقم الضريبي الفيدرالي (Employer Identification Number - EIN) بمثابة الهوية الضريبية والمالية الرسمية لشركتك الأمريكية لدى مصلحة الضرائب الفيدرالية (IRS).',
      'يتعذر على المؤسسين خارج الولايات المتحدة التقديم عبر البوابة الإلكترونية الفورية لـ IRS لعدم امتلاكهم رقم ضمان اجتماعي (SSN). تتولى قبس إعداد نموذج SS-4 بدقة، والتواصل المباشر مع قسم الشركات الدولية في IRS حتى صدور الخطاب الرسمي.'
    ],
    detailedDescriptionEn: [
      'The Employer Identification Number (EIN) serves as your US company’s federal tax identity, functioning like a national business ID for banking, taxes, and compliance.',
      'Because non-US residents without an SSN or ITIN cannot use the IRS online portal, QABS prepares IRS Form SS-4 accurately and coordinates directly with the IRS International desk until your official EIN notice is issued.'
    ],
    deliveryTimeAr: '4 – 10 أيام عمل لغير المقيمين',
    deliveryTimeEn: '4 – 10 business days for non-SSN founders',
    startingPriceUsd: 70,
    pricingNoteAr: 'رسوم الخدمة المستقلة — ومشمولة تلقائياً في الباقة المتكاملة',
    pricingNoteEn: 'Standalone service fee — included automatically in Complete package',
    features: [
      {
        titleAr: 'لا يتطلب رقم SSN أو ITIN',
        titleEn: 'No SSN or ITIN Required',
        descriptionAr: 'إجراءات مخصصة بالكامل لملاك الشركات الدوليين من خارج الولايات المتحدة.',
        descriptionEn: 'Specialized filing workflow designed specifically for international founders.'
      },
      {
        titleAr: 'إعداد احترافي لنموذج SS-4',
        titleEn: 'Accurate Form SS-4 Preparation',
        descriptionAr: 'صياغة قانونية خالية من الأخطاء التي تتسبب برفض أو تأخير ملفات IRS.',
        descriptionEn: 'Error-free preparation preventing common IRS rejections or multi-week delays.'
      },
      {
        titleAr: 'مؤهل لـ Mercury و Stripe و Amazon',
        titleEn: 'Required for Banking & Stripe',
        descriptionAr: 'المتطلب الأساسي لفتح حسابات البنوك الأمريكية وتفعيل بوابات الدفع.',
        descriptionEn: 'Mandatory prerequisite for US fintech banking, Stripe, PayPal, and Amazon.'
      },
      {
        titleAr: 'متابعة مباشرة وتسليم PDF',
        titleEn: 'Direct Tracking & Digital Delivery',
        descriptionAr: 'رفع شهادة الرقم الضريبي الرسمية مباشرة في خزينة مستندات قبس.',
        descriptionEn: 'Official EIN confirmation letter uploaded directly to your QABS Vault.'
      }
    ],
    benefitsAr: [
      'إمكانية فتح الحساب البنكي التجاري الأمريكي للشركة.',
      'تعبئة نماذج W-9 / W-8BEN-E للمنصات والشركات الأمريكية.',
      'توظيف متعاقدين وموظفين وإصدار فواتير نظامية.',
      'تجنب الاستقطاع الضريبي التلقائي بنسبة 30% في بعض الحالات التجارية.'
    ],
    benefitsEn: [
      'Unlock eligibility for US business bank accounts (Mercury, Relay, Wise).',
      'Complete vendor and marketplace tax forms cleanly.',
      'Hire contractors and issue formal US corporate invoices.',
      'Prevent improper tax withholding across US B2B partners.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'تزويدنا بعقد التأسيس',
        titleEn: 'Provide Articles of Organization',
        descriptionAr: 'ارفع نسخة شهادة التأسيس واسم المدير المسؤول (Responsible Party).',
        descriptionEn: 'Upload your certified state formation document and designate the Responsible Party.',
        durationAr: '5 دقائق',
        durationEn: '5 mins'
      },
      {
        stepNumber: '02',
        titleAr: 'إعداد وتوقيع نموذج SS-4',
        titleEn: 'Prepare & Sign Form SS-4',
        descriptionAr: 'نقوم بتعبئة النموذج الفيدرالي وإرساله لك للتوقيع الإلكتروني المعتمد.',
        descriptionEn: 'We populate IRS Form SS-4 and send it for your quick digital signature.',
        durationAr: 'خلال 24 ساعة',
        durationEn: 'Within 24h'
      },
      {
        stepNumber: '03',
        titleAr: 'الإيداع لدى قسم IRS الدولي',
        titleEn: 'IRS International Submission',
        descriptionAr: 'إرسال الطلب للقناة المعتمدة ومتابعة استخراج الرقم الضريبي.',
        descriptionEn: 'Submission to the IRS international unit with active status follow-up.',
        durationAr: '4 – 10 أيام عمل',
        durationEn: '4 – 10 business days'
      },
      {
        stepNumber: '04',
        titleAr: 'استلام الخطاب الرسمي',
        titleEn: 'Official Letter Delivery',
        descriptionAr: 'تسليم خطاب CP575 / 147C بصيغة PDF جاهز للبنوك وبوابات الدفع.',
        descriptionEn: 'Digital delivery of your official EIN confirmation notice ready for verification.',
        durationAr: 'فوري عند الإصدار',
        durationEn: 'Instant upon issuance'
      }
    ],
    packages: [
      {
        id: 'ein_standard',
        nameAr: 'استخراج EIN القياسي',
        nameEn: 'Standard EIN Filing',
        priceUsd: 70,
        billingNoteAr: 'دفعة واحدة لشركة قائمة',
        billingNoteEn: 'One-time fee for existing LLC/Corp',
        descriptionAr: 'إعداد نموذج SS-4 وإيداعه لدى IRS ومتابعة صدور الرقم الضريبي.',
        descriptionEn: 'Complete Form SS-4 preparation, submission, and IRS follow-up.',
        recommended: true,
        featuresAr: [
          'إعداد ومراجعة نموذج IRS SS-4',
          'تقديم الطلب لقسم غير المقيمين',
          'نسخة PDF أصلية للخطاب الرسمي',
          'مراجعة جاهزية التقديم البنكي'
        ],
        featuresEn: [
          'IRS Form SS-4 preparation & audit',
          'Non-resident international filing',
          'Official PDF EIN confirmation letter',
          'Banking verification readiness check'
        ]
      },
      {
        id: 'ein_express',
        nameAr: 'خدمة EIN السريعة + 147C',
        nameEn: 'Priority EIN + 147C Verification',
        priceUsd: 119,
        billingNoteAr: 'أولوية قصوى + خطاب تحقق إضافي',
        billingNoteEn: 'Priority queue + verification letter',
        descriptionAr: 'مخصصة للشركات التي تحتاج خطاب التحقق 147C أو تصحيح بيانات سابقة لدى IRS.',
        descriptionEn: 'Ideal for urgent applications, lost EIN retrieval (147C), or IRS record updates.',
        featuresAr: [
          'أولوية تنفيذ ومتابعة يومية',
          'استخراج خطاب 147C عند الحاجة',
          'تحديث اسم أو عنوان الشركة لدى IRS',
          'مرافقة فنية عند ربط Stripe'
        ],
        featuresEn: [
          'Priority handling & daily follow-up',
          'IRS Letter 147C retrieval if needed',
          'IRS entity address/name update guidance',
          'Technical support for Stripe EIN verification'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'كم المدة الفعلية لصدور الرقم الضريبي EIN؟',
        questionEn: 'How long does it actually take to get an EIN?',
        answerAr: 'في الظروف القياسية لغير المقيمين تستغرق المعالجة ما بين 4 إلى 10 أيام عمل حسب ضغط مصلحة الضرائب الأمريكية.',
        answerEn: 'Standard non-resident processing takes 4 to 10 business days depending on IRS processing volume.'
      },
      {
        questionAr: 'هل ينتهي مفعول الرقم الضريبي EIN؟',
        questionEn: 'Does an EIN expire?',
        answerAr: 'لا، الرقم الضريبي الفيدرالي دائم ولا ينتهي مفعوله طالما الشركة قائمة ولا يتطلب رسوم تجديد سنوية.',
        answerEn: 'No, an EIN is permanent for the life of your entity and has zero annual renewal fees.'
      }
    ],
    formFields: [
      {
        name: 'existingCompanyName',
        labelAr: 'الاسم القانوني للشركة الأمريكية',
        labelEn: 'Registered US Company Name',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: Qabs Commerce LLC',
        placeholderEn: 'e.g. Qabs Commerce LLC'
      },
      {
        name: 'stateOfFormation',
        labelAr: 'ولاية التأسيس',
        labelEn: 'State of Formation',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: Wyoming',
        placeholderEn: 'e.g. Wyoming'
      }
    ],
    relatedPaths: ['/services/company-formation', '/services/us-llc', '/services/business-accounts', '/services/payment-gateways']
  },
  {
    slug: 'registered-agent',
    path: '/services/registered-agent',
    category: 'formation',
    categoryLabelAr: 'تأسيس الشركات',
    categoryLabelEn: 'Company Formation',
    titleAr: 'الوكيل المسجل والعنوان القانوني الأمريكي (Registered Agent)',
    titleEn: 'US Registered Agent & Official Business Address',
    subtitleAr:
      'تمثيل قانوني معتمد وعنوان فعلي داخل ولاية التأسيس لاستلام المراسلات الحكومية والإشعارات القضائية ومسحها ضوئياً وإرسالها إليك فوراً.',
    subtitleEn:
      'Authorized statutory representation and physical street address in your state of formation with instant mail scanning and compliance alerts.',
    seoTitleAr: 'خدمة الوكيل المسجل الأمريكي Registered Agent | قبس',
    seoTitleEn: 'US Registered Agent & Street Address Service | QABS',
    seoDescriptionAr:
      'احصل على وكيل مسجل رسمي وعنوان فعلي لشركتك الأمريكية في كافة الولايات الخمسين مع مسح ضوئي فوري للبريد الحكومي وتنبيهات الامتثال.',
    seoDescriptionEn:
      'Compliant Registered Agent representation in all 50 US states with same-day mail scanning and privacy protection.',
    detailedDescriptionAr: [
      'يشترط القانون الأمريكي في جميع الولايات الخمسين وجود وكيل مسجل (Registered Agent) يمتلك عنواناً فعلياً داخل الولاية ويتواجد خلال ساعات العمل الرسمية لاستلام الإشعارات الحكومية والقانونية نيابة عن الشركة.',
      'تقدم منصة قبس خدمة الوكيل المسجل المعتمد في كافة الولايات، مع حماية خصوصية عنوانك الشخصي، وأرشفة جميع المراسلات الواردة ضوئياً داخل لوحة التحكم الخاصة بك.'
    ],
    detailedDescriptionEn: [
      'Every US state legally requires an LLC or Corporation to maintain a Registered Agent with a physical street address in the state of formation during standard business hours.',
      'QABS provides reliable Registered Agent coverage across all 50 states, keeping your personal address off public registries while scanning and forwarding official state notices directly to your dashboard.'
    ],
    deliveryTimeAr: 'تفعيل فوري خلال 24 ساعة',
    deliveryTimeEn: 'Activated within 24 hours',
    startingPriceUsd: 99,
    pricingNoteAr: 'اشتراك سنوي شامل مسح البريد الرسمي والإشعارات',
    pricingNoteEn: 'Annual subscription including official mail scanning & alerts',
    features: [
      {
        titleAr: 'تغطية جميع الولايات الـ 50',
        titleEn: 'All 50 States Coverage',
        descriptionAr: 'عناوين فعلية معتمدة في وايومنغ، ديلاوير، نيو مكسيكو، تكساس وغيرها.',
        descriptionEn: 'Verified physical addresses in Wyoming, Delaware, New Mexico, Texas, and all 50 states.'
      },
      {
        titleAr: 'حماية خصوصية الملاك',
        titleEn: 'Founder Privacy Shield',
        descriptionAr: 'إظهار عنوان الوكيل المسجل في السجلات العامة بدلاً من عنوانك الخاص.',
        descriptionEn: 'Keep your personal home address private from public corporate records.'
      },
      {
        titleAr: 'مسح ضوئي فوري للبريد',
        titleEn: 'Same-Day Mail Scanning',
        descriptionAr: 'رفع أي خطاب حكومي أو إشعار ولاية بصيغة PDF إلى حسابك فور استلامه.',
        descriptionEn: 'Official state notices scanned and uploaded to your Vault on the same day.'
      },
      {
        titleAr: 'نقل مجاني من وكيل سابق',
        titleEn: 'Seamless Agent Change Filing',
        descriptionAr: 'إمكانية تعيين قبس كوكيل مسجل جديد لشركة قائمة بكل سهولة.',
        descriptionEn: 'Easy Change of Agent filing if you are switching from another provider.'
      }
    ],
    benefitsAr: [
      'الحفاظ على وضع الشركة القانوني (Good Standing) وتجنب الحل الإداري.',
      'عدم تفويت أي إشعارات ضريبية أو تقارير سنوية صادرة عن سكرتير الولاية.',
      'إمكانية استخدام العنوان القانوني في نماذج التأسيس وبعض متطلبات الامتثال.',
      'تجديد سلس تلقائي مع تنبيهات مسبقة قبل 30 يوماً من انتهاء السنة.'
    ],
    benefitsEn: [
      'Maintain continuous Good Standing and prevent administrative dissolution.',
      'Never miss critical tax notices or Secretary of State compliance deadlines.',
      'Protect founder privacy across public corporate lookups.',
      'Predictable annual billing with 30-day advance renewal alerts.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'تحديد الولاية ونوع الطلب',
        titleEn: 'Select State & Service Type',
        descriptionAr: 'اختر ما إذا كان الوكيل لشركة جديدة أو نقل وكيل لشركة قائمة.',
        descriptionEn: 'Indicate whether this is for a new formation or a Change of Agent transfer.',
        durationAr: '5 دقائق',
        durationEn: '5 mins'
      },
      {
        stepNumber: '02',
        titleAr: 'إصدار بيانات العنوان والتفويض',
        titleEn: 'Address Assignment & Authorization',
        descriptionAr: 'تسليم تفاصيل العنوان المعتمد داخل الولاية وإعداد نموذج تعيين الوكيل.',
        descriptionEn: 'Receive your assigned in-state address and sign the Change of Agent consent if transferring.',
        durationAr: '24 ساعة',
        durationEn: '24 hours'
      },
      {
        stepNumber: '03',
        titleAr: 'التفعيل والربط مع الخزينة',
        titleEn: 'Activation & Vault Sync',
        descriptionAr: 'تفعيل لوحة استلام المراسلات وتنبيهات التجديد السنوية تلقائياً.',
        descriptionEn: 'Activate digital mail forwarding and automated annual compliance reminders.',
        durationAr: 'فوري بعد الاعتماد',
        durationEn: 'Immediate'
      }
    ],
    packages: [
      {
        id: 'ra_annual',
        nameAr: 'الوكيل المسجل السنوي',
        nameEn: 'Annual Registered Agent',
        priceUsd: 99,
        billingNoteAr: 'سنوياً لكل ولاية',
        billingNoteEn: 'Per year / per state',
        descriptionAr: 'تمثيل قانوني معتمد مع مسح البريد الحكومي وتنبيهات الامتثال.',
        descriptionEn: 'Full statutory representation with government mail scanning and compliance alerts.',
        recommended: true,
        featuresAr: [
          'عنوان فعلي معتمد لدى سكرتير الولاية',
          'استلام الإشعارات الحكومية والقضائية',
          'مسح ضوئي وإرسال فوري عبر المنصة والبريد',
          'تنبيهات مواعيد التقرير السنوي'
        ],
        featuresEn: [
          'Physical street address registered with state',
          'Official Service of Process acceptance',
          'Same-day PDF scanning & dashboard upload',
          'Annual report deadline reminders'
        ]
      },
      {
        id: 'ra_plus_mail',
        nameAr: 'الوكيل المسجل + بريد الأعمال',
        nameEn: 'Registered Agent + Mail Forwarding',
        priceUsd: 169,
        billingNoteAr: 'سنوياً شامل إعادة توجيه البريد البنكي',
        billingNoteEn: 'Per year incl. commercial mail scans',
        descriptionAr: 'يشمل استلام المراسلات البنكية وبطاقات البنوك وخطابات IRS بالإضافة للوكيل.',
        descriptionEn: 'Includes Registered Agent plus commercial mail scanning for bank cards and IRS letters.',
        featuresAr: [
          'جميع مزايا الوكيل المسجل السنوي',
          'استلام خطابات البنوك و Stripe و IRS',
          'مسح ضوئي غير محدود للرسائل التجارية',
          'أرشفة رقمية منظمة طوال العام'
        ],
        featuresEn: [
          'All Annual Registered Agent features',
          'Accepts bank cards, IRS, and Stripe letters',
          'Unlimited commercial mail PDF scans',
          'Year-round organized digital mail archive'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل يختلف عنوان الوكيل المسجل عن عنوان مكتب العمل التجاري؟',
        questionEn: 'Is a Registered Agent address different from a commercial mail address?',
        answerAr: 'الوكيل المسجل مخصص لاستلام الإشعارات الرسمية والقانونية من الولاية، أما باقة بريد الأعمال فتضيف إمكانية استلام بطاقات البنوك والرسائل التجارية.',
        answerEn: 'A standard Registered Agent receives statutory state notices, while our Mail Forwarding tier also accepts commercial mail and bank cards.'
      },
      {
        questionAr: 'هل يمكنني نقل شركتي الحالية لوكيل قبس المسجل؟',
        questionEn: 'Can I transfer my existing US LLC to QABS Registered Agent?',
        answerAr: 'نعم، نتولى تقديم طلب تغيير الوكيل المسجل (Change of Registered Agent) لدى سكرتير الولاية دون أي تعقيدات.',
        answerEn: 'Yes, we handle the official Change of Registered Agent filing with your Secretary of State.'
      }
    ],
    formFields: [
      {
        name: 'targetState',
        labelAr: 'الولاية المطلوبة',
        labelEn: 'State',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: Wyoming أو Delaware',
        placeholderEn: 'e.g. Wyoming or Delaware'
      },
      {
        name: 'requestMode',
        labelAr: 'حالة الشركة',
        labelEn: 'Company Status',
        type: 'select',
        required: true,
        options: [
          { value: 'new', labelAr: 'شركة جديدة قيد التأسيس', labelEn: 'New Company Formation' },
          { value: 'transfer', labelAr: 'شركة قائمة (نقل وكيل)', labelEn: 'Existing Company (Transfer Agent)' }
        ]
      }
    ],
    relatedPaths: ['/services/company-formation', '/services/compliance', '/services/company-renewal', '/services/us-llc']
  },
  {
    slug: 'us-llc',
    path: '/services/us-llc',
    category: 'formation',
    categoryLabelAr: 'تأسيس الشركات',
    categoryLabelEn: 'Company Formation',
    titleAr: 'تأسيس شركة ذات مسؤولية محدودة أمريكية (US LLC)',
    titleEn: 'US Limited Liability Company (US LLC) Formation',
    subtitleAr:
      'الكيان الأمثل للتجارة الإلكترونية، الوكالات الرقمية، والمتاجر العالمية — شفافية كاملة في أسعار جميع الولايات الخمسين ومزايا ضريبية مرنة.',
    subtitleEn:
      'The optimal legal structure for e-commerce brands, digital agencies, and SaaS founders — transparent 50-state pricing with pass-through flexibility.',
    seoTitleAr: 'تأسيس شركة US LLC أمريكية لغير المقيمين | أسعار الـ 50 ولاية — قبس',
    seoTitleEn: 'Form a US LLC for Non-Residents | All 50 States Pricing — QABS',
    seoDescriptionAr:
      'تأسيس شركة US LLC في وايومنغ، ديلاوير، نيو مكسيكو وجميع الولايات الخمسين مع مقارنة الرسوم الحكومية واستخراج EIN وفتح الحسابات البنكية.',
    seoDescriptionEn:
      'Incorporate your US LLC in Wyoming, Delaware, New Mexico, or any of the 50 states with transparent filing fees and turnkey compliance.',
    detailedDescriptionAr: [
      'الشركة ذات المسؤولية المحدودة الأمريكية (LLC) هي الهيكل القانوني الأكثر مرونة وانتشاراً لرواد الأعمال الدوليين؛ إذ تجمع بين حماية الأصول الشخصية وسهولة الإدارة دون تعقيدات مجالس الإدارة.',
      'تتيح لك قبس المقارنة الدقيقة بين جميع الولايات الأمريكية الخمسين (مثل وايومنغ ذات الخصوصية العالية و 0% ضريبة ولاية، وديلاوير المعيارية، ونيو مكسيكو بدون تقرير سنوي) واختيار الأنسب لنشاطك وميزانيتك.'
    ],
    detailedDescriptionEn: [
      'A US Limited Liability Company (LLC) is the most flexible, cost-effective entity for international founders, combining personal asset protection with streamlined governance.',
      'QABS lets you compare filing fees and annual costs across all 50 US states—from privacy-focused zero-tax Wyoming to $0-annual-report New Mexico—and launch your LLC in days.'
    ],
    deliveryTimeAr: '1 – 3 أيام عمل في معظم الولايات',
    deliveryTimeEn: '1 – 3 business days in most states',
    startingPriceUsd: 339,
    pricingNoteAr: 'تشمل رسوم الخدمة + الرسوم الحكومية (تبدأ من $339 شاملة كنتاكي أو $349 نيو مكسيكو)',
    pricingNoteEn: 'Total package including state filing fees (starts at $339 KY / $349 NM)',
    features: [
      {
        titleAr: 'تغطية شاملة لجميع الولايات الـ 50',
        titleEn: 'All 50 US States Supported',
        descriptionAr: 'رسوم حكومية واضحة بدون تكاليف مخفية من وايومنغ حتى نيويورك.',
        descriptionEn: 'Upfront state filing fees across all 50 states with zero hidden charges.'
      },
      {
        titleAr: 'ضرائب مرنة لغير المقيمين',
        titleEn: 'Pass-Through Tax Efficiency',
        descriptionAr: 'هيكل ضريبي مرن مع إعفاء ضريبة الولاية في ولايات مثل وايومنغ.',
        descriptionEn: 'Flexible pass-through taxation with 0% state income tax in top states.'
      },
      {
        titleAr: 'مناسب لـ Shopify و Stripe و Amazon',
        titleEn: 'Built for Commerce Platforms',
        descriptionAr: 'جاهزية كاملة لتوثيق حسابات التجار على بوابات الدفع العالمية.',
        descriptionEn: 'Structured to pass merchant onboarding on Stripe, PayPal, and Amazon.'
      },
      {
        titleAr: 'متابعة امتثال سنوية تلقائية',
        titleEn: 'Automated Compliance Calendar',
        descriptionAr: 'تذكير آلي بمواعيد التقرير السنوي وإقرار 5472 السنوي للشركات المملوكة أجنبياً.',
        descriptionEn: 'Automated alerts for state annual reports and Form 5472 compliance.'
      }
    ],
    benefitsAr: [
      'حماية قانونية كاملة لأموالك الشخصية عن التزامات الشركة.',
      'تأسيس سريع خلال أيام مع استلام رقم الملف الحكومي File Number.',
      'توسيع نشاطك التجاري بفتح حسابات بنكية أمريكية بالدولار.',
      'مرونة إضافة أو تعديل الشركاء عبر اتفاقية التشغيل.'
    ],
    benefitsEn: [
      'Full liability shield separating personal wealth from business risk.',
      'Fast state filing with verified Secretary of State File Number.',
      'Unlock USD commercial banking and global vendor payouts.',
      'Simple governance without rigid corporate board formalities.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'اختيار الولاية المناسبة',
        titleEn: 'Pick Your US State',
        descriptionAr: 'قارن بين وايومنغ وديلاوير ونيو مكسيكو أو أي من الولايات الـ 50 واختر الأنسب.',
        descriptionEn: 'Compare Wyoming, Delaware, New Mexico, or any of the 50 states.',
        durationAr: '5 دقائق',
        durationEn: '5 mins'
      },
      {
        stepNumber: '02',
        titleAr: 'تقديم بيانات المالك والاسم',
        titleEn: 'Submit Owner & Name Details',
        descriptionAr: 'أدخل اسم الـ LLC المقترح وبيانات الأعضاء وارفع صورة الجواز.',
        descriptionEn: 'Provide your desired LLC name, member structure, and passport verification.',
        durationAr: '10 دقائق',
        durationEn: '10 mins'
      },
      {
        stepNumber: '03',
        titleAr: 'التأسيس وإصدار الوثائق',
        titleEn: 'State Filing & EIN Issuance',
        descriptionAr: 'تودع قبس المستندات رسمياً وتستخرج شهادة التأسيس والـ EIN واتفاقية التشغيل.',
        descriptionEn: 'We complete state filing, issue your Operating Agreement, and obtain your IRS EIN.',
        durationAr: '3 – 10 أيام عمل',
        durationEn: '3 – 10 business days'
      }
    ],
    packages: [
      {
        id: 'llc_wy',
        nameAr: 'باقة وايومنغ LLC المتكاملة',
        nameEn: 'Wyoming LLC Complete',
        priceUsd: 399,
        billingNoteAr: 'شاملة $100 رسوم ولاية وايومنغ',
        billingNoteEn: 'Includes $100 WY state fee',
        descriptionAr: 'الخيار الأول للتجارة الإلكترونية: سرية تامة، 0% ضريبة ولاية، تأسيس + EIN + وكيل.',
        descriptionEn: '#1 choice for e-commerce: privacy, 0% state tax, formation + EIN + Registered Agent.',
        recommended: true,
        featuresAr: [
          'تأسيس LLC في ولاية وايومنغ ($100 رسوم حكومية مشمولة)',
          'استخراج الرقم الضريبي EIN من IRS',
          'اتفاقية التشغيل + قرار البنك',
          'وكيل مسجل وعنوان رسمي لمدة شهرين مجاناً'
        ],
        featuresEn: [
          'Wyoming LLC formation ($100 state fee included)',
          'Federal IRS EIN Tax ID',
          'Operating Agreement & Banking Resolution',
          'Registered Agent & street address (2 months free)'
        ]
      },
      {
        id: 'llc_nm',
        nameAr: 'باقة نيو مكسيكو LLC الاقتصادية',
        nameEn: 'New Mexico LLC Value',
        priceUsd: 349,
        billingNoteAr: 'شاملة $50 رسوم ولاية نيو مكسيكو',
        billingNoteEn: 'Includes $50 NM state fee',
        descriptionAr: 'أقل تكلفة سنوية ($0 تقرير سنوي) مع سرية ملاك تامة وتأسيس متكامل.',
        descriptionEn: 'Lowest maintenance ($0 annual report) with owner privacy and full formation.',
        featuresAr: [
          'تأسيس LLC في نيو مكسيكو ($50 رسوم حكومية مشمولة)',
          'لا يوجد تقرير سنوي إلزامي للولاية ($0)',
          'استخراج EIN واتفاقية التشغيل',
          'وكيل مسجل مجاني لشهرين'
        ],
        featuresEn: [
          'New Mexico LLC formation ($50 state fee included)',
          '$0 state annual report requirement',
          'IRS EIN & Operating Agreement included',
          '2 months free Registered Agent'
        ]
      },
      {
        id: 'llc_de',
        nameAr: 'باقة ديلاوير LLC الاستثمارية',
        nameEn: 'Delaware LLC Standard',
        priceUsd: 389,
        billingNoteAr: 'شاملة $90 رسوم ولاية ديلاوير',
        billingNoteEn: 'Includes $90 DE state fee',
        descriptionAr: 'المعيار القانوني المفضل للشركات التقنية والمستثمرين والبنوك الدولية.',
        descriptionEn: 'Premier corporate jurisdiction trusted by institutional partners and banks.',
        featuresAr: [
          'تأسيس LLC في ديلاوير ($90 رسوم حكومية مشمولة)',
          'الاستفادة من محاكم Chancery المتخصصة',
          'استخراج EIN واتفاقية التشغيل',
          'وكيل مسجل في ويلمنجتون ديلاوير'
        ],
        featuresEn: [
          'Delaware LLC formation ($90 state fee included)',
          'Access to Delaware Court of Chancery framework',
          'IRS EIN & Operating Agreement included',
          'Registered Agent in Wilmington, DE'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'ما هي أفضل ولاية أمريكية لتأسيس شركة تجارة إلكترونية؟',
        questionEn: 'Which US state is best for an e-commerce LLC?',
        answerAr: 'ولاية وايومنغ (Wyoming) هي الأفضل لغالبية المتاجر الإلكترونية بسبب 0% ضريبة دخل، وسرية أسماء الملاك، ورسوم تجديد سنوي منخفضة ($60 فقط).',
        answerEn: 'Wyoming is the top choice for most e-commerce founders thanks to 0% state income tax, owner privacy, and a low $60 annual report fee.'
      },
      {
        questionAr: 'هل يمكن تأسيس LLC بشريك واحد (Single-Member) أم أكثر؟',
        questionEn: 'Can I form a Single-Member or Multi-Member LLC?',
        answerAr: 'يدعم نظام قبس تأسيس شركة بمالك واحد (Single-Member LLC) أو بعدة شركاء (Multi-Member LLC) مع توثيق نسب الحصص في اتفاقية التشغيل.',
        answerEn: 'QABS supports both Single-Member and Multi-Member LLCs, documenting ownership percentages clearly in your Operating Agreement.'
      }
    ],
    formFields: [
      {
        name: 'preferredState',
        labelAr: 'الولاية المختارة (من الـ 50 ولاية)',
        labelEn: 'Preferred US State',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: Wyoming (WY)',
        placeholderEn: 'e.g. Wyoming (WY)'
      },
      {
        name: 'membersCount',
        labelAr: 'عدد الملاك / الشركاء',
        labelEn: 'Number of Members',
        type: 'select',
        required: true,
        options: [
          { value: '1', labelAr: 'مالك واحد (Single-Member LLC)', labelEn: '1 Owner (Single-Member LLC)' },
          { value: '2+', labelAr: 'أكثر من شريك (Multi-Member LLC)', labelEn: '2+ Owners (Multi-Member LLC)' }
        ]
      }
    ],
    relatedPaths: ['/services/company-formation', '/services/ein', '/services/annual-report', '/services/compliance']
  }
];
