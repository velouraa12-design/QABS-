import { readFileSync } from 'node:fs';

const source = readFileSync('src/components/PortalView.tsx', 'utf8');
const typeBlock = source.match(/type ClientTab =([\s\S]*?);/)?.[1] ?? '';
const declared = [...typeBlock.matchAll(/'([^']+)'/g)].map(match => match[1]);
const sidebarBlock = source.match(/const sidebarItems:[\s\S]*?= \[([\s\S]*?)\n  \];/)?.[1] ?? '';
const sidebar = [...sidebarBlock.matchAll(/id: '([^']+)'/g)].map(match => match[1]);
const slugBlock = source.match(/const tabSlugs:[\s\S]*?= \{([\s\S]*?)\n  \};/)?.[1] ?? '';
const slugs = [...slugBlock.matchAll(/([a-z_]+): '([^']+)'/g)].map(match => [match[1], match[2]]);
const rendered = new Set([...source.matchAll(/activeTab === '([^']+)'/g)].map(match => match[1]));
const errors = [];

for (const tab of declared) {
  if (!sidebar.includes(tab)) errors.push(`Missing sidebar item: ${tab}`);
  if (!slugs.some(([key]) => key === tab)) errors.push(`Missing URL slug: ${tab}`);
  if (!rendered.has(tab)) errors.push(`Missing page renderer: ${tab}`);
}
for (const [tab, slug] of slugs) {
  if (!declared.includes(tab)) errors.push(`Unknown slug key: ${tab}`);
  if (slugs.filter(([, value]) => value === slug).length > 1) errors.push(`Duplicate URL slug: ${slug}`);
}
if (declared.length !== sidebar.length) errors.push(`Tab/sidebar count mismatch: ${declared.length}/${sidebar.length}`);


const appSource = readFileSync('src/App.tsx', 'utf8');
const authSource = readFileSync('src/components/AuthModal.tsx', 'utf8');
const appContextSource = readFileSync('src/context/AppContext.tsx', 'utf8');
const checkoutSource = readFileSync('src/components/CheckoutModal.tsx', 'utf8');
const serviceOrderSource = readFileSync('src/components/pages/ServiceOrderForm.tsx', 'utf8');
const formationWizardSource = readFileSync('src/components/FormationWizardModal.tsx', 'utf8');
const aiChatSource = readFileSync('src/components/AIChatModal.tsx', 'utf8');
const landingSource = readFileSync('src/components/LandingView.tsx', 'utf8');
const formationSource = readFileSync('src/pages/services/CompanyFormationPage.tsx', 'utf8');
const llcSource = readFileSync('src/pages/services/UsLlcPage.tsx', 'utf8');
const formationDataSource = readFileSync('src/data/pages/formationServices.ts', 'utf8');
const customizerSource = readFileSync('src/context/CustomizerContext.tsx', 'utf8');
const serviceTemplateSource = readFileSync('src/components/pages/ServicePageTemplate.tsx', 'utf8');
const viteConfigSource = readFileSync('vite.config.ts', 'utf8');
const companyFormationStart = formationDataSource.indexOf("slug: 'company-formation'");
const nextFormationRecord = formationDataSource.indexOf("slug:", companyFormationStart + 5);
const companyFormationCopy = companyFormationStart >= 0 && nextFormationRecord > companyFormationStart
  ? formationDataSource.slice(companyFormationStart, nextFormationRecord)
  : '';
if (!companyFormationCopy) errors.push('Could not inspect the company-formation marketing record.');
const einStart = formationDataSource.indexOf("slug: 'ein'");
const nextEinRecord = formationDataSource.indexOf("slug:", einStart + 5);
const einCopy = einStart >= 0 && nextEinRecord > einStart
  ? formationDataSource.slice(einStart, nextEinRecord)
  : '';
if (!einCopy) errors.push('Could not inspect the EIN marketing record.');
const registeredAgentStart = formationDataSource.indexOf("slug: 'registered-agent'");
const nextRegisteredAgentRecord = formationDataSource.indexOf("slug:", registeredAgentStart + 5);
const registeredAgentCopy = registeredAgentStart >= 0 && nextRegisteredAgentRecord > registeredAgentStart
  ? formationDataSource.slice(registeredAgentStart, nextRegisteredAgentRecord)
  : '';
if (!registeredAgentCopy) errors.push('Could not inspect the registered-agent marketing record.');
const usLlcStart = formationDataSource.indexOf("slug: 'us-llc'");
const usLlcCopy = usLlcStart >= 0 ? formationDataSource.slice(usLlcStart) : '';
if (!usLlcCopy) errors.push('Could not inspect the US LLC marketing record.');
const marketingSource = [landingSource, formationSource, llcSource, companyFormationCopy, einCopy, registeredAgentCopy, usLlcCopy, customizerSource, serviceTemplateSource].join('\n');
const forbiddenUnverifiedClaims = [
  '+1,450',
  'EIN Issuance Success',
  'Avg State Filing Speed',
  '48h',
  '4 to 10 business days',
  'نسبة نجاح استخراج EIN',
  'متوسط سرعة الإيداع لدى الولاية',
  'يؤهلك لفتح حسابات بنكية',
  '100% non-resident ownership',
  '100% Foreign Ownership',
  'Banking & Gateway Ready',
  'موافقة قانونية للبنوك والدفع',
  '1 – 3 أيام عمل للإيداع الحكومي',
  '1 – 3 business days for state filing',
  'Permanent cloud access to all certified articles',
  'أرشفة دائمة لجميع شهادات التأسيس',
  'بوابتك المعتمدة نحو التجارة العالمية',
  'Turnkey Stripe & PayPal Integration',
  'Official US LLC Formation',
  'Verified tracking inside your QABS Workspace',
  'Approved Packages & Pricing',
  'الأسعار والباقات المعتمدة',
  'Stripe, PayPal & Crypto Gateways',
  '500 Credits',
  '1,500 Credits',
  '5,000 Credits',
  'Instant recharge of',
  'with verified governance',
  'full dashboard, visual QABS Studio, and strict isolation',
  'Open Mercury or Wise accounts, connect Stripe payment gateway',
  'We manage all legal, governmental, and technical procedures',
  'We file Articles of Organization, obtain IRS EIN letter',
  'proceed to checkout',
  'Order Service Now — Checkout',
  'اطلب الخدمة الآن — متابعة للدفع',
  'لإتمام الطلب',
  'Order Package Now',
  'Order in ',
  'Form Company in ',
  'Choose the best state (Wyoming for commerce, Delaware for VC)',
  'نتولى عنك كافة الإجراءات الحكومية والقانونية والتقنية',
  'نقوم بإيداع النظام الأساسي لدى سكرتير الولاية واستخراج الرقم الضريبي',
  'اختر الولاية الأنسب لنشاطك (وايومنغ للتجارة الإلكترونية، ديلاوير للاستثمار)',
  'Everything Needed to Form Companies, Connect Global Payments & Run Online Stores',
  'QABS Unified Digital Ecosystem',
  'Manage Compliance',
  'Open QABS Stores',
  'View Plans & Gateways',
  'كل ما تحتاجه لتأسيس شركتك وربط مدفوعاتك وإدارة متاجرك الإلكترونية',
  'منظومة قبس الرقمية المتكاملة',
  'premier sovereign digital operating platform',
  'highest standard of data encryption and strict multi-tenant isolation',
  'المنصة الرائدة في تمكين رواد الأعمال',
  'أعلى معايير تشفير البيانات وعزل بيئات المستأجرين',
  '4 – 10 business days for non-SSN founders',
  '4 – 10 أيام عمل لغير المقيمين',
  'Mandatory prerequisite for US fintech banking',
  'Official EIN confirmation letter uploaded directly to your QABS Vault',
  'Priority handling & daily follow-up',
  'استخراج خطاب EIN الرسمي من IRS، عنوان أمريكي معتمد',
  'تجنب الاستقطاع الضريبي التلقائي بنسبة 30%',
  'No SSN or ITIN Required',
  'Required for Banking & Stripe',
  'Priority EIN + 147C Verification',
  'Priority queue + verification letter',
  'Within 24h',
  '4 – 10 أيام عمل',
  '4 – 10 business days',
  'all 50 US states',
  'All 50 States Pricing',
  'same-day mail scanning',
  'Same-Day Mail Scanning',
  'same-day PDF scanning',
  'within 24 hours',
  'تفعيل فوري خلال 24 ساعة',
  '0% state income tax in top states',
  '0% ضريبة ولاية',
  'State Filing & EIN Issuance',
  'All 50 US States Supported',
  'Verified physical addresses in Wyoming',
  'Activated within 24 hours',
  'Unlimited commercial mail PDF scans',
  'لا يوجد ادعاء بأن ولاية واحدة مناسبة للجميع'
];
for (const claim of forbiddenUnverifiedClaims) {
  if (marketingSource.toLowerCase().includes(claim.toLowerCase())) {
    errors.push(`Unverified marketing claim remains: ${claim}`);
  }
}

const requiredTruthfulCopy = [
  'do not guarantee a bank account',
  'لا تضمن فتح حساب بنكي',
  'لا يعني إيداعاً حكومياً',
  'لا ضريبة دخل على مستوى الولاية؛ قد تنطبق ضرائب أخرى',
  'لا تضمن قبس إصدار EIN أو فتح حساب أو موافقة أي مزود',
  'QABS does not guarantee EIN issuance, account opening, or provider approval',
  'لا نضمن إصدار EIN أو فتح حساب أو قبول بوابة دفع',
  'EIN issuance, bank-account opening, and payment-provider approval are not guaranteed',
  'Requests are reviewed for eligibility and scope before work begins',
  'الأسعار والباقات الإرشادية',
  'These are preliminary options for a needs assessment, not active subscriptions.',
  'هذه خيارات أولية لطلب تقييم الاحتياج وليست اشتراكات مفعّلة',
  'No credits are currently purchasable',
  'لا توجد أرصدة قابلة للشراء',
  'does not collect payment',
  'لا يتم من هذه الصفحة تحصيل رسوم',
  'government registries and account/payment providers make their own decisions',
  'لا توجد ولاية مناسبة للجميع',
  'Business formation assistance, application preparation, and store and digital-service assessments',
  'مساعدة في تأسيس الأعمال وتجهيز الطلبات ومراجعة احتياجات المتاجر والخدمات الرقمية',
  'Explore Store Setup',
  'Explore Compliance Services',
  'this preview does not collect payment',
  'المعاينة فقط — الطلب والدفع غير مفعّلين',
  'indicative estimate for review only',
  'تقدير إرشادي للمراجعة فقط',
  'Request Eligibility & Quote Review',
  'Request review for',
  'governmentFeesMayBeAdditional: true',
  'disabled={isPagesPreview}',
  'We are developing account and data-protection controls',
  'نطوّر ضوابط لحماية الحسابات والبيانات',
  'لا يمكن ضمان عدد محدد من الأيام',
  'a fixed number of days cannot be guaranteed',
  'مساعدة في طلب الرقم الضريبي الأمريكي EIN',
  'Federal EIN Application Assistance for Eligible Applicants',
  'لا يعني ذلك قبول البنوك أو بوابات الدفع',
  'does not imply bank or payment-provider approval',
  'No state is best for every company',
  'لا يُفترض وجود ربط تلقائي بلوحة قبس',
  'does not guarantee Good Standing',
  'لا توجد ولاية هي الأفضل لكل الشركات'
];
for (const phrase of requiredTruthfulCopy) {
  const hasTruthfulCopy = [landingSource, companyFormationCopy, einCopy, registeredAgentCopy, usLlcCopy, customizerSource, serviceTemplateSource]
    .some(source => source.toLowerCase().includes(phrase.toLowerCase()));
  if (!hasTruthfulCopy) errors.push(`Missing truthful service disclaimer: ${phrase}`);
}
if (!viteConfigSource.includes("host: '127.0.0.1'")) {
  errors.push('Vite development server must bind to loopback only.');
}
if (viteConfigSource.includes("host: '0.0.0.0'") || viteConfigSource.includes('allowedHosts: true')) {
  errors.push('Vite development server must not bind to all interfaces or allow every host.');
}

if (!landingSource.includes('disabled={isPagesPreview}') || !landingSource.includes('if (isPagesPreview) return;')) {
  errors.push('Formation order and checkout actions must be disabled in the public Pages preview.');
}

const requiredPreviewSafetyContracts = [
  [appContextSource, 'const requireConnectedBackend = (): boolean'],
  [appContextSource, 'Checkout is disabled in this preview'],
  [appContextSource, 'if (!requireConnectedBackend()) return false;'],
  [authSource, 'no session, account, or email will be created'],
  [authSource, 'const authActionsReady = backendStatus === \'connected\' && studioAuthReady && !authConfigLoading'],
  [authSource, "disabled={authLoading || !authActionsReady}"],
  [checkoutSource, 'Checkout and invoicing are disabled in this preview'],
  [checkoutSource, 'disabled'],
  [serviceOrderSource, "backendStatus !== 'connected'"],
  [serviceOrderSource, 'this form is view-only'],
  [formationWizardSource, 'saving and submission are disabled'],
  [aiChatSource, 'prompts will not execute and no credits will be deducted']
];
for (const [source, token] of requiredPreviewSafetyContracts) {
  if (!source.toLowerCase().includes(token.toLowerCase())) {
    errors.push(`Missing offline-preview safety guard: ${token}`);
  }
}

const requiredRouteContracts = [
  ["workspace deep links", "path.startsWith('/workspace/')"],
  ["account alias is guarded as a workspace route", "path === '/account'"],
  ["Studio route mounts its own API-backed workspace", "normalizePath(currentPath) === '/studio'"],
  ["Studio view is mounted as a standalone API-backed workspace", "StudioWorkspaceView"],
  ["login route", "'/login': 'login'"],
  ["signup route", "'/signup': 'register'"],
  ["password recovery route", "'/forgot-password': 'recover'"],
  ["email verification route", "'/verify-email': 'verify'"],
  ["workspace route renders landing/auth gate", "path === '/workspace' || path.startsWith('/workspace/')"],
  ["account alias renders the authenticated workspace entry", "path === '/account'"],
  ["email verification panel state", "setShowVerifyPanel(authMode === 'verify')"]
];
for (const [label, token] of requiredRouteContracts) {
  const source = label === "email verification panel state" ? authSource : appSource;
  if (!source.includes(token)) errors.push(`Missing direct route contract: ${label}`);
}

if (errors.length) {
  console.error('QABS workspace route check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`QABS workspace routes OK: ${declared.length} tabs have sidebar entries, unique URL slugs and page renderers.`);
