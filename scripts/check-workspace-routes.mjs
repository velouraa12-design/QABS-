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
const companyFormationStart = formationDataSource.indexOf("slug: 'company-formation'");
const nextFormationRecord = formationDataSource.indexOf("slug:", companyFormationStart + 5);
const companyFormationCopy = companyFormationStart >= 0 && nextFormationRecord > companyFormationStart
  ? formationDataSource.slice(companyFormationStart, nextFormationRecord)
  : '';
if (!companyFormationCopy) errors.push('Could not inspect the company-formation marketing record.');
const marketingSource = [landingSource, formationSource, llcSource, companyFormationCopy, customizerSource].join('\n');
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
  'Official US LLC Formation'
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
  'EIN issuance, bank-account opening, and payment-provider approval are not guaranteed'
];
for (const phrase of requiredTruthfulCopy) {
  const hasTruthfulCopy = [landingSource, companyFormationCopy]
    .some(source => source.toLowerCase().includes(phrase.toLowerCase()));
  if (!hasTruthfulCopy) errors.push(`Missing truthful service disclaimer: ${phrase}`);
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
  ["Studio entry alias", "path === '/studio'"],
  ["login route", "'/login': 'login'"],
  ["signup route", "'/signup': 'register'"],
  ["password recovery route", "'/forgot-password': 'recover'"],
  ["email verification route", "'/verify-email': 'verify'"],
  ["workspace route renders landing/auth gate", "path === '/workspace' || path.startsWith('/workspace/')"],
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
