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
        descriptionAr: 'يمكن إعداد مسودة اتفاقية تشغيل أو قرار بنكي إذا شملهما نطاق الخدمة؛ يراجع العميل ومستشاره المختص المسودة قبل التوقيع أو الاعتماد.',
        descriptionEn: 'An Operating Agreement or banking-resolution draft may be prepared if included in the agreed scope; the client and qualified adviser must review it before signing or adoption.'
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
      'قد يساعد وجود كيان مسجل في التقديم لبعض الأسواق والمنصات، مع خضوع القبول لشروط كل منصة ومزود.',
      'تُعرض معلومات الطلب عبر القنوات المتاحة؛ تكامل لوحة العمل والوثائق يعتمد على تفعيل الخدمة وربطها فعلياً.'
    ],
    benefitsEn: [
      'An entity may provide legal separation between business and personal assets when properly maintained; this is not absolute protection.',
      'Eligibility to apply for global payment processors like Stripe and PayPal.',
      'A registered entity may support applications to some marketplaces and providers, subject to each platform’s independent requirements and approval.',
      'Request information is shown through available channels; unified workspace and document features depend on verified service integration.'
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
        descriptionAr: 'تُراجع البيانات الأولية ومتطلبات الاسم؛ التحقق الرسمي من توفر الاسم وقبول الطلب يعود إلى السجل المختص.',
        descriptionEn: 'Initial details and naming requirements are reviewed; the relevant registry performs the official name-availability and filing checks.',
        durationAr: 'بعد اكتمال المراجعة',
        durationEn: 'After review is completed'
      },
      {
        stepNumber: '03',
        titleAr: 'الإيداع الرسمي وإصدار الشهادة',
        titleEn: 'Official State Filing & Issuance',
        descriptionAr: 'يُنسّق الإيداع بعد قبول الطلب وتأكيد نطاق التنفيذ وتوفر جهة الإيداع؛ الجهة الحكومية وحدها تصدر المستندات الرسمية وتحدد وقت المعالجة.',
        descriptionEn: 'Filing coordination occurs only after request acceptance, scope confirmation, and filing-service availability; the government registry alone issues official records and controls processing time.',
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
          'مراجعة أولية لاسم الشركة المقترح',
          'تجهيز مستندات التقديم بعد قبول نطاق الخدمة',
          'مراجعة متطلبات الوكيل المسجل وتأكيد توفره وسعره',
          'تسليم المخرجات عبر القناة المتاحة بعد اكتمال الخدمة'
        ],
        featuresEn: [
          'Initial review of the proposed company name',
          'Prepare filing documents after service-scope acceptance',
          'Review registered-agent requirements and confirm availability and price',
          'Deliver outputs through the available channel after completion'
        ]
      },
      {
        id: 'cf_complete',
        nameAr: 'الباقة المتكاملة (Complete)',
        nameEn: 'Complete Formation',
        priceUsd: 299,
        billingNoteAr: '+ رسوم الولاية الحكومية',
        billingNoteEn: '+ statutory state fee',
        descriptionAr: 'خيار إرشادي قد يشمل تنسيق التأسيس ومساعدة طلب EIN ومسودة اتفاقية تشغيل ومتطلبات الوكيل؛ يخضع كل عنصر للأهلية والتوفر والتأكيد.',
        descriptionEn: 'An indicative option that may include formation coordination, EIN application assistance, an Operating Agreement draft, and agent requirements; each item is subject to eligibility, availability, and confirmation.',
        recommended: true,
        featuresAr: [
          'تنسيق طلب التأسيس بعد قبول نطاق الخدمة',
          'مساعدة في إعداد طلب EIN وفق أهلية ومتطلبات IRS دون ضمان الإصدار',
          'مسودة اتفاقية تشغيل إذا شملها العرض',
          'التحقق من متطلبات الوكيل المسجل وتكلفته قبل الطلب',
          'مسودة قرار بنكي إذا شملها العرض'
        ],
        featuresEn: [
          'Coordinate the formation request after scope acceptance',
          'Assist with EIN application preparation subject to IRS eligibility; issuance is not guaranteed',
          'Operating Agreement draft if included in the quote',
          'Confirm registered-agent requirements and cost before ordering',
          'Draft banking resolution if included in the quote'
        ]
      },
      {
        id: 'cf_turnkey',
        nameAr: 'باقة الانطلاقة الشاملة (Turnkey)',
        nameEn: 'Turnkey Executive',
        priceUsd: 599,
        billingNoteAr: 'تشمل أولوية التنفيذ وسنة وكيل',
        billingNoteEn: 'Includes priority filing & 1-yr agent',
        descriptionAr: 'خيار مخصص يخضع لعرض سعر منفصل؛ لا تُعد أولوية المعالجة أو سنة الوكيل أو تجهيز الحسابات أو قبول بوابات الدفع مضمونة قبل التأكيد الكتابي.',
        descriptionEn: 'A custom option requiring a separate quote; priority processing, a one-year agent, account preparation, and payment-provider acceptance are not guaranteed until confirmed in writing.',
        featuresAr: [
          'مراجعة نطاق الخدمات الإضافية قبل التسعير',
          'التحقق من توفر الوكيل ومدته وتكلفته',
          'تحديد ما إذا كانت متابعة الإيداع متاحة',
          'تنظيم مستندات التقديم للحسابات عند انطباق الأهلية',
          'تحديد الدعم اللاحق كتابياً ضمن العرض'
        ],
        featuresEn: [
          'Review and quote additional service scope',
          'Confirm agent availability, term, and cost',
          'Confirm whether filing coordination is available',
          'Organize provider application documents where eligible',
          'Define post-formation support in writing'
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
        answerAr: 'قد تشمل الباقة مساعدة في إعداد طلب EIN إذا انطبقت متطلبات IRS وتم تأكيد ذلك في العرض؛ قرار الإصدار يعود إلى IRS ولا نضمنه.',
        answerEn: 'A package may include EIN application assistance where IRS requirements are met and the scope is confirmed in writing; the IRS decides issuance and QABS does not guarantee it.'
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
    titleAr: 'المساعدة في طلب الرقم الضريبي الفيدرالي الأمريكي (EIN)',
    titleEn: 'Federal EIN Application Assistance',
    subtitleAr:
      'نساعد في مراجعة أهلية طلب رقم EIN وتجهيز نموذج SS-4 والمستندات المطلوبة عند انطباق متطلبات IRS؛ قرار الإصدار ووقت المعالجة يعودان إلى المصلحة.',
    subtitleEn:
      'We help review EIN eligibility and prepare Form SS-4 and supporting information where IRS requirements are met; the IRS controls issuance and processing time.',
    seoTitleAr: 'استخراج الرقم الضريبي الأمريكي EIN لغير المقيمين | قبس',
    seoTitleEn: 'Federal EIN Application for Non-US Residents | QABS',
    seoDescriptionAr:
      'مساعدة في إعداد طلب EIN للشركات الأمريكية وفق أهلية المتقدم ومتطلبات IRS، دون ضمان الإصدار أو فتح حساب بنكي أو قبول بوابة دفع.',
    seoDescriptionEn:
      'EIN application preparation support for eligible international founders, subject to IRS requirements and processing.',
    detailedDescriptionAr: [
      'يُعد الرقم الضريبي الفيدرالي (Employer Identification Number - EIN) بمثابة الهوية الضريبية والمالية الرسمية لشركتك الأمريكية لدى مصلحة الضرائب الفيدرالية (IRS).',
      'قد تختلف قنوات التقديم ومتطلبات SSN أو ITIN بحسب حالة مقدم الطلب. تساعد قبس في إعداد نموذج SS-4 ومراجعة المستندات وتنسيق التقديم عبر قناة متاحة بعد قبول الطلب؛ لا تتحكم قبس في قرار IRS أو مدة المعالجة.'
    ],
    detailedDescriptionEn: [
      'The Employer Identification Number (EIN) serves as your US company’s federal tax identity, functioning like a national business ID for banking, taxes, and compliance.',
      'Application channels and SSN or ITIN requirements vary by applicant. QABS can assist with Form SS-4 and document preparation and coordinate submission through an available channel after request acceptance; the IRS controls the decision and processing time.'
    ],
    deliveryTimeAr: 'المدة غير مضمونة وتخضع لمعالجة IRS واكتمال الطلب والقناة المتاحة',
    deliveryTimeEn: 'Timing is not guaranteed and depends on IRS processing, application completeness, and the available channel',
    startingPriceUsd: 70,
    pricingNoteAr: 'السعر إرشادي؛ تشمل الخدمة المساعدة في إعداد الطلب فقط عند تأكيد النطاق والأهلية، ولا تضمن إصدار EIN أو قبول مزود حسابات أو دفع.',
    pricingNoteEn: 'Indicative fee; scope is application-preparation assistance subject to eligibility and confirmation, with no guarantee of EIN issuance or provider approval.',
    features: [
      {
        titleAr: 'لا يتطلب رقم SSN أو ITIN',
        titleEn: 'No SSN or ITIN Required',
        descriptionAr: 'تُراجع متطلبات SSN أو ITIN وقناة التقديم وفق حالة مقدم الطلب وتعليمات IRS.',
        descriptionEn: 'SSN or ITIN requirements and application channels are reviewed against the applicant’s circumstances and IRS instructions.'
      },
      {
        titleAr: 'إعداد احترافي لنموذج SS-4',
        titleEn: 'Accurate Form SS-4 Preparation',
        descriptionAr: 'مساعدة في إعداد ومراجعة نموذج SS-4 والبيانات المقدمة؛ لا يمكن ضمان خلو الطلب من الملاحظات أو تأخر المعالجة.',
        descriptionEn: 'Assistance preparing and reviewing Form SS-4; comments, rejection, or processing delays cannot be ruled out.'
      },
      {
        titleAr: 'مؤهل لـ Mercury و Stripe و Amazon',
        titleEn: 'Required for Banking & Stripe',
        descriptionAr: 'قد يطلب بعض مزودي الحسابات والدفع رقم EIN؛ وجوده وحده لا يضمن أهلية الحساب أو الموافقة.',
        descriptionEn: 'Some account and payment providers may request an EIN; having one does not by itself establish eligibility or approval.'
      },
      {
        titleAr: 'متابعة مباشرة وتسليم PDF',
        titleEn: 'Direct Tracking & Digital Delivery',
        descriptionAr: 'تُسلّم نسخة المستند الرسمي بعد صدوره عبر قناة التسليم المتاحة إذا كانت مفعّلة.',
        descriptionEn: 'The official notice is handed over after issuance through the available delivery channel, if enabled.'
      }
    ],
    benefitsAr: [
      'قد يكون EIN أحد المستندات المطلوبة لدى بعض مزودي الحسابات؛ يطبق كل مزود شروطه وقراره المستقل.',
      'تعبئة نماذج W-9 / W-8BEN-E للمنصات والشركات الأمريكية.',
      'توظيف متعاقدين وموظفين وإصدار فواتير نظامية.',
      'تحديد النماذج والالتزامات الضريبية المناسبة يحتاج مراجعة مستقلة وفق حالة الشركة والمعاملة.'
    ],
    benefitsEn: [
      'An EIN may be one of the documents requested by some providers; each provider applies independent eligibility checks and decisions.',
      'Complete vendor and marketplace tax forms cleanly.',
      'Hire contractors and issue formal US corporate invoices.',
      'Tax forms and withholding treatment require separate review based on the entity and transaction.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'تزويدنا بعقد التأسيس',
        titleEn: 'Provide Articles of Organization',
        descriptionAr: 'تُراجع مستندات التأسيس وبيانات الشخص المسؤول وفق متطلبات IRS، عبر قناة آمنة عند الحاجة.',
        descriptionEn: 'Formation records and responsible-party details are reviewed against IRS requirements through an approved secure channel when needed.',
        durationAr: '5 دقائق',
        durationEn: '5 mins'
      },
      {
        stepNumber: '02',
        titleAr: 'إعداد وتوقيع نموذج SS-4',
        titleEn: 'Prepare & Sign Form SS-4',
        descriptionAr: 'تساعد قبس في إعداد نموذج SS-4 ومراجعته؛ تُحدد طريقة التوقيع والتقديم وفق القناة والمتطلبات المعمول بها.',
        descriptionEn: 'QABS can assist with Form SS-4 preparation and review; signing and submission methods depend on the applicable channel and requirements.',
        durationAr: 'خلال 24 ساعة',
        durationEn: 'Within 24h'
      },
      {
        stepNumber: '03',
        titleAr: 'الإيداع لدى قسم IRS الدولي',
        titleEn: 'IRS International Submission',
        descriptionAr: 'يُنسّق التقديم عبر قناة متاحة بعد قبول الطلب؛ تحدد IRS إجراءات المعالجة والرد.',
        descriptionEn: 'Submission is coordinated through an available channel after acceptance; the IRS determines processing and response.',
        durationAr: '4 – 10 أيام عمل',
        durationEn: '4 – 10 business days'
      },
      {
        stepNumber: '04',
        titleAr: 'استلام الخطاب الرسمي',
        titleEn: 'Official Letter Delivery',
        descriptionAr: 'تُسلّم نسخة CP575 أو 147C إذا أصدرتها IRS وكانت متاحة، ولا يعني ذلك قبول البنوك أو بوابات الدفع.',
        descriptionEn: 'A CP575 or 147C copy is handed over if issued by the IRS and available; this does not imply bank or payment-provider approval.',
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
        descriptionAr: 'مساعدة في إعداد نموذج SS-4 ومراجعة المستندات وتنسيق التقديم عند تأكيد الأهلية والتوفر.',
        descriptionEn: 'Assist with Form SS-4 and document review and coordinate submission subject to eligibility and availability.',
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
        descriptionAr: 'طلب مساعدة لمراجعة متطلبات خطاب 147C أو تحديث بيانات سابقة لدى IRS؛ توفر الإجراء ونتيجته يخضعان للمصلحة.',
        descriptionEn: 'Assistance reviewing a 147C request or prior IRS record update; availability and outcome are determined by the IRS.',
        featuresAr: [
          'تحديد نطاق المتابعة الممكنة قبل قبول العرض',
          'استخراج خطاب 147C عند الحاجة',
          'تحديث اسم أو عنوان الشركة لدى IRS',
          'مراجعة مستندات التقديم لمزود الدفع دون ضمان القبول أو الربط'
        ],
        featuresEn: [
          'Confirm the available follow-up scope before accepting the quote',
          'IRS Letter 147C retrieval if needed',
          'IRS entity address/name update guidance',
          'Review payment-provider application documents without guaranteeing approval or integration'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'كم المدة الفعلية لصدور الرقم الضريبي EIN؟',
        questionEn: 'How long does it actually take to get an EIN?',
        answerAr: 'تختلف مدة المعالجة بحسب قناة التقديم واكتمال الطلب وحجم العمل لدى IRS؛ لا يمكن ضمان عدد محدد من الأيام.',
        answerEn: 'Processing time varies by submission channel, application completeness, and IRS workload; a fixed number of days cannot be guaranteed.'
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
