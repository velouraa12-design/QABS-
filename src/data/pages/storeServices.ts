import { ServicePageData } from '../../types/pages.ts';

export const STORE_SERVICES: ServicePageData[] = [
  {
    slug: 'store-creation',
    path: '/services/store-creation',
    category: 'stores',
    categoryLabelAr: 'المتاجر الإلكترونية',
    categoryLabelEn: 'E-Commerce Stores',
    titleAr: 'إنشاء المتاجر الإلكترونية المستقلة على منصة قبس (QABS Stores)',
    titleEn: 'Standalone E-Commerce Store Creation (QABS Stores)',
    subtitleAr:
      'أطلق متجرك الإلكتروني المستقل بهوية احترافية، دعم كامل للعربية والإنجليزية، ربط النطاقات المخصصة، وتجهيز بوابات الدفع والشحن في بيئة معزولة تماماً.',
    subtitleEn:
      'Launch an independent, high-converting online store with bilingual RTL/LTR support, custom domain SSL, isolated database architecture, and payment gateway readiness.',
    seoTitleAr: 'إنشاء متجر إلكتروني احترافي مستقل | متاجر قبس QABS',
    seoTitleEn: 'Create an Independent Online Store | QABS Stores',
    seoDescriptionAr:
      'أنشئ متجرك الإلكتروني المستقل عبر منصة قبس مع قوالب فاخرة، عزل كامل للبيانات، إدارة المنتجات والطلبات، وربط Stripe و Tap و Moyasar.',
    seoDescriptionEn:
      'Build and launch your standalone e-commerce store on QABS with luxury themes, multi-currency checkout, and integrated shipping & payments.',
    detailedDescriptionAr: [
      'توفر منظومة متاجر قبس (QABS Stores) لكل علامة تجارية بيئة تشغيل مستقلة تماماً (Dedicated Tenant Isolation) تشمل واجهة تسوق سريعة، لوحة إدارة منتجات ومخزون، نظام طلبات وفواتير، واستوديو تصميم مرئي متكامل.',
      'سواء كنت تبيع منتجات مادية أو رقمية محلياً في الخليج أو عالمياً بالدولار واليورو، نُعد متجرك بالكامل جاهزاً لاستقبال الطلبات من اليوم الأول.'
    ],
    detailedDescriptionEn: [
      'QABS Stores provides every brand with a strictly isolated commerce environment featuring a fast storefront, product & inventory manager, invoicing engine, and visual Studio designer.',
      'Whether selling physical products regionally or digital subscriptions globally, we deliver a production-ready storefront configured for conversion from day one.'
    ],
    deliveryTimeAr: 'تجهيز فوري خلال 24 – 72 ساعة',
    deliveryTimeEn: 'Ready to launch within 24 – 72 hours',
    startingPriceUsd: 29,
    pricingNoteAr: 'باقات اشتراك شهرية أو سنوية شاملة الاستضافة والشهادة الأمنية SSL',
    pricingNoteEn: 'Monthly or annual plans including hosting & SSL security',
    features: [
      {
        titleAr: 'بيئة معزولة لكل متجر',
        titleEn: 'Strict Multi-Tenant Isolation',
        descriptionAr: 'قاعدة بيانات منتجات وطلبات وعملاء وإعدادات مستقلة تماماً لكل متجر.',
        descriptionEn: 'Complete isolation of products, orders, customers, and analytics per store.'
      },
      {
        titleAr: 'ثنائية اللغة RTL / LTR',
        titleEn: 'Native Arabic & English Storefront',
        descriptionAr: 'عرض متقن باللغتين العربية والإنجليزية مع تحويل تلقائي للعملات.',
        descriptionEn: 'Seamless RTL Arabic and LTR English storefront with multi-currency support.'
      },
      {
        titleAr: 'استوديو التصميم المرئي (QABS Studio)',
        titleEn: 'Visual QABS Studio Designer',
        descriptionAr: 'تخصيص الأقسام والألوان والخطوط وحفظ نسخ التصميم (Snapshots) بمرونة.',
        descriptionEn: 'Customize storefront sections, palettes, typography, and save design snapshots.'
      },
      {
        titleAr: 'جاهزية الدفع والشحن والضرائب',
        titleEn: 'Payments, Shipping & VAT Ready',
        descriptionAr: 'ربط مناطق الشحن، حساب الضريبة المضافة، وتجهيز بوابات الدفع المعتمدة.',
        descriptionEn: 'Built-in shipping zones, VAT configuration, and verified gateway integration.'
      }
    ],
    benefitsAr: [
      'إطلاق سريع دون الحاجة لخبرة برمجية أو استضافة خارجية معقدة.',
      'نطاق فرعي فوري مجاني مع إمكانية ربط الدومين الخاص (مثل yourbrand.com).',
      'تكامل مباشر مع ملف الشركة الأمريكية وبوابات الدفع في نفس الحساب.',
      'تتبع مباشر للمخزون، الكوبونات، العملاء، والفواتير الضريبية.'
    ],
    benefitsEn: [
      'Launch rapidly without managing servers, plugins, or security patches.',
      'Instant subdomain plus full custom domain CNAME & SSL support.',
      'Unified with your QABS corporate formation and banking workspace.',
      'Built-in inventory alerts, discount coupons, CRM, and invoicing.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'اختيار الباقة والقالب',
        titleEn: 'Choose Plan & Theme',
        descriptionAr: 'حدد باقة المتجر المناسبة واسم العلامة التجارية والعملة الأساسية.',
        descriptionEn: 'Select your store subscription tier, brand name, and base currency.',
        durationAr: '5 دقائق',
        durationEn: '5 mins'
      },
      {
        stepNumber: '02',
        titleAr: 'بناء الصفحات ورفع المنتجات',
        titleEn: 'Storefront Setup & Catalog',
        descriptionAr: 'تهيئة الصفحة الرئيسية، سياسات المتجر، ورفع المنتجات الأولى والأسعار.',
        descriptionEn: 'Configure hero sections, policy pages, and import your initial product catalog.',
        durationAr: '1 – 2 يوم',
        durationEn: '1 – 2 days'
      },
      {
        stepNumber: '03',
        titleAr: 'اعتماد النشر والدفع والانطلاق',
        titleEn: 'Approval, Gateways & Go Live',
        descriptionAr: 'مراجعة الجاهزية عبر إدارة قبس، تفعيل بوابة الدفع والنطاق وبدء البيع.',
        descriptionEn: 'Complete QABS governance review, activate payments & domain, and start selling.',
        durationAr: 'خلال 24 ساعة',
        durationEn: 'Within 24h'
      }
    ],
    packages: [
      {
        id: 'store_starter',
        nameAr: 'باقة الانطلاق (Starter Store)',
        nameEn: 'Starter Store',
        priceUsd: 29,
        billingNoteAr: 'شهرياً — حتى 50 منتجاً',
        billingNoteEn: 'Per month — up to 50 products',
        descriptionAr: 'مناسبة للمتاجر الناشئة والمنتجات الرقمية الأولى مع متجر مستقل واحد.',
        descriptionEn: 'Built for emerging brands and initial digital or physical catalogs.',
        featuresAr: [
          'متجر إلكتروني مستقل واحد',
          'إدارة حتى 50 منتجاً',
          'دعم العربية والإنجليزية + شهادة SSL',
          'تجهيز بوابات الدفع المحلية والعالمية'
        ],
        featuresEn: [
          '1 independent QABS store instance',
          'Up to 50 active products',
          'Bilingual storefront & SSL included',
          'Payment gateway readiness'
        ]
      },
      {
        id: 'store_growth',
        nameAr: 'باقة النمو (Growth Store)',
        nameEn: 'Growth Store',
        priceUsd: 79,
        billingNoteAr: 'شهرياً — حتى 5 متاجر و 500 منتج',
        billingNoteEn: 'Per month — up to 5 stores & 500 products',
        descriptionAr: 'الأكثر طلباً للتجار المتوسعين، تشمل تعدد المتاجر وعمولة 0.5% فقط.',
        descriptionEn: 'Most popular for scaling merchants with multi-store access and 0.5% fee.',
        recommended: true,
        featuresAr: [
          'إدارة حتى 5 متاجر مستقلة',
          'حتى 500 منتج وتقارير مبيعات متقدمة',
          'ربط Shopify Admin API + قبس AI',
          'ربط النطاق المخصص وأولوية الدعم'
        ],
        featuresEn: [
          'Up to 5 isolated online stores',
          'Up to 500 products & advanced analytics',
          'Shopify Admin API sync + QABS AI',
          'Custom domain SSL & priority support'
        ]
      },
      {
        id: 'store_enterprise',
        nameAr: 'باقة المؤسسات (Enterprise)',
        nameEn: 'Enterprise Commerce',
        priceUsd: 199,
        billingNoteAr: 'شهرياً — بدون عمولة منصة 0%',
        billingNoteEn: 'Per month — 0% platform commission',
        descriptionAr: 'متاجر ومنتجات غير محدودة، صلاحيات فريق متقدمة، وتسوية بالعملات الرقمية.',
        descriptionEn: 'Unlimited stores & products, granular staff RBAC, and crypto settlement.',
        featuresAr: [
          'عدد غير محدود من المتاجر والمنتجات',
          '0% عمولة مبيعات على المنصة',
          'صلاحيات فريق عمل وصلاحيات دقيقة',
          'تسوية USDT/BTC ودعم فني مخصص'
        ],
        featuresEn: [
          'Unlimited stores and product SKUs',
          '0% platform transaction commission',
          'Granular team RBAC permissions',
          'Crypto settlement & dedicated account manager'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل أمتلك بيانات عملائي ومنتجاتي بالكامل؟',
        questionEn: 'Do I own 100% of my store customer and product data?',
        answerAr: 'نعم، كل متجر في قبس معزول ببياناته الخاصة ويمكنك تصدير نسخة احتياطية كاملة بصيغة JSON أو CSV في أي وقت.',
        answerEn: 'Yes, every QABS store is strictly isolated and you can export complete JSON or CSV backups at any time.'
      },
      {
        questionAr: 'هل يمكنني ربط دومين خاص بي مثل mybrand.com؟',
        questionEn: 'Can I connect my own custom domain like mybrand.com?',
        answerAr: 'نعم، يدعم النظام ربط الدومينات المخصصة عبر سجلات CNAME مع إصدار شهادة SSL تلقائياً بعد التحقق.',
        answerEn: 'Yes, custom domains are supported via CNAME verification with automatic SSL provisioning.'
      }
    ],
    formFields: [
      {
        name: 'storeName',
        labelAr: 'اسم المتجر المقترح',
        labelEn: 'Proposed Store Name',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: متجر نخبة العود',
        placeholderEn: 'e.g. Royal Oud Boutique'
      },
      {
        name: 'productType',
        labelAr: 'نوع المنتجات',
        labelEn: 'Product Category',
        type: 'select',
        required: true,
        options: [
          { value: 'Physical Products', labelAr: 'منتجات مادية وشحن', labelEn: 'Physical Goods & Shipping' },
          { value: 'Digital Products', labelAr: 'منتجات وخدمات رقمية', labelEn: 'Digital Products & Subscriptions' },
          { value: 'Hybrid', labelAr: 'كلاهما (مادي + رقمي)', labelEn: 'Hybrid (Physical + Digital)' }
        ]
      }
    ],
    relatedPaths: ['/services/store-management', '/services/multi-store', '/services/store-development', '/services/payment-gateways']
  },
  {
    slug: 'store-management',
    path: '/services/store-management',
    category: 'stores',
    categoryLabelAr: 'المتاجر الإلكترونية',
    categoryLabelEn: 'E-Commerce Stores',
    titleAr: 'إدارة وتشغيل المتاجر الإلكترونية المتكاملة',
    titleEn: 'Full-Service E-Commerce Store Operations & Management',
    subtitleAr:
      'دع فريق قبس يتولى التشغيل اليومي لمتجرك: تحديث الكتالوج والمخزون، متابعة الطلبات والشحن، إدارة العروض، وتقارير الأداء الشهرية.',
    subtitleEn:
      'Outsource your daily e-commerce operations to QABS specialists: catalog updates, order fulfillment coordination, promotional campaigns, and KPI reporting.',
    seoTitleAr: 'إدارة وتشغيل المتاجر الإلكترونية باحترافية | قبس',
    seoTitleEn: 'Managed E-Commerce Store Operations | QABS',
    seoDescriptionAr:
      'خدمة إدارة المتاجر الإلكترونية الشاملة: رفع وتنسيق المنتجات، إدارة المخزون والطلبات، تحسين التحويلات، وتقارير الأداء الدورية.',
    seoDescriptionEn:
      'Dedicated e-commerce management covering product merchandising, inventory control, fulfillment workflows, and conversion optimization.',
    detailedDescriptionAr: [
      'نمو المتجر الإلكتروني يتطلب متابعة يومية دقيقة لتحديث الأسعار، وضبط المخزون، ومعالجة طلبات العملاء، وتحديث العروض الموسمية.',
      'توفر قبس فريق تشغيل متخصص يدير متجرك على منصة قبس أو شوبيفاي بأعلى معايير الجودة، مع تقارير واضحة وصلاحيات تحكم شفافة.'
    ],
    detailedDescriptionEn: [
      'Scaling an online brand demands consistent daily attention to merchandising, stock accuracy, order workflows, and seasonal promotions.',
      'QABS assigns experienced e-commerce operators to manage your QABS or Shopify store transparently, delivering weekly execution logs and monthly growth reports.'
    ],
    deliveryTimeAr: 'بدء التشغيل خلال 48 ساعة من التعاقد',
    deliveryTimeEn: 'Operations start within 48 hours',
    startingPriceUsd: 249,
    pricingNoteAr: 'باقات إدارة شهرية مرنة بدون التزامات طويلة الأمد',
    pricingNoteEn: 'Flexible monthly retainers with no long-term lock-in',
    features: [
      {
        titleAr: 'إدارة الكتالوج والأسعار والـ SEO',
        titleEn: 'Catalog & Product SEO',
        descriptionAr: 'كتابة أوصاف بيعية مقنعة باللغتين وتحديث الصور والباركود والمتغيرات.',
        descriptionEn: 'Persuasive bilingual product copy, SKU variants, and search-ready metadata.'
      },
      {
        titleAr: 'متابعة الطلبات وتكامل الشحن',
        titleEn: 'Order & Fulfillment Oversight',
        descriptionAr: 'متابعة حالة الطلبات، أرقام التتبع، ومعالجة الاسترجاعات بمهنية.',
        descriptionEn: 'End-to-end order tracking, courier label coordination, and return handling.'
      },
      {
        titleAr: 'إدارة الخصومات وحملات المواسم',
        titleEn: 'Promotions & Seasonal Campaigns',
        descriptionAr: 'إعداد أكواد الخصم والبنرات الترويجية في المواسم والأعياد.',
        descriptionEn: 'Configure coupon rules, bundle deals, and seasonal promotional banners.'
      },
      {
        titleAr: 'تقارير أرباح ومخزون أسبوعية',
        titleEn: 'Weekly Performance & Stock Audits',
        descriptionAr: 'تقارير واضحة لأكثر المنتجات مبيعاً وتنبيهات إعادة التوريد.',
        descriptionEn: 'Actionable reports on top-selling SKUs, margins, and restock thresholds.'
      }
    ],
    benefitsAr: [
      'توفير وقتك للتفرغ للتوريد وبناء العلامة التجارية والتوسع.',
      'تقليل أخطاء التسعير ونفاد المخزون المفاجئ.',
      'رفع معدل إتمام الطلبات بفضل واجهة متجر محدثة باستمرار.',
      'ربط مباشر مع خدمة العملاء والتذاكر داخل قبس.'
    ],
    benefitsEn: [
      'Free up founder bandwidth for sourcing, partnerships, and brand growth.',
      'Eliminate pricing mistakes and unexpected stockouts.',
      'Improve checkout conversion through continually refreshed merchandising.',
      'Seamless escalation into QABS support & order desks.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'تدقيق المتجر وتحديد المهام',
        titleEn: 'Store Audit & Scope Setup',
        descriptionAr: 'تحليل وضع المتجر الحالي، عدد المنتجات، ومستوى الطلبات الشهري.',
        descriptionEn: 'Assess your current catalog size, platforms, and monthly order volume.',
        durationAr: 'يوم عمل واحد',
        durationEn: '1 business day'
      },
      {
        stepNumber: '02',
        titleAr: 'منح الصلاحيات وتنظيم التشغيل',
        titleEn: 'Access & SOP Alignment',
        descriptionAr: 'تحديد صلاحيات مدير التشغيل وإعداد جدول المهام الأسبوعي.',
        descriptionEn: 'Set scoped staff permissions and align weekly operational workflows.',
        durationAr: '24 ساعة',
        durationEn: '24 hours'
      },
      {
        stepNumber: '03',
        titleAr: 'التشغيل المستمر والتقارير',
        titleEn: 'Continuous Execution & Reporting',
        descriptionAr: 'تنفيذ التحديثات اليومية وإصدار تقارير الأداء والنتائج الدورية.',
        descriptionEn: 'Daily catalog & order execution paired with structured KPI reporting.',
        durationAr: 'شهري مستمر',
        durationEn: 'Ongoing monthly'
      }
    ],
    packages: [
      {
        id: 'sm_ops_core',
        nameAr: 'إدارة المتجر الأساسية',
        nameEn: 'Core Store Management',
        priceUsd: 249,
        billingNoteAr: 'شهرياً — حتى 100 منتج',
        billingNoteEn: 'Per month — up to 100 SKUs',
        descriptionAr: 'تحديث المنتجات والأسعار، متابعة المخزون، وتجهيز أكواد الخصم والبنرات.',
        descriptionEn: 'Catalog updates, stock checks, discount setup, and weekly reporting.',
        featuresAr: [
          'إدارة وتحديث حتى 100 منتج',
          'مراجعة يومية لحالة الطلبات والشحن',
          'إعداد حملتين ترويجيتين شهرياً',
          'تقرير أداء شهري مفصل'
        ],
        featuresEn: [
          'Up to 100 active SKUs managed',
          'Daily order & shipping status monitoring',
          '2 promotional campaign setups/month',
          'Detailed monthly KPI summary'
        ]
      },
      {
        id: 'sm_ops_pro',
        nameAr: 'الإدارة التنفيذية المتقدمة',
        nameEn: 'Executive Store Operations',
        priceUsd: 499,
        billingNoteAr: 'شهرياً — حتى 500 منتج + تحسين تحويلات',
        billingNoteEn: 'Per month — up to 500 SKUs + CRO',
        descriptionAr: 'إدارة متكاملة للكتالوج، المزامنة مع الموردين وShopify، وتحسين معدل التحويل.',
        descriptionEn: 'Full catalog operations, supplier/Shopify sync, and conversion rate tuning.',
        recommended: true,
        featuresAr: [
          'إدارة حتى 500 منتج ومتغيراتها',
          'تحسين صفحات المنتجات ومعدل التحويل CRO',
          'تنسيق يومي للشحن والمرتجعات',
          'تقارير أسبوعية واجتماع متابعة'
        ],
        featuresEn: [
          'Up to 500 SKUs & complex variants',
          'Product page CRO & SEO optimization',
          'Daily fulfillment & refund coordination',
          'Weekly KPI reports & strategy sync'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل تديرون متاجر Shopify إلى جانب متاجر قبس؟',
        questionEn: 'Do you manage Shopify stores as well as QABS Stores?',
        answerAr: 'نعم، يدعم فريقنا إدارة متاجر قبس ومتاجر Shopify مع إمكانية المزامنة التلقائية عبر Shopify Admin API.',
        answerEn: 'Yes, our operations team manages both QABS Stores and Shopify storefronts, including Admin API synchronization.'
      },
      {
        questionAr: 'كيف أضمن أمان حسابي وصلاحيات الموظفين؟',
        questionEn: 'How are account security and staff permissions controlled?',
        answerAr: 'يتم منح صلاحيات محددة ومقيدة (مثل تحديث المخزون وتجهيز الطلبات فقط) دون منح صلاحيات السحب البنكي أو ملكية الحساب.',
        answerEn: 'Access is strictly scoped to operational permissions (catalog, inventory, orders) without granting payout or ownership privileges.'
      }
    ],
    formFields: [
      {
        name: 'platformType',
        labelAr: 'منصة المتجر الحالية',
        labelEn: 'Store Platform',
        type: 'select',
        required: true,
        options: [
          { value: 'QABS Stores', labelAr: 'متاجر قبس (QABS Stores)', labelEn: 'QABS Stores' },
          { value: 'Shopify', labelAr: 'شوبيفاي (Shopify)', labelEn: 'Shopify' },
          { value: 'WooCommerce', labelAr: 'ووكومرس (WooCommerce)', labelEn: 'WooCommerce' }
        ]
      },
      {
        name: 'monthlyOrders',
        labelAr: 'متوسط الطلبات الشهرية',
        labelEn: 'Estimated Monthly Orders',
        type: 'text',
        required: false,
        placeholderAr: 'مثال: 150 طلب شهرياً',
        placeholderEn: 'e.g. 150 orders/month'
      }
    ],
    relatedPaths: ['/services/store-creation', '/services/multi-store', '/services/store-development', '/services/ai-solutions']
  },
  {
    slug: 'multi-store',
    path: '/services/multi-store',
    category: 'stores',
    categoryLabelAr: 'المتاجر الإلكترونية',
    categoryLabelEn: 'E-Commerce Stores',
    titleAr: 'منظومة إدارة المتاجر المتعددة (Multi-Store Enterprise)',
    titleEn: 'Multi-Store & Multi-Brand Management Architecture',
    subtitleAr:
      'شغّل عدة علامات تجارية أو متاجر إقليمية بعملات ولغات ونطاقات مستقلة من لوحة تحكم مركزية واحدة مع عزل كامل لبيانات كل متجر.',
    subtitleEn:
      'Operate multiple brands or regional storefronts with independent currencies, domains, and themes from one unified QABS control tower.',
    seoTitleAr: 'منظومة المتاجر المتعددة Multi-Store | منصة قبس QABS',
    seoTitleEn: 'Multi-Store E-Commerce Management | QABS Platform',
    seoDescriptionAr:
      'أدر عدة متاجر إلكترونية وعلامات تجارية مستقلة من حساب واحد في قبس: عزل تام للبيانات، عملات متعددة، وفواتير وتقارير موحدة.',
    seoDescriptionEn:
      'Scale multiple brands or country storefronts simultaneously with strict tenant isolation, localized currencies, and unified analytics.',
    detailedDescriptionAr: [
      'عندما تتوسع العلامة التجارية لأكثر من سوق (مثلاً متجر بالريال للسعودية، ومتجر بالدولار لأمريكا وأوروبا، أو عدة علامات متخصصة)، تصبح إدارة الحسابات المنفصلة عبئاً تشغيلياً.',
      'تتيح بنية المتاجر المتعددة في قبس التبديل الفوري بين المتاجر من شريط علوي واحد، مع ضمان عزل تام للمنتجات والعملاء والطلبات وبوابات الدفع لكل متجر على حدة.'
    ],
    detailedDescriptionEn: [
      'When expanding across regions or launching sub-brands—such as a SAR storefront for Saudi Arabia and a USD storefront for the US—juggling disconnected logins slows your team down.',
      'QABS Multi-Store lets you switch seamlessly across isolated storefronts from one console, maintaining strict per-store separation of products, orders, domains, and payment gateways.'
    ],
    deliveryTimeAr: 'تفعيل فوري للمحفظة متعددة المتاجر',
    deliveryTimeEn: 'Instant multi-store workspace provisioning',
    startingPriceUsd: 79,
    pricingNoteAr: 'متاحة ابتداءً من باقة النمو (5 متاجر) أو باقة المؤسسات (متاجر غير محدودة)',
    pricingNoteEn: 'Available from Growth plan (5 stores) or Enterprise (unlimited)',
    features: [
      {
        titleAr: 'تبديل فوري بين المتاجر',
        titleEn: 'Instant Store Switcher',
        descriptionAr: 'انتقل بين أي متجر وآخر بنقرة واحدة مع تحديث فوري لكافة القوائم والبيانات.',
        descriptionEn: 'Switch between storefronts in one click with zero session re-authentication.'
      },
      {
        titleAr: 'عملات وضرائب ولغات مستقلة',
        titleEn: 'Localized Currency & Tax Rules',
        descriptionAr: 'تخصيص العملة (SAR / USD / GBP / AED) ونسبة الضريبة وبوابة الدفع لكل متجر.',
        descriptionEn: 'Configure distinct currencies, VAT rates, and payment gateways per storefront.'
      },
      {
        titleAr: 'تكرار القوالب والتصاميم (Cloning)',
        titleEn: 'Template & Snapshot Replication',
        descriptionAr: 'استنساخ هيكل تصميم ناجح لمتجر جديد وإطلاقه في دقائق.',
        descriptionEn: 'Replicate proven storefront layouts and page templates across new launches.'
      },
      {
        titleAr: 'تقارير مقارنة مجمّعة',
        titleEn: 'Consolidated Portfolio Analytics',
        descriptionAr: 'رؤية شاملة لإجمالي المبيعات عبر جميع المتاجر مع تفصيل أداء كل متجر.',
        descriptionEn: 'Compare revenue, conversion, and order velocity across your entire store portfolio.'
      }
    ],
    benefitsAr: [
      'إدارة عدة علامات تجارية بتكلفة اشتراك موحدة واقتصادية.',
      'استهداف أسواق دولية متعددة بنطاقات محلية (sa / com / uk).',
      'منع تداخل بيانات العملاء أو الطلبات بين العلامات المختلفة.',
      'توزيع صلاحيات فريق العمل على متجر محدد أو جميع المتاجر.'
    ],
    benefitsEn: [
      'Run multiple brands under a single consolidated billing plan.',
      'Localize domains, languages, and pricing per target country.',
      'Guaranteed data isolation between distinct brand customer lists.',
      'Assign team members to specific stores or portfolio-wide roles.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'تفعيل باقة المتاجر المتعددة',
        titleEn: 'Select Multi-Store Tier',
        descriptionAr: 'اختر باقة النمو (حتى 5 متاجر) أو المؤسسات (غير محدود).',
        descriptionEn: 'Choose Growth (up to 5 stores) or Enterprise (unlimited stores).',
        durationAr: 'فوري',
        durationEn: 'Instant'
      },
      {
        stepNumber: '02',
        titleAr: 'تجهيز بنية المتاجر والنطاقات',
        titleEn: 'Provision Stores & Domains',
        descriptionAr: 'إنشاء المتاجر الفرعية أو ربط الدومينات المستقلة لكل متجر.',
        descriptionEn: 'Initialize each store entity, currency, language, and custom domain.',
        durationAr: '24 – 48 ساعة',
        durationEn: '24 – 48 hours'
      },
      {
        stepNumber: '03',
        titleAr: 'توزيع المنتجات والصلاحيات',
        titleEn: 'Assign Catalogs & Team Access',
        descriptionAr: 'تفعيل بوابات الدفع المعتمدة وتوزيع صلاحيات المشرفين على كل متجر.',
        descriptionEn: 'Connect payment gateways per store and assign scoped staff access.',
        durationAr: 'يوم عمل واحد',
        durationEn: '1 business day'
      }
    ],
    packages: [
      {
        id: 'ms_growth',
        nameAr: 'منظومة النمو (حتى 5 متاجر)',
        nameEn: 'Multi-Store Growth (5 Stores)',
        priceUsd: 79,
        billingNoteAr: 'شهرياً — تشمل قبس AI و Shopify Sync',
        billingNoteEn: 'Per month — incl. QABS AI & Shopify Sync',
        descriptionAr: 'مثالية للتجار الذين يديرون من 2 إلى 5 متاجر إقليمية أو متخصصة.',
        descriptionEn: 'Ideal for merchants operating 2 to 5 regional or niche brands.',
        recommended: true,
        featuresAr: [
          'إنشاء وإدارة حتى 5 متاجر مستقلة',
          'حتى 500 منتج وعزل كامل للبيانات',
          'مزامنة Shopify Admin API',
          'نطاق مخصص وشهادة SSL لكل متجر'
        ],
        featuresEn: [
          'Run up to 5 independent stores',
          '500 SKUs with strict tenant isolation',
          'Shopify Admin API synchronization',
          'Custom domain & SSL per storefront'
        ]
      },
      {
        id: 'ms_enterprise',
        nameAr: 'منظومة المؤسسات (غير محدود)',
        nameEn: 'Multi-Store Enterprise (Unlimited)',
        priceUsd: 199,
        billingNoteAr: 'شهرياً — متاجر ومنتجات غير محدودة',
        billingNoteEn: 'Per month — unlimited stores & SKUs',
        descriptionAr: 'للمجموعات التجارية والوكالات التي تدير عدداً مفتوحاً من المتاجر بدون عمولة منصة.',
        descriptionEn: 'Built for holding groups and agencies scaling unlimited stores at 0% fee.',
        featuresAr: [
          'عدد غير محدود من المتاجر والمنتجات',
          '0% عمولة مبيعات على جميع المتاجر',
          'لوحة قياس موحدة وصلاحيات RBAC متقدمة',
          'دعم العملات الرقمية وتسوية متعددة الحسابات'
        ],
        featuresEn: [
          'Unlimited stores and product catalogs',
          '0% platform commission across all stores',
          'Portfolio KPI board & granular RBAC',
          'Multi-account settlement & crypto options'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل يمكن أن يكون لكل متجر بوابة دفع وعملة مختلفة؟',
        questionEn: 'Can each store use a different payment gateway and currency?',
        answerAr: 'نعم، يمكنك ربط Stripe بالدولار لمتجرك الدولي وربط Tap أو Moyasar بالريال لمتجرك السعودي بشكل مستقل تماماً.',
        answerEn: 'Yes, you can run USD Stripe on your global store and SAR Tap/Moyasar on your Saudi store independently.'
      },
      {
        questionAr: 'هل تظهر منتجات متجر معين في متجر آخر؟',
        questionEn: 'Do products from one store leak into another store?',
        answerAr: 'لا مطلقاً، جميع الكيانات مرتبطة بمعرف المتجر (storeId) ولا تختلط المنتجات أو الطلبات أو العملاء بين المتاجر.',
        answerEn: 'Never. Every catalog item, order, and customer record is strictly scoped by storeId.'
      }
    ],
    formFields: [
      {
        name: 'storesCount',
        labelAr: 'عدد المتاجر المطلوب إطلاقها',
        labelEn: 'Number of Stores Needed',
        type: 'select',
        required: true,
        options: [
          { value: '2-3 Stores', labelAr: '2 إلى 3 متاجر', labelEn: '2 – 3 Stores' },
          { value: '4-5 Stores', labelAr: '4 إلى 5 متاجر', labelEn: '4 – 5 Stores' },
          { value: '6+ Unlimited', labelAr: 'أكثر من 6 متاجر (باقة المؤسسات)', labelEn: '6+ Stores (Enterprise)' }
        ]
      },
      {
        name: 'targetMarkets',
        labelAr: 'الأسواق والعملات المستهدفة',
        labelEn: 'Target Regions & Currencies',
        type: 'text',
        required: true,
        placeholderAr: 'مثال: السعودية (SAR) وأمريكا (USD)',
        placeholderEn: 'e.g. Saudi Arabia (SAR) & US (USD)'
      }
    ],
    relatedPaths: ['/services/store-creation', '/services/store-management', '/services/payment-integration', '/pricing']
  },
  {
    slug: 'store-development',
    path: '/services/store-development',
    category: 'stores',
    categoryLabelAr: 'المتاجر الإلكترونية',
    categoryLabelEn: 'E-Commerce Stores',
    titleAr: 'تطوير وتخصيص المتاجر الإلكترونية المتقدم',
    titleEn: 'Custom Storefront Development & UX Engineering',
    subtitleAr:
      'تصميم وبرمجة واجهات متاجر فاخرة، صفحات هبوط عالية التحويل، تكاملات برمجية مع Shopify والأنظمة المحاسبية، وتحسين السرعة.',
    subtitleEn:
      'Bespoke storefront UI engineering, high-converting landing pages, custom Shopify/API integrations, and Core Web Vitals speed optimization.',
    seoTitleAr: 'تطوير وتخصيص المتاجر الإلكترونية UI/UX | قبس',
    seoTitleEn: 'Custom E-Commerce Store Development & APIs | QABS',
    seoDescriptionAr:
      'خدمات تطوير وتخصيص المتاجر الإلكترونية: تصميم قوالب حصرية، برمجة أقسام تفاعلية، ربط Shopify API، وتحسين تجربة المشتري وسرعة المتجر.',
    seoDescriptionEn:
      'Bespoke storefront engineering, theme customization, headless commerce sections, and ERP/Shopify API integrations.',
    detailedDescriptionAr: [
      'عندما تتجاوز علامتك التجارية القوالب الجاهزة وتحتاج إلى تجربة تسوق فريدة تعكس هويتك وتزيد متوسط قيمة السلة (AOV)، يتدخل فريق تطوير المتاجر في قبس.',
      'نصمم ونطور أقساماً مخصصة (Custom Sections)، وتجارب عرض منتجات تفاعلية، وتكاملات برمجية مع مستودعات الشحن وShopify Admin API وأدوات التحليلات.'
    ],
    detailedDescriptionEn: [
      'When your brand outgrows off-the-shelf templates and needs a signature shopping experience that elevates average order value, our storefront engineers step in.',
      'We build custom interactive product showcases, localized checkout enhancements, and direct API bridges to fulfillment warehouses, ERPs, and Shopify Admin.'
    ],
    deliveryTimeAr: '5 – 14 يوم عمل حسب نطاق التطوير',
    deliveryTimeEn: '5 – 14 business days based on scope',
    startingPriceUsd: 390,
    pricingNoteAr: 'تُحدد التكلفة النهائية حسب عدد الصفحات والتكاملات البرمجية المطلوبة',
    pricingNoteEn: 'Final scope priced per custom sections and API integrations',
    features: [
      {
        titleAr: 'تصميم واجهة متجر مخصصة (UI/UX)',
        titleEn: 'Bespoke Storefront UI/UX',
        descriptionAr: 'تصميم حصري يعكس هوية علامتك بتناسق كامل بين الجوال وسطح المكتب.',
        descriptionEn: 'Signature storefront design engineered for mobile-first conversion.'
      },
      {
        titleAr: 'أقسام ومكونات تفاعلية مخصصة',
        titleEn: 'Custom Interactive Sections',
        descriptionAr: 'بناء حاسبات باقات، مقارنات منتجات، وسلال شراء ذكية لرفع المبيعات.',
        descriptionEn: 'Bundle builders, product comparators, and slide-out upsell carts.'
      },
      {
        titleAr: 'تكامل API ومزامنة المخزون',
        titleEn: 'API & Warehouse Integrations',
        descriptionAr: 'ربط برمجي مع Shopify Admin API، وشركات الشحن، وبرامج الفوترة.',
        descriptionEn: 'Direct API bridges for Shopify Admin, 3PL couriers, and accounting.'
      },
      {
        titleAr: 'تحسين السرعة وتهيئة SEO',
        titleEn: 'Speed & Technical SEO Optimization',
        descriptionAr: 'تقليل وقت التحميل، ضغط الوسائط، وبناء بيانات Schema للمنتجات.',
        descriptionEn: 'Sub-second load tuning, asset optimization, and Product JSON-LD markup.'
      }
    ],
    benefitsAr: [
      'رفع معدل التحويل (Conversion Rate) بفضل تجربة شراء سلسة وسريعة.',
      'تمييز علامتك التجارية بصرياً عن المتاجر التقليدية المكررة.',
      'أتمتة تدفق الطلبات بين المتجر والمستودع دون تدخل يدوي.',
      'جاهزية كاملة للعمل باللغتين العربية RTL والإنجليزية LTR.'
    ],
    benefitsEn: [
      'Higher checkout conversion via frictionless, fast-loading UX.',
      'Distinct visual authority separating your brand from generic templates.',
      'Automated order sync between storefront and warehouse teams.',
      'Built cleanly for bilingual RTL and LTR storefronts.'
    ],
    steps: [
      {
        stepNumber: '01',
        titleAr: 'تحليل المتطلبات وتجربة المستخدم',
        titleEn: 'Discovery & UX Wireframing',
        descriptionAr: 'دراسة هوية العلامة، الصفحات المطلوبة، والتكاملات التقنية اللازمة.',
        descriptionEn: 'Define target conversion flows, visual layouts, and API specifications.',
        durationAr: '2 يوم عمل',
        durationEn: '2 business days'
      },
      {
        stepNumber: '02',
        titleAr: 'التطوير وبناء القالب المخصص',
        titleEn: 'Engineering & Theme Build',
        descriptionAr: 'برمجة الواجهة المتجاوبة وربط الأقسام في بيئة المعاينة.',
        descriptionEn: 'Develop responsive React/Liquid modules and test in staging.',
        durationAr: '4 – 8 أيام عمل',
        durationEn: '4 – 8 business days'
      },
      {
        stepNumber: '03',
        titleAr: 'اختبار الأداء والنشر الرسمي',
        titleEn: 'QA Audit & Production Launch',
        descriptionAr: 'اختبار الدفع والشحن على الجوال والكمبيوتر وتسليم التعديلات النهائية.',
        descriptionEn: 'Cross-device checkout QA and seamless production deployment.',
        durationAr: '2 يوم عمل',
        durationEn: '2 business days'
      }
    ],
    packages: [
      {
        id: 'sd_ui_custom',
        nameAr: 'باقة تخصيص الواجهة الاحترافية',
        nameEn: 'Pro Theme & UI Customization',
        priceUsd: 390,
        billingNoteAr: 'لمرة واحدة — تسليم خلال 5-7 أيام',
        billingNoteEn: 'One-time — 5-7 day delivery',
        descriptionAr: 'تخصيص الصفحة الرئيسية وصفحة المنتج وإعدادات الألوان والخطوط لمتجر قبس أو شوبيفاي.',
        descriptionEn: 'Custom homepage, product page layout, and brand system styling.',
        featuresAr: [
          'تصميم صفحة رئيسية مخصصة عالية التحويل',
          'تحسين صفحة المنتج وسلة التسوق',
          'تهيئة اللغة العربية RTL والإنجليزية LTR',
          'تحسين سرعة التحميل على الجوال'
        ],
        featuresEn: [
          'Custom high-converting homepage design',
          'Optimized product & cart drawer UX',
          'Bilingual RTL/LTR layout precision',
          'Mobile performance & Core Web Vitals tuning'
        ]
      },
      {
        id: 'sd_full_eng',
        nameAr: 'باقة التطوير والتكامل المتقدم',
        nameEn: 'Custom Store Engineering & APIs',
        priceUsd: 890,
        billingNoteAr: 'لمرة واحدة — تصميم حصري + تكاملات',
        billingNoteEn: 'One-time — bespoke UI + APIs',
        descriptionAr: 'بناء واجهة متجر حصرية بالكامل مع ربط API وShopify وبوابات الدفع والشحن.',
        descriptionEn: 'Full bespoke storefront build with custom interactive modules and API sync.',
        recommended: true,
        featuresAr: [
          'تصميم وبرمجة واجهة متجر حصرية كاملة',
          'بناء صفحات هبوط ومقارنات منتجات مخصصة',
          'ربط برمجي مع Shopify Admin / ERP / الشحن',
          'تدقيق أمني واختبار شامل + ضمان 30 يوماً'
        ],
        featuresEn: [
          'Full bespoke storefront UI engineering',
          'Custom landing pages & bundle builders',
          'Shopify Admin / ERP / courier API integration',
          'Full QA testing + 30-day warranty support'
        ]
      }
    ],
    faqs: [
      {
        questionAr: 'هل يشمل التطوير كلاً من متاجر قبس ومنصة Shopify؟',
        questionEn: 'Do you develop for both QABS Stores and Shopify?',
        answerAr: 'نعم، نطور واجهات مخصصة داخل استوديو قبس، كما نقدم خدمات تطوير قوالب وتكاملات Shopify Admin API.',
        answerEn: 'Yes, we engineer custom storefronts inside QABS Studio as well as custom Shopify themes and Admin API integrations.'
      },
      {
        questionAr: 'هل يمكنني تعديل النصوص والصور بنفسي بعد التسليم؟',
        questionEn: 'Can I edit text and images myself after delivery?',
        answerAr: 'بالتأكيد، تُبنى جميع الأقسام بحيث يمكنك تعديل محتواها وألوانها وترتيبها بسهولة من لوحة التخصيص.',
        answerEn: 'Absolutely. All sections are structured so your team can update copy, media, and colors without touching code.'
      }
    ],
    formFields: [
      {
        name: 'targetPlatform',
        labelAr: 'بيئة المتجر المستهدفة',
        labelEn: 'Target Store Environment',
        type: 'select',
        required: true,
        options: [
          { value: 'QABS Studio', labelAr: 'متاجر قبس (QABS Studio)', labelEn: 'QABS Stores & Studio' },
          { value: 'Shopify', labelAr: 'شوبيفاي (Shopify)', labelEn: 'Shopify' },
          { value: 'Custom Headless', labelAr: 'واجهة برمجية مخصصة (React Headless)', labelEn: 'Custom React Headless' }
        ]
      },
      {
        name: 'scopeNotes',
        labelAr: 'أبرز الميزات أو التكاملات المطلوبة',
        labelEn: 'Key Features or Integrations Needed',
        type: 'textarea',
        required: true,
        placeholderAr: 'اذكر عدد الصفحات أو الميزات المطلوبة أو رابط موقع مرجعي...',
        placeholderEn: 'Describe pages, interactive features, or reference links...'
      }
    ],
    relatedPaths: ['/services/store-creation', '/services/web-development', '/services/brand-identity', '/services/payment-integration']
  }
];
