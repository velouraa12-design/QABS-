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
        titleAr: 'تنسيق الإيداع وإصدار السجل الحكومي',
        titleEn: 'Filing Coordination & Registry Issuance',
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
        titleAr: 'مراجعة متطلبات SSN أو ITIN',
        titleEn: 'SSN or ITIN Requirements Review',
        descriptionAr: 'تُراجع متطلبات SSN أو ITIN وقناة التقديم وفق حالة مقدم الطلب وتعليمات IRS.',
        descriptionEn: 'SSN or ITIN requirements and application channels are reviewed against the applicant’s circumstances and IRS instructions.'
      },
      {
        titleAr: 'المساعدة في إعداد نموذج SS-4',
        titleEn: 'Accurate Form SS-4 Preparation',
        descriptionAr: 'مساعدة في إعداد ومراجعة نموذج SS-4 والبيانات المقدمة؛ لا يمكن ضمان خلو الطلب من الملاحظات أو تأخر المعالجة.',
        descriptionEn: 'Assistance preparing and reviewing Form SS-4; comments, rejection, or processing delays cannot be ruled out.'
      },
      {
        titleAr: 'مستندات مساعدة لطلبات الحسابات والدفع',
        titleEn: 'Banking & Payment Application Documents',
        descriptionAr: 'قد يطلب بعض مزودي الحسابات والدفع رقم EIN؛ وجوده وحده لا يضمن أهلية الحساب أو الموافقة.',
        descriptionEn: 'Some account and payment providers may request an EIN; having one does not by itself establish eligibility or approval.'
      },
      {
        titleAr: 'تنسيق التقديم وتسليم المستندات المتاحة',
        titleEn: 'Submission Coordination & Available Document Handover',
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
        titleAr: 'إعداد ومراجعة نموذج SS-4',
        titleEn: 'Prepare & Review Form SS-4',
        descriptionAr: 'تساعد قبس في إعداد نموذج SS-4 ومراجعته؛ تُحدد طريقة التوقيع والتقديم وفق القناة والمتطلبات المعمول بها.',
        descriptionEn: 'QABS can assist with Form SS-4 preparation and review; signing and submission methods depend on the applicable channel and requirements.',
        durationAr: 'بعد قبول الطلب ومراجعة المتطلبات',
        durationEn: 'After request acceptance and requirements review'
      },
      {
        stepNumber: '03',
        titleAr: 'الإيداع لدى قسم IRS الدولي',
        titleEn: 'IRS International Submission',
        descriptionAr: 'يُنسّق التقديم عبر قناة متاحة بعد قبول الطلب؛ تحدد IRS إجراءات المعالجة والرد.',
        descriptionEn: 'Submission is coordinated through an available channel after acceptance; the IRS determines processing and response.',
        durationAr: 'حسب معالجة IRS والقناة المتاحة',
        durationEn: 'Subject to IRS processing and available channel'
      },
      {
        stepNumber: '04',
        titleAr: 'استلام الخطاب الرسمي',
        titleEn: 'Official Letter Delivery',
        descriptionAr: 'تُسلّم نسخة CP575 أو 147C إذا أصدرتها IRS وكانت متاحة، ولا يعني ذلك قبول البنوك أو بوابات الدفع.',
        descriptionEn: 'A CP575 or 147C copy is handed over if issued by the IRS and available; this does not imply bank or payment-provider approval.',
        durationAr: 'بعد صدور الخطاب وتوفره',
        durationEn: 'After the notice is issued and available'
      }
    ],
    packages: [
      {
        id: 'ein_standard',
        nameAr: 'مساعدة طلب EIN القياسي',
        nameEn: 'Standard EIN Application Assistance',
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
        nameAr: 'مساعدة طلب EIN أو مراجعة خطاب 147C',
        nameEn: 'EIN Application or 147C Review Assistance',
        priceUsd: 119,
        billingNoteAr: 'خدمة إضافية حسب الأهلية والتوفر',
        billingNoteEn: 'Additional service subject to eligibility and availability',
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
      'مساعدة في مراجعة متطلبات الوكيل المسجل في الولاية والتنسيق مع مزود متاح عند تأكيد الأهلية والتوفر؛ استلام البريد ومسحه وإعادة توجيهه يخضع لشروط المزود.',
    subtitleEn:
      'Assistance reviewing state registered-agent requirements and coordinating with an available provider after eligibility and availability are confirmed; mail receipt, scanning, and forwarding depend on provider terms.',
    seoTitleAr: 'خدمة الوكيل المسجل الأمريكي Registered Agent | قبس',
    seoTitleEn: 'US Registered Agent & Street Address Service | QABS',
    seoDescriptionAr:
      'معلومات ومساعدة لطلب وكيل مسجل في الولايات المتاحة بعد مراجعة الولاية والتكلفة والخدمات التي يقدمها المزود.',
    seoDescriptionEn:
      'Registered-agent application assistance in supported jurisdictions, subject to state review, provider availability, fees, and service terms.',
    detailedDescriptionAr: [
      'تتطلب الولايات عادةً وجود وكيل مسجل للكيانات المحلية، لكن تفاصيل العنوان والقبول والاستلام تختلف حسب الولاية ونوع الكيان؛ يجب التحقق من المتطلبات الرسمية قبل التقديم.',
      'يمكن لقبس المساعدة في مراجعة متطلبات الوكيل ومقارنة الخيارات المتاحة. عنوان الوكيل لا يستبدل بالضرورة كل عناوين الشركة المطلوبة في السجلات، كما أن المسح وإعادة التوجيه والأرشفة تعتمد على مزود الخدمة وتكامله.'
    ],
    detailedDescriptionEn: [
      'Every US state legally requires an LLC or Corporation to maintain a Registered Agent with a physical street address in the state of formation during standard business hours.',
      'QABS can help review registered-agent requirements and available options. An agent address does not necessarily replace every company address required in public records; scanning, forwarding, and dashboard delivery depend on the provider and verified integration.'
    ],
    deliveryTimeAr: 'المدة وتاريخ التفعيل يعتمدان على الولاية ومزود الوكيل وتأكيد الطلب',
    deliveryTimeEn: 'Activation timing depends on the jurisdiction, agent provider, and confirmed order',
    startingPriceUsd: 99,
    pricingNoteAr: 'السعر إرشادي لكل ولاية وقد تختلف رسوم الوكيل وخدمات البريد والمسح وإعادة التوجيه؛ لا يبدأ الاشتراك قبل تأكيد المزود والنطاق.',
    pricingNoteEn: 'Indicative per-state pricing; agent, mail, scanning, and forwarding fees vary. No subscription starts until provider and scope are confirmed.',
    features: [
      {
        titleAr: 'التحقق من التغطية حسب الولاية',
        titleEn: 'Jurisdiction Availability Review',
        descriptionAr: 'تُراجع تغطية مزود الوكيل للولاية المطلوبة وشروط العنوان قبل تأكيد الخدمة.',
        descriptionEn: 'The selected provider’s coverage and address requirements are checked for the requested jurisdiction before confirmation.'
      },
      {
        titleAr: 'فهم أثر عنوان الوكيل على السجلات',
        titleEn: 'Founder Privacy Shield',
        descriptionAr: 'قد يظهر عنوان الوكيل في بعض السجلات، لكن قد تظل هناك متطلبات لعناوين أخرى أو إفصاحات عن المالك.',
        descriptionEn: 'An agent address may appear in some records, but other company-address or owner-disclosure requirements may still apply.'
      },
      {
        titleAr: 'خدمات البريد وفق مزود الوكيل',
        titleEn: 'Provider-Based Mail Services',
        descriptionAr: 'تختلف آلية استلام الخطابات ومسحها وإرسالها ومدتها ورسومها حسب المزود؛ لا يُفترض وجود ربط تلقائي بلوحة قبس.',
        descriptionEn: 'Mail receipt, scanning, forwarding times, and fees depend on the provider; automatic QABS dashboard integration is not assumed.'
      },
      {
        titleAr: 'مساعدة في تغيير الوكيل عند التوفر',
        titleEn: 'Registered-Agent Change Assistance',
        descriptionAr: 'قد تتوفر مساعدة في تجهيز طلب تغيير الوكيل؛ قبول الطلب ورسوم الإيداع وتوفر المزود تخضع للولاية.',
        descriptionEn: 'Assistance preparing a change-of-agent request may be available; registry acceptance, filing fees, and provider availability depend on the state.'
      }
    ],
    benefitsAr: [
      'استلام الإشعارات في الوقت المناسب قد يساعد على متابعة الالتزامات، لكنه لا يضمن Good Standing ولا يغني عن مسؤولية الشركة عن المواعيد.',
      'عدم تفويت أي إشعارات ضريبية أو تقارير سنوية صادرة عن سكرتير الولاية.',
      'إمكانية استخدام العنوان القانوني في نماذج التأسيس وبعض متطلبات الامتثال.',
      'تُراجع مواعيد التجديد وشروط التنبيه وفق مزود الخدمة؛ لا يُفترض وجود تجديد أو تنبيه تلقائي.'
    ],
    benefitsEn: [
      'Timely receipt of notices may support compliance tracking but does not guarantee Good Standing or remove the company’s responsibility for deadlines.',
      'Never miss critical tax notices or Secretary of State compliance deadlines.',
      'Protect founder privacy across public corporate lookups.',
      'Renewal terms and reminders depend on the provider; automatic renewal or advance alerts are not assumed.'
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
        titleAr: 'مراجعة العنوان والتفويض',
        titleEn: 'Address Assignment & Authorization',
        descriptionAr: 'تُراجع بيانات العنوان وموافقة الوكيل قبل أي تعيين؛ لا يُعتمد العنوان قبل تأكيد المزود.',
        descriptionEn: 'Review the proposed address and agent consent; the address is not assigned until the provider confirms availability.',
        durationAr: 'بعد تأكيد المزود',
        durationEn: 'After provider confirmation'
      },
      {
        stepNumber: '03',
        titleAr: 'تأكيد التفعيل وقناة المراسلات',
        titleEn: 'Activation & Vault Sync',
        descriptionAr: 'يُؤكد التفعيل وقناة تسليم المراسلات والتنبيهات إذا كانت متاحة لدى المزود ومربوطة تقنياً.',
        descriptionEn: 'Activation, mail delivery, and reminders are confirmed only where the provider offers them and the integration is technically connected.',
        durationAr: 'حسب إجراءات المزود',
        durationEn: 'Subject to provider procedures'
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
        descriptionAr: 'طلب وكيل مسجل وفق شروط الولاية والمزود، مع خدمات البريد التي يتم تأكيدها كتابياً.',
        descriptionEn: 'Registered-agent request subject to state and provider terms, with only the mail services confirmed in writing.',
        recommended: true,
        featuresAr: [
          'تأكيد العنوان والقبول لدى الولاية قبل التعيين',
          'خدمات استلام الإشعارات وفق شروط المزود',
          'مسح وإرسال البريد إذا كانت الخدمة متاحة ومشمولة في العرض',
          'معلومات عن مواعيد التقرير السنوي دون ضمان تنبيه آلي'
        ],
        featuresEn: [
          'Confirm address and state acceptance before appointment',
          'Notice-receipt services subject to provider terms',
          'Scanning and delivery only if available and included in the quote',
          'Annual-report date information; automated alerts are not guaranteed'
        ]
      },
      {
        id: 'ra_plus_mail',
        nameAr: 'الوكيل المسجل + بريد الأعمال',
        nameEn: 'Registered Agent + Mail Forwarding',
        priceUsd: 169,
        billingNoteAr: 'سنوياً شامل إعادة توجيه البريد البنكي',
        billingNoteEn: 'Per year incl. commercial mail scans',
        descriptionAr: 'خدمات بريد تجاري إضافية قد تكون متاحة لدى بعض المزودين برسوم وشروط منفصلة؛ يجب تأكيد قبول كل نوع من البريد قبل الطلب.',
        descriptionEn: 'Additional commercial-mail services may be offered by some providers at separate fees and terms; acceptance of each mail type must be confirmed before ordering.',
        featuresAr: [
          'جميع مزايا الوكيل المسجل السنوي',
          'قبول أنواع المراسلات التجارية بعد تأكيد المزود',
          'حدود المسح ورسوم البريد تحددها شروط المزود',
          'التسليم والأرشفة عبر القناة المتاحة إذا كانت مفعّلة'
        ],
        featuresEn: [
          'All Annual Registered Agent features',
          'Commercial mail types accepted only after provider confirmation',
          'Scanning limits and mail fees follow provider terms',
          'Delivery and archiving through the available channel if enabled'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل يختلف عنوان الوكيل المسجل عن عنوان مكتب العمل التجاري؟',
        questionEn: 'Is a Registered Agent address different from a commercial mail address?',
        answerAr: 'يقتصر دور الوكيل المسجل عادةً على الإشعارات الرسمية وخدمة الإجراءات وفق قانون الولاية. أما البريد التجاري وبطاقات البنوك فيتطلبان خدمة منفصلة وتأكيداً صريحاً من المزود.',
        answerEn: 'A standard Registered Agent generally receives statutory notices and service of process under state law. Commercial mail and bank cards require a separate service and explicit provider confirmation.'
      },
      {
        questionAr: 'هل يمكنني نقل شركتي الحالية لوكيل قبس المسجل؟',
        questionEn: 'Can I transfer my existing US LLC to QABS Registered Agent?',
        answerAr: 'قد نساعد في تجهيز طلب تغيير الوكيل وتنسيقه عند توفر الخدمة؛ رسوم الإيداع وقبول الولاية وموعد السريان تخضع للجهة المختصة.',
        answerEn: 'We may assist with preparing and coordinating a change-of-agent request where available; filing fees, state acceptance, and effective date are controlled by the relevant authority.'
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
      'معلومات ومساعدة في مراجعة خيار US LLC بحسب نشاطك ومكان ممارسة الأعمال ومتطلبات الولاية؛ لا يوجد اختصاص واحد مناسب للجميع وتخضع الرسوم والأهلية للتحقق.',
    subtitleEn:
      'Information and assistance reviewing a US LLC option against business activity, operating location, and state requirements; no single jurisdiction fits every founder and fees and eligibility require verification.',
    seoTitleAr: 'تأسيس شركة US LLC أمريكية لغير المقيمين | أسعار الـ 50 ولاية — قبس',
    seoTitleEn: 'Form a US LLC for Non-Residents | All 50 States Pricing — QABS',
    seoDescriptionAr:
      'مساعدة في مراجعة خيارات US LLC وتجهيز طلب التأسيس في الاختصاصات المتاحة، مع توضيح الرسوم والمتطلبات قبل قبول نطاق الخدمة؛ لا نضمن إصدار EIN أو فتح حساب بنكي.',
    seoDescriptionEn:
      'US LLC formation assistance in supported jurisdictions, with requirements and fees reviewed before the service scope is accepted; EIN issuance and bank-account opening are not guaranteed.',
    detailedDescriptionAr: [
      'الشركة ذات المسؤولية المحدودة (LLC) أحد الأشكال القانونية المتاحة في الولايات المتحدة. تختلف آثارها القانونية والضريبية بحسب الولاية والملكية والنشاط ومكان ممارسة الأعمال؛ لا تمثل حماية مطلقة أو استشارة قانونية أو ضريبية.',
      'تساعد قبس في مراجعة بعض الاختصاصات المتاحة ومقارنة المتطلبات والرسوم المعلنة. الضرائب والتقارير والإفصاحات تختلف حسب الحالة وقد تتطلب التزامات في أكثر من ولاية؛ يجب التحقق من المصادر الرسمية قبل الاختيار.'
    ],
    detailedDescriptionEn: [
      'A US Limited Liability Company (LLC) is the most flexible, cost-effective entity for international founders, combining personal asset protection with streamlined governance.',
      'QABS can help review selected jurisdictions and published requirements and fees. Tax, reporting, and disclosure obligations vary by circumstances and may apply in more than one state; verify official sources before choosing.'
    ],
    deliveryTimeAr: 'المدة غير مضمونة وتختلف حسب الولاية واكتمال المستندات ومعالجة السجل',
    deliveryTimeEn: 'Timing is not guaranteed and varies by state, document completeness, and registry processing',
    startingPriceUsd: 339,
    pricingNoteAr: 'الأسعار إرشادية وتخضع لمراجعة الأهلية والتوفر؛ تُحدد الرسوم الحكومية ورسوم الوكيل وأي خدمات إضافية في عرض مكتوب قبل التنفيذ.',
    pricingNoteEn: 'Prices are indicative and subject to eligibility and availability review; state filing, agent, and optional service fees are confirmed in a written quote before work begins.',
    features: [
      {
        titleAr: 'مراجعة الاختصاصات المتاحة',
        titleEn: 'Supported Jurisdictions Review',
        descriptionAr: 'تُراجع الرسوم الحكومية ومتطلبات الولاية المختارة من المصدر الرسمي قبل اعتماد عرض الخدمة.',
        descriptionEn: 'Government fees and requirements for the selected state are checked against official sources before the service quote is confirmed.'
      },
      {
        titleAr: 'مراجعة الآثار الضريبية حسب الحالة',
        titleEn: 'Tax Treatment Depends on Circumstances',
        descriptionAr: 'المعاملة الضريبية تعتمد على نوع الكيان والمالك ومصدر الدخل ومكان ممارسة النشاط؛ لا يعني اختيار الولاية الإعفاء من الضرائب.',
        descriptionEn: 'Tax treatment depends on entity type, owner, income source, and operating locations; selecting a state does not eliminate tax obligations.'
      },
      {
        titleAr: 'مراجعة متطلبات المنصات ومزودي الدفع',
        titleEn: 'Marketplace and Payment Provider Requirements',
        descriptionAr: 'قد تساعد وثائق الشركة في تجهيز بعض الطلبات؛ لكل منصة ومزود شروطه وقراره المستقل ولا نضمن القبول.',
        descriptionEn: 'Company documents may help prepare some applications; each platform and provider applies independent requirements and decisions, with no approval guarantee.'
      },
      {
        titleAr: 'مراجعة التزامات الامتثال السنوية',
        titleEn: 'Annual Compliance Requirements Review',
        descriptionAr: 'تُراجع مواعيد التقارير والنماذج التي قد تنطبق على الشركة؛ لا توجد متابعة أو تنبيهات آلية ما لم تُفعّل خدمة مستقلة وتُؤكد.',
        descriptionEn: 'Applicable report and form deadlines are reviewed; automated tracking or alerts are not provided unless a separate service is activated and confirmed.'
      }
    ],
    benefitsAr: [
      'قد يوفر الكيان فصلاً قانونياً بين الأصول عند الالتزام بالقوانين والإدارة السليمة؛ لا يمثل ذلك حماية مطلقة.',
      'يصدر رقم الملف أو السجل من الجهة المختصة بعد قبول الإيداع؛ لا يمكن ضمان مدة الإصدار.',
      'قد تساعد مستندات الكيان في تجهيز طلب حساب تجاري؛ قرار فتح الحساب يعود للمزود ولا نضمنه.',
      'مرونة إضافة أو تعديل الشركاء عبر اتفاقية التشغيل.'
    ],
    benefitsEn: [
      'An entity may provide legal separation of assets when properly maintained; this is not absolute protection.',
      'The relevant registry issues a filing or record number after accepting the submission; timing is not guaranteed.',
      'Entity documents may support a business-account application; the provider decides approval and QABS does not guarantee it.',
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
        descriptionAr: 'تُنسّق قبس تجهيز طلب الإيداع بعد قبول الأهلية والنطاق وتوفر جهة التنفيذ؛ السجل الحكومي يصدر شهادة التأسيس، ويخضع طلب EIN لمتطلبات IRS.',
        descriptionEn: 'QABS coordinates filing preparation after eligibility and scope acceptance and service availability; the registry issues formation records, and any EIN request is subject to IRS requirements.',
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
        billingNoteAr: 'رسوم الولاية تُراجع وتُؤكد وقت عرض السعر',
        billingNoteEn: 'State fee reviewed and confirmed at quote',
        descriptionAr: 'خيار إرشادي لمراجعة أهلية التأسيس في وايومنغ؛ الضرائب والإفصاحات والوكيل وطلب EIN تخضع لمتطلبات مستقلة وتأكيد النطاق.',
        descriptionEn: 'An indicative option for reviewing Wyoming formation eligibility; tax, disclosure, agent, and EIN requirements are separate and subject to scope confirmation.',
        recommended: true,
        featuresAr: [
          'مساعدة في تجهيز طلب LLC في وايومنغ بعد مراجعة الأهلية والرسوم',
          'مساعدة في إعداد طلب EIN وفق متطلبات IRS دون ضمان الإصدار',
          'مسودة اتفاقية تشغيل أو قرار بنكي إذا شملهما العرض',
          'مراجعة توفر الوكيل ومدته وتكلفته قبل الطلب'
        ],
        featuresEn: [
          'Assistance preparing a Wyoming LLC application subject to eligibility and fee review',
          'EIN application assistance subject to IRS requirements; issuance is not guaranteed',
          'Operating Agreement or banking-resolution draft if included in the quote',
          'Confirm agent availability, term, and cost before ordering'
        ]
      },
      {
        id: 'llc_nm',
        nameAr: 'باقة نيو مكسيكو LLC الاقتصادية',
        nameEn: 'New Mexico LLC Value',
        priceUsd: 349,
        billingNoteAr: 'رسوم الولاية تُراجع وتُؤكد وقت عرض السعر',
        billingNoteEn: 'State fee reviewed and confirmed at quote',
        descriptionAr: 'خيار إرشادي لمراجعة متطلبات نيو مكسيكو؛ تختلف التقارير والإفصاحات والضرائب حسب النشاط والمالك والجهات الأخرى.',
        descriptionEn: 'An indicative option for reviewing New Mexico requirements; reporting, disclosure, and tax obligations vary by activity, owner, and other jurisdictions.',
        featuresAr: [
          'مساعدة في تجهيز طلب LLC في نيو مكسيكو بعد مراجعة الأهلية والرسوم',
          'مراجعة التقارير والالتزامات التي تنطبق على الشركة',
          'مساعدة في طلب EIN ومسودة اتفاقية تشغيل إذا شملهما العرض',
          'مراجعة توفر الوكيل ومدته وتكلفته قبل الطلب'
        ],
        featuresEn: [
          'Assistance preparing a New Mexico LLC application subject to eligibility and fee review',
          'Review reporting obligations that apply to the company',
          'EIN application assistance and Operating Agreement draft if included in the quote',
          'Confirm agent availability, term, and cost before ordering'
        ]
      },
      {
        id: 'llc_de',
        nameAr: 'باقة ديلاوير LLC الاستثمارية',
        nameEn: 'Delaware LLC Standard',
        priceUsd: 389,
        billingNoteAr: 'رسوم الولاية تُراجع وتُؤكد وقت عرض السعر',
        billingNoteEn: 'State fee reviewed and confirmed at quote',
        descriptionAr: 'خيار إرشادي لمراجعة ملاءمة ديلاوير وفق نوع الكيان والنشاط وخطة العمل؛ لا يضمن قبول المستثمرين أو البنوك.',
        descriptionEn: 'An indicative option to review Delaware suitability against entity type and business plans; investor or bank acceptance is not guaranteed.',
        featuresAr: [
          'مساعدة في تجهيز طلب LLC في ديلاوير بعد مراجعة الأهلية والرسوم',
          'الاستفادة من محاكم Chancery المتخصصة',
          'مساعدة في طلب EIN ومسودة اتفاقية تشغيل إذا شملهما العرض',
          'مراجعة توفر الوكيل ومتطلبات العنوان وتكلفته قبل الطلب'
        ],
        featuresEn: [
          'Assistance preparing a Delaware LLC application subject to eligibility and fee review',
          'Review jurisdiction-specific legal framework with a qualified adviser',
          'EIN application assistance and Operating Agreement draft if included in the quote',
          'Confirm agent availability, address requirements, and cost before ordering'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'ما هي أفضل ولاية أمريكية لتأسيس شركة تجارة إلكترونية؟',
        questionEn: 'Which US state is best for an e-commerce LLC?',
        answerAr: 'لا توجد ولاية هي الأفضل لكل الشركات. يعتمد الاختيار على مكان النشاط والعملاء والمالك والضرائب والرسوم والتقارير؛ ينبغي مراجعة المصادر الرسمية ومستشار مختص قبل القرار.',
        answerEn: 'No state is best for every company. Selection depends on operations, customers, owners, taxes, fees, and reporting; review official sources and consult a qualified adviser before deciding.'
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
