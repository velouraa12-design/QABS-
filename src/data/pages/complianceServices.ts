import { ServicePageData } from '../../types/pages.ts';

export const COMPLIANCE_SERVICES: ServicePageData[] = [
  {
    slug: 'compliance',
    path: '/services/compliance',
    category: 'compliance',
    categoryLabelAr: 'الامتثال القانوني',
    categoryLabelEn: 'Corporate Compliance',
    titleAr: 'الامتثال القانوني وإقرارات الشركات الأمريكية (BOI / IRS 5472)',
    titleEn: 'Corporate Compliance, BOI & Non-Resident Tax Filings',
    subtitleAr:
      'حافظ على سلامة وضع شركتك القانوني وتجنب الغرامات الفيدرالية من خلال متابعة إقرارات BOI، ونماذج IRS 5472 / 1120، وشهادات Good Standing.',
    subtitleEn:
      'Keep your US entity in continuous Good Standing and avoid heavy federal penalties with FinCEN BOI reporting, IRS 5472/1120 filings, and compliance monitoring.',
    seoTitleAr: 'خدمات الامتثال القانوني والضريبي للشركات الأمريكية | قبس',
    seoTitleEn: 'US Corporate Compliance, BOI & Form 5472 Services | QABS',
    seoDescriptionAr:
      'حماية شركتك الأمريكية من الغرامات عبر خدمات الامتثال الشاملة: إقرار BOI FinCEN، نماذج 5472 و 1120 لغير المقيمين، وشهادة حسن السيرة Good Standing.',
    seoDescriptionEn:
      'Comprehensive US LLC compliance management including FinCEN BOI reports, Form 5472/1120 preparation, and Certificate of Good Standing.',
    detailedDescriptionAr: [
      'الالتزام بمتطلبات الامتثال الفيدرالية والولائية بعد التأسيس لا يقل أهمية عن خطوة التأسيس نفسها؛ إذ تفرض الجهات التنظيمية في الولايات المتحدة تقارير إلزامية مثل إقرار المستفيد الحقيقي (FinCEN BOI) وإقرارات الشركات المملوكة لأجانب (Form 5472 + 1120).',
      'تتولى قبس مراقبة التقويم السنوي لشركتك، وتنبيهك المسبق بالمواعيد النظامية، وتجهيز كافة ملفات الامتثال والتصديقات المطلوبة للبنوك والمستثمرين.'
    ],
    detailedDescriptionEn: [
      'Ongoing federal and state compliance is critical after incorporating. US regulators enforce mandatory reporting such as FinCEN Beneficial Ownership Information (BOI) and annual foreign-owned LLC informational filings (Form 5472 + Pro-Forma Form 1120).',
      'QABS monitors your statutory calendar year-round, dispatches proactive reminders, and prepares required compliance documentation to safeguard your banking and Good Standing status.'
    ],
    deliveryTimeAr: '2 – 5 أيام عمل حسب نوع الإقرار',
    deliveryTimeEn: '2 – 5 business days depending on filing',
    startingPriceUsd: 149,
    pricingNoteAr: 'تختلف التكلفة حسب نوع الإقرار أو باقة الامتثال السنوية',
    pricingNoteEn: 'Pricing varies by individual filing or annual compliance retainer',
    features: [
      {
        titleAr: 'إقرار المستفيد الحقيقي (BOI)',
        titleEn: 'FinCEN BOI Reporting',
        descriptionAr: 'إعداد وتقديم تقرير المستفيد الحقيقي لدى شبكة مكافحة الجرائم المالية الأمريكية.',
        descriptionEn: 'Accurate preparation and submission of Beneficial Ownership reports to FinCEN.'
      },
      {
        titleAr: 'متابعة نماذج 5472 & 1120',
        titleEn: 'Form 5472 & Pro-Forma 1120',
        descriptionAr: 'تجهيز الإفصاح السنوي للشركات ذات المالك الواحد غير المقيم لتفادي غرامة $25,000.',
        descriptionEn: 'Annual informational filing prep for foreign-owned single-member LLCs.'
      },
      {
        titleAr: 'شهادة حسن السيرة (Good Standing)',
        titleEn: 'Certificate of Good Standing',
        descriptionAr: 'استخراج شهادة رسمية حديثة من سكرتير الولاية لمتطلبات البنوك والتوسع.',
        descriptionEn: 'Obtain certified state Good Standing certificates for bank audits or contracts.'
      },
      {
        titleAr: 'تعديل بيانات الشركة (Amendment)',
        titleEn: 'Articles Amendment Filings',
        descriptionAr: 'تعديل اسم الشركة، أو الأعضاء، أو العنوان الرسمي لدى سكرتير الولاية.',
        descriptionEn: 'Official state filings to update entity name, members, or corporate address.'
      }
    ],
    benefitsAr: [
      'حماية الشركة من الغرامات الضريبية الفيدرالية المرتفعة.',
      'ضمان استمرارية الحسابات البنكية وبوابات الدفع دون تجميد.',
      'تجهيز ملف الامتثال السنوي في مكان واحد داخل لوحة تحكم قبس.',
      'دعم استشاري مباشر للرد على استفسارات الامتثال.'
    ],
    benefitsEn: [
      'Protect your company from severe federal non-filing penalties.',
      'Prevent bank account holds or Stripe verification suspensions.',
      'Centralize every compliance certificate inside your QABS Vault.',
      'Direct guidance from corporate compliance specialists.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'تدقيق وضع الشركة الحالي',
        titleEn: 'Compliance Status Audit',
        descriptionAr: 'فحص سجل الشركة في الولاية وتاريخ التأسيس وحالة الوكيل والإقرارات المستحقة.',
        descriptionEn: 'Review your entity standing with the Secretary of State and federal deadlines.',
        durationAr: '24 ساعة',
        durationEn: '24 hours'
      },
      {
        stepNumber: '02',
        titleAr: 'جمع البيانات والمستندات',
        titleEn: 'Document & Ledger Collection',
        descriptionAr: 'تجميع بيانات الملاك والحركات المالية السنوية أو التعديلات المطلوبة.',
        descriptionEn: 'Collect beneficial owner details, annual transaction summaries, or amendments.',
        durationAr: '1 – 2 يوم',
        durationEn: '1 – 2 days'
      },
      {
        stepNumber: '03',
        titleAr: 'الإيداع واستلام التأكيد الرسمي',
        titleEn: 'Filing & Confirmation Vaulting',
        descriptionAr: 'رفع الإقرارات لدى الجهات الرسمية وحفظ إيصالات الاستلام في حسابك.',
        descriptionEn: 'Submit filings to authorities and archive official receipts in your QABS Vault.',
        durationAr: '2 – 5 أيام عمل',
        durationEn: '2 – 5 business days'
      }
    ],
    packages: [
      {
        id: 'comp_boi',
        nameAr: 'باقة إقرار BOI + حسن السيرة',
        nameEn: 'BOI Report + Good Standing',
        priceUsd: 149,
        billingNoteAr: 'مناسبة للشركات حديثة التأسيس',
        billingNoteEn: 'Ideal for newly formed LLCs',
        descriptionAr: 'تغطي تقرير المستفيد الحقيقي FinCEN وشهادة Good Standing معتمدة.',
        descriptionEn: 'Covers FinCEN BOI submission and certified state Good Standing retrieval.',
        featuresAr: [
          'إعداد وإيداع تقرير FinCEN BOI',
          'استخراج شهادة Good Standing',
          'إيصالات إثبات التقديم الرسمية',
          'تحديث سجل الامتثال في المنصة'
        ],
        featuresEn: [
          'FinCEN BOI preparation & filing',
          'Certificate of Good Standing retrieval',
          'Official submission confirmation receipts',
          'Updated compliance status in QABS Portal'
        ]
      },
      {
        id: 'comp_annual_shield',
        nameAr: 'درع الامتثال السنوي الشامل',
        nameEn: 'Annual Compliance Shield',
        priceUsd: 399,
        billingNoteAr: 'سنوياً — حماية متكاملة',
        billingNoteEn: 'Per year — full protection',
        descriptionAr: 'باقة سنوية متكاملة تشمل التقرير السنوي + إعداد ملف 5472 + الوكيل المسجل.',
        descriptionEn: 'Complete annual protection: State Annual Report, Form 5472/1120 prep, and Agent.',
        recommended: true,
        featuresAr: [
          'تجديد الوكيل المسجل لمدة سنة',
          'تقديم التقرير السنوي للولاية',
          'تجهيز ملف إقرار 5472 + 1120 لغير المقيمين',
          'شهادة Good Standing وتنبيهات مستمرة'
        ],
        featuresEn: [
          'Full-year Registered Agent renewal',
          'State Annual Report filing service',
          'Form 5472 & Pro-Forma 1120 prep',
          'Good Standing & continuous compliance monitoring'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'ما أهمية نموذج 5472 للشركات الأمريكية المملوكة لغير المقيمين؟',
        questionEn: 'Why is IRS Form 5472 critical for foreign-owned US LLCs?',
        answerAr: 'تُلزم مصلحة الضرائب الأمريكية كل شركة Single-Member LLC مملوكة لغير مقيم بتقديم نموذج 5472 سنوياً للإفصاح عن المعاملات بين المالك والشركة، وتصل غرامة عدم التقديم إلى $25,000.',
        answerEn: 'The IRS requires every foreign-owned Single-Member LLC to file Form 5472 annually with Pro-Forma 1120, even with zero profit, to avoid a $25,000 penalty.'
      },
      {
        questionAr: 'متى أحتاج شهادة Good Standing؟',
        questionEn: 'When do I need a Certificate of Good Standing?',
        answerAr: 'تُطلب عند فتح حسابات بنكية جديدة، أو التوسع التجاري في ولاية أخرى، أو أثناء مراجعات بوابات الدفع والاستثمار.',
        answerEn: 'It is commonly requested when opening new business bank accounts, registering in another state, or during merchant compliance reviews.'
      }
    ],
    formFields: [
      {
        name: 'companyName',
        labelAr: 'اسم الشركة الأمريكية',
        labelEn: 'US Company Name',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: Horizon Global LLC',
        placeholderEn: 'e.g. Horizon Global LLC'
      },
      {
        name: 'complianceScope',
        labelAr: 'نوع خدمة الامتثال المطلوبة',
        labelEn: 'Required Compliance Scope',
        type: 'select',
        required: true,
        options: [
          { value: 'Annual Shield (5472 + Report)', labelAr: 'درع الامتثال السنوي (5472 + التقرير)', labelEn: 'Annual Shield (5472 + Report)' },
          { value: 'FinCEN BOI Report', labelAr: 'تقرير المستفيد الحقيقي BOI', labelEn: 'FinCEN BOI Report' },
          { value: 'Good Standing Certificate', labelAr: 'شهادة حسن سيرة Good Standing', labelEn: 'Certificate of Good Standing' },
          { value: 'Entity Amendment', labelAr: 'تعديل بيانات الشركة (Amendment)', labelEn: 'Company Articles Amendment' }
        ]
      }
    ],
    relatedPaths: ['/services/annual-report', '/services/company-renewal', '/services/registered-agent', '/services/ein']
  },
  {
    slug: 'annual-report',
    path: '/services/annual-report',
    category: 'compliance',
    categoryLabelAr: 'الامتثال القانوني',
    categoryLabelEn: 'Corporate Compliance',
    titleAr: 'إعداد وتقديم التقرير السنوي للولاية (Annual Report)',
    titleEn: 'State Annual Report & Franchise Tax Filing',
    subtitleAr:
      'قدّم التقرير السنوي لشركتك قبل الموعد القانوني لدى سكرتير الولاية (وايومنغ، ديلاوير، فلوريدا وغيرها) لضمان بقاء الشركة نشطة وبوضع نظامي سليم.',
    subtitleEn:
      'File your mandatory State Annual Report and Franchise Tax on time across Wyoming, Delaware, Florida, and all US states to keep your company Active.',
    seoTitleAr: 'تقديم التقرير السنوي للشركات الأمريكية Annual Report | قبس',
    seoTitleEn: 'US LLC Annual Report & Franchise Tax Filing | QABS',
    seoDescriptionAr:
      'خدمة تقديم التقرير السنوي وضريبة الامتياز السنوية للشركات الأمريكية في جميع الولايات مع تفادي غرامات التأخير والإغلاق الإداري.',
    seoDescriptionEn:
      'Timely Secretary of State Annual Report and Delaware Franchise Tax filing to prevent late fees and administrative dissolution.',
    detailedDescriptionAr: [
      'تشترط معظم الولايات الأمريكية تقديم تقرير سنوي (Annual Report) أو ضريبة امتياز سنوية (Franchise Tax) لتأكيد استمرار نشاط الشركة وتحديث بيانات الوكيل والمدراء.',
      'تتولى منصة قبس احتساب الرسوم الحكومية الدقيقة حسب الولاية، وتجهيز التقرير وإيداعه إلكترونياً قبل الموعد النهائي مع تسليم إيصال الولاية الرسمي.'
    ],
    detailedDescriptionEn: [
      'Most US states require LLCs and Corporations to submit an Annual Report or Franchise Tax filing each year to confirm active status and verify corporate records.',
      'QABS calculates exact statutory state fees, prepares your state report, and files electronically ahead of deadlines with official state confirmation archived in your Vault.'
    ],
    deliveryTimeAr: '1 – 3 أيام عمل',
    deliveryTimeEn: '1 – 3 business days',
    startingPriceUsd: 75,
    pricingNoteAr: 'رسوم خدمة التقديم $75 + رسوم الولاية الفعلية (مثل $60 في وايومنغ أو $300 في ديلاوير)',
    pricingNoteEn: '$75 filing service fee + statutory state fee ($60 WY / $300 DE)',
    features: [
      {
        titleAr: 'تجنب غرامات التأخير والحَلّ',
        titleEn: 'Prevent Late Fees & Dissolution',
        descriptionAr: 'تقديم مبكر يمنع فرض غرامات التأخير التي قد تصل إلى $200+ أو شطب الشركة.',
        descriptionEn: 'Proactive filing prevents state late penalties and administrative dissolution.'
      },
      {
        titleAr: 'حساب دقيق لضريبة ديلاوير',
        titleEn: 'Delaware Franchise Tax Filing',
        descriptionAr: 'إيداع ضريبة الامتياز السنوية في ديلاوير لـ LLC ($300) أو C-Corp بدقة تامة.',
        descriptionEn: 'Accurate Delaware Franchise Tax calculation and filing for LLC and C-Corp.'
      },
      {
        titleAr: 'تحديث بيانات الملاك والعنوان',
        titleEn: 'Corporate Record Updates',
        descriptionAr: 'تحديث بيانات الأعضاء أو عنوان العمل بالتزامن مع التقرير السنوي.',
        descriptionEn: 'Update member or business address records concurrently with your annual report.'
      },
      {
        titleAr: 'إيصال رسمي من سكرتير الولاية',
        titleEn: 'Official State Receipt',
        descriptionAr: 'توفير إثبات السداد والتجديد السنوي فوراً في خزينة المستندات.',
        descriptionEn: 'Official stamped receipt stored immediately in your QABS Vault.'
      }
    ],
    benefitsAr: [
      'بقاء سجل الشركة في حالة Active / Good Standing طوال العام.',
      'تجنب تعليق بوابات الدفع أو مراجعات البنوك بسبب انتهاء صلاحية السجل.',
      'توفير وقت البحث عن قوانين ومواعيد كل ولاية على حدة.',
      'إمكانية الدفع الموحد للرسوم الحكومية وأتعاب الخدمة من مكان واحد.'
    ],
    benefitsEn: [
      'Keep your entity Active and in Good Standing with the Secretary of State.',
      'Avoid merchant account reviews triggered by expired state registrations.',
      'Eliminate guesswork over state-specific due dates and calculation rules.',
      'Pay statutory fees and filing service in one unified transaction.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'فحص سجل الشركة والموعد',
        titleEn: 'Verify State Record & Due Date',
        descriptionAr: 'التحقق من رقم الملف الحكومي File Number وحالة الشركة الحالية.',
        descriptionEn: 'Verify your state File Number and current statutory standing.',
        durationAr: 'نفس اليوم',
        durationEn: 'Same day'
      },
      {
        stepNumber: '02',
        titleAr: 'مراجعة البيانات واعتماد الرسوم',
        titleEn: 'Review Filing Details & Fees',
        descriptionAr: 'تأكيد البيانات المسجلة واعتماد رسم الولاية المطلوب سداده.',
        descriptionEn: 'Confirm registered officers/address and approve exact state fee.',
        durationAr: 'ساعات قليلة',
        durationEn: 'Few hours'
      },
      {
        stepNumber: '03',
        titleAr: 'الإيداع الإلكتروني وتسليم الإيصال',
        titleEn: 'Electronic State Submission',
        descriptionAr: 'تقديم التقرير إلكترونياً وتسليم شهادة/إيصال التجديد السنوي.',
        descriptionEn: 'Complete electronic submission and deliver official state filing receipt.',
        durationAr: '1 – 3 أيام عمل',
        durationEn: '1 – 3 business days'
      }
    ],
    packages: [
      {
        id: 'ar_service_only',
        nameAr: 'خدمة تقديم التقرير السنوي',
        nameEn: 'Annual Report Filing Service',
        priceUsd: 75,
        billingNoteAr: '+ الرسوم الحكومية للولاية',
        billingNoteEn: '+ actual state government fee',
        descriptionAr: 'إعداد وتقديم التقرير السنوي وإصدار إيصال الولاية الرسمي.',
        descriptionEn: 'Full preparation, submission, and official state confirmation receipt.',
        recommended: true,
        featuresAr: [
          'فحص وضع الشركة في سجل الولاية',
          'تجهيز وإيداع التقرير السنوي',
          'إيصال رسمي في خزينة المستندات',
          'تذكير تلقائي بموعد العام القادم'
        ],
        featuresEn: [
          'State registry standing verification',
          'Annual report preparation & filing',
          'Official receipt archived in Vault',
          'Automated next-year reminder'
        ]
      },
      {
        id: 'ar_reinstatement',
        nameAr: 'إعادة تفعيل شركة متوقفة (Reinstatement)',
        nameEn: 'Entity Reinstatement Service',
        priceUsd: 199,
        billingNoteAr: '+ المتأخرات الحكومية للولاية',
        billingNoteEn: '+ past-due state fees/penalties',
        descriptionAr: 'للشركات التي فات موعد تقريرها السنوي وتعرضت للتوقف الإداري.',
        descriptionEn: 'For companies marked inactive or dissolved due to missed annual reports.',
        featuresAr: [
          'احتساب المتأخرات والغرامات الرسمية',
          'إعداد طلب إعادة التفعيل Reinstatement',
          'تقديم التقارير المتأخرة واستعادة Good Standing',
          'تحديث بيانات الوكيل المسجل'
        ],
        featuresEn: [
          'Back-fee and penalty assessment',
          'Official Reinstatement filing',
          'Restore Active / Good Standing status',
          'Registered Agent status verification'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'متى يستحق التقرير السنوي في ولاية وايومنغ وديلاوير؟',
        questionEn: 'When are Annual Reports due in Wyoming and Delaware?',
        answerAr: 'في وايومنغ يستحق في اليوم الأول من شهر ذكرى التأسيس سنوياً ($60). أما في ديلاوير لـ LLC فتستحق ضريبة الامتياز ($300) قبل 1 يونيو من كل عام.',
        answerEn: 'In Wyoming, it is due on the 1st day of your anniversary month ($60). For Delaware LLCs, the $300 Franchise Tax is due annually by June 1st.'
      },
      {
        questionAr: 'هل تحتاج شركة نيو مكسيكو إلى تقرير سنوي؟',
        questionEn: 'Does a New Mexico LLC require an Annual Report?',
        answerAr: 'لا، ولاية نيو مكسيكو لا تفرض تقريراً سنوياً ولا رسوم تجديد ولائية على الـ LLC، وإنما تجديد الوكيل المسجل وإقرارات IRS فقط.',
        answerEn: 'No, New Mexico LLCs have $0 state annual report obligations, requiring only Registered Agent maintenance and federal IRS filings.'
      }
    ],
    formFields: [
      {
        name: 'companyName',
        labelAr: 'اسم الشركة المسجلة',
        labelEn: 'Registered Company Name',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: Atlas Ventures LLC',
        placeholderEn: 'e.g. Atlas Ventures LLC'
      },
      {
        name: 'stateName',
        labelAr: 'ولاية التأسيس',
        labelEn: 'State of Formation',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: Wyoming / Delaware',
        placeholderEn: 'e.g. Wyoming / Delaware'
      }
    ],
    relatedPaths: ['/services/compliance', '/services/company-renewal', '/services/registered-agent', '/services/us-llc']
  },
  {
    slug: 'company-renewal',
    path: '/services/company-renewal',
    category: 'compliance',
    categoryLabelAr: 'الامتثال القانوني',
    categoryLabelEn: 'Corporate Compliance',
    titleAr: 'تجديد الشركات السنوي وإدارة الاستمرارية (Company Renewal)',
    titleEn: 'Annual Company Renewal & Continuity Management',
    subtitleAr:
      'باقة تجديد سنوية شاملة تجمع تجديد الوكيل المسجل، سداد التقرير السنوي للولاية، واستخراج شهادة Good Standing في فاتورة واحدة سنوياً.',
    subtitleEn:
      'All-in-one annual company renewal bundling Registered Agent continuity, State Annual Report filing, and Good Standing certification in a single workflow.',
    seoTitleAr: 'خدمة تجديد الشركات الأمريكية والبريطانية السنوي | قبس',
    seoTitleEn: 'Annual US & UK Company Renewal Service | QABS',
    seoDescriptionAr:
      'جدد شركتك الأمريكية أو البريطانية سنوياً دون انقطاع: تجديد الوكيل المسجل، التقرير السنوي للولاية، وتأكيد استمرارية Good Standing.',
    seoDescriptionEn:
      'Keep your US LLC or UK LTD compliant every year with bundled Registered Agent renewal, annual filings, and Good Standing certificates.',
    detailedDescriptionAr: [
      'يخشى كثير من المؤسسين تشتت مواعيد التجديد بين رسوم الوكيل المسجل وتاريخ التقرير السنوي للولاية وتحديث الشركات البريطانية (Confirmation Statement).',
      'صممت قبس خدمة التجديد السنوي الشامل لتوحيد جميع التزامات الاستمرارية لشركتك في مسار واحد مبسط يضمن عدم انقطاع عنوانك القانوني أو توقف سجلك التجاري.'
    ],
    detailedDescriptionEn: [
      'Managing separate renewal dates for Registered Agents, Secretary of State Annual Reports, and UK Confirmation Statements can easily lead to missed deadlines.',
      'QABS unifies your entire annual corporate renewal under one streamlined service so your registered address, state standing, and compliance records remain uninterrupted.'
    ],
    deliveryTimeAr: '1 – 3 أيام عمل للتنفيذ الكامل',
    deliveryTimeEn: '1 – 3 business days for full renewal',
    startingPriceUsd: 165,
    pricingNoteAr: 'تبدأ من $165 لتجديد الوكيل والتقرير السنوي (باستثناء رسم الولاية الحكومي)',
    pricingNoteEn: 'Starts at $165 for Agent + Annual Filing (plus statutory state fees)',
    features: [
      {
        titleAr: 'تجديد الوكيل والعنوان 12 شهراً',
        titleEn: '12-Month Agent & Address Extension',
        descriptionAr: 'استمرار عنوانك القانوني دون تغيير أو انقطاع في استلام البريد الرسمي.',
        descriptionEn: 'Uninterrupted registered address continuity with instant mail scanning.'
      },
      {
        titleAr: 'شمول التقرير السنوي للولاية / بريطانيا',
        titleEn: 'State Report / UK Confirmation Statement',
        descriptionAr: 'تغطية تجديد سجل الولاية الأمريكية أو بيان التأكيد السنوي لـ UK LTD.',
        descriptionEn: 'Covers US State Annual Report or UK Companies House Confirmation Statement.'
      },
      {
        titleAr: 'مراجعة حالة الحساب والبنك',
        titleEn: 'Compliance & Banking Health Check',
        descriptionAr: 'تحديث وثائق التجديد لرفعها عند طلب البنوك أو بوابات الدفع.',
        descriptionEn: 'Updated corporate certificates ready for annual bank KYC checks.'
      },
      {
        titleAr: 'تخفيض التكلفة المجمّعة',
        titleEn: 'Bundled Renewal Savings',
        descriptionAr: 'سعر موفر عند جمع الوكيل المسجل والتقرير السنوي في طلب واحد.',
        descriptionEn: 'Lower combined cost compared to ordering each renewal separately.'
      }
    ],
    benefitsAr: [
      'راحة بال تامة وتفادي أي إغلاق إداري مفاجئ للشركة.',
      'توحيد الفواتير والمستندات السنوية داخل بوابة قبس.',
      'الحفاظ على نفس العنوان الرسمي المرتبط بالبنك وبوابة الدفع.',
      'دعم متواصل لتحديث بيانات الشركاء أو النشاط عند التجديد.'
    ],
    benefitsEn: [
      'Complete peace of mind against accidental administrative dissolution.',
      'Consolidated annual invoicing and renewal records inside QABS.',
      'Maintain the exact statutory address linked to your banking profiles.',
      'Optional director/member updates handled during renewal.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'مراجعة بيانات التجديد',
        titleEn: 'Verify Renewal Scope',
        descriptionAr: 'أدخل اسم الشركة والولاية لنقوم بفحص التزامات التجديد المستحقة.',
        descriptionEn: 'Enter your company name and jurisdiction so we audit upcoming renewal fees.',
        durationAr: 'ساعات قليلة',
        durationEn: 'Few hours'
      },
      {
        stepNumber: '02',
        titleAr: 'تأكيد البيانات والسداد',
        titleEn: 'Confirm Records & Pay',
        descriptionAr: 'راجع بيانات الملاك والعنوان ثم أتمم السداد لبنود التجديد المعتمدة.',
        descriptionEn: 'Confirm current directors/members and settle the renewal invoice.',
        durationAr: '5 دقائق',
        durationEn: '5 mins'
      },
      {
        stepNumber: '03',
        titleAr: 'إتمام التجديد وإصدار الشهادة',
        titleEn: 'Execute Filing & Deliver Proof',
        descriptionAr: 'تجديد الوكيل وتقديم التقرير السنوي وإيداع شهادة التجديد في خزينتك.',
        descriptionEn: 'Extend Agent coverage, file annual reports, and vault your renewal certificates.',
        durationAr: '1 – 3 أيام عمل',
        durationEn: '1 – 3 business days'
      }
    ],
    packages: [
      {
        id: 'ren_us_bundle',
        nameAr: 'باقة التجديد السنوي (US LLC)',
        nameEn: 'US Annual Renewal Bundle',
        priceUsd: 165,
        billingNoteAr: '+ رسم الولاية الحكومي',
        billingNoteEn: '+ state statutory fee',
        descriptionAr: 'تجديد الوكيل المسجل لسنة كاملة + تقديم التقرير السنوي + شهادة حسن سيرة.',
        descriptionEn: '1-year Registered Agent renewal + Annual Report filing + Good Standing.',
        recommended: true,
        featuresAr: [
          'تجديد الوكيل المسجل لمدة 12 شهراً',
          'تجهيز وإيداع التقرير السنوي للولاية',
          'شهادة Good Standing رقمية حديثة',
          'تقويم تنبيهات للعام التالي'
        ],
        featuresEn: [
          '12-month Registered Agent renewal',
          'State Annual Report preparation & filing',
          'Fresh digital Certificate of Good Standing',
          'Next-year compliance tracking'
        ]
      },
      {
        id: 'ren_uk_ltd',
        nameAr: 'باقة تجديد الشركة البريطانية (UK LTD)',
        nameEn: 'UK LTD Annual Renewal',
        priceUsd: 145,
        billingNoteAr: 'تشمل رسوم بيان التأكيد UK',
        billingNoteEn: 'Includes UK Confirmation Statement',
        descriptionAr: 'تجديد المكتب المسجل في لندن + تقديم Confirmation Statement لدى Companies House.',
        descriptionEn: 'London Registered Office extension + Companies House Confirmation Statement.',
        featuresAr: [
          'تمديد المكتب المسجل في بريطانيا 12 شهراً',
          'إيداع Confirmation Statement (CS01)',
          'إدارة إشعارات HMRC والضرائب',
          'نسخة حديثة من سجل الشركة'
        ],
        featuresEn: [
          '12-month UK Registered Office address',
          'Confirmation Statement (CS01) filing',
          'HMRC mail forwarding & scanning',
          'Updated Companies House registry extract'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل يمكنني تجديد شركتي عبر قبس حتى لو لم أؤسسها من خلالكم؟',
        questionEn: 'Can I renew my company through QABS even if formed elsewhere?',
        answerAr: 'نعم بالتأكيد، نقدم خدمة تجديد الشركات ونقل الوكيل المسجل لأي شركة أمريكية أو بريطانية قائمة.',
        answerEn: 'Yes, we support annual renewals and Registered Agent transfers for any existing US or UK company.'
      },
      {
        questionAr: 'ماذا يحدث إذا تأخرت عن موعد التجديد السنوي؟',
        questionEn: 'What happens if my renewal deadline has already passed?',
        answerAr: 'تقوم قبس بفحص الغرامات المتراكمة أولاً ثم تقديم طلب إعادة تفعيل (Reinstatement) لاستعادة الوضع النظامي.',
        answerEn: 'We audit any accumulated late penalties and file an official Reinstatement to restore your company to Good Standing.'
      }
    ],
    formFields: [
      {
        name: 'companyName',
        labelAr: 'اسم الشركة المطلوب تجديدها',
        labelEn: 'Company Name to Renew',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: Qabs Ventures LLC / Atlas UK LTD',
        placeholderEn: 'e.g. Qabs Ventures LLC / Atlas UK LTD'
      },
      {
        name: 'jurisdiction',
        labelAr: 'الدولة / الولاية',
        labelEn: 'Jurisdiction',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: Wyoming أو UK',
        placeholderEn: 'e.g. Wyoming or UK'
      }
    ],
    relatedPaths: ['/services/annual-report', '/services/registered-agent', '/services/compliance', '/services/company-formation']
  }
];
