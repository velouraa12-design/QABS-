import { ServiceCategoryId, ServicePageData } from '../../types/pages.ts';
import { FORMATION_SERVICES } from './formationServices.ts';
import { COMPLIANCE_SERVICES } from './complianceServices.ts';
import { STORE_SERVICES } from './storeServices.ts';
import { PAYMENT_SERVICES_DATA as PAYMENT_SERVICES } from './paymentServices.ts';
import { DIGITAL_SERVICES } from './digitalServices.ts';
import { GENERAL_PAGES } from './generalPages.ts';

export const ALL_SERVICE_PAGES: ServicePageData[] = [
  ...FORMATION_SERVICES,
  ...COMPLIANCE_SERVICES,
  ...STORE_SERVICES,
  ...PAYMENT_SERVICES,
  ...DIGITAL_SERVICES
];

export const SERVICE_CATEGORY_LABELS: Record<
  ServiceCategoryId,
  { ar: string; en: string }
> = {
  formation: { ar: 'تأسيس الشركات', en: 'Company Formation' },
  compliance: { ar: 'الامتثال والتجديد', en: 'Compliance & Renewals' },
  stores: { ar: 'المتاجر الإلكترونية', en: 'E-Commerce Stores' },
  payments: { ar: 'الدفع والحسابات', en: 'Payments & Banking' },
  digital: { ar: 'الخدمات الرقمية', en: 'Digital Services' }
};

export function getServiceBySlug(slug: string): ServicePageData | undefined {
  return ALL_SERVICE_PAGES.find(s => s.slug === slug);
}

export function getServiceByPath(path: string): ServicePageData | undefined {
  return ALL_SERVICE_PAGES.find(s => s.path === path);
}

export function getServicesByCategory(category: ServiceCategoryId): ServicePageData[] {
  return ALL_SERVICE_PAGES.filter(s => s.category === category);
}

export {
  FORMATION_SERVICES,
  COMPLIANCE_SERVICES,
  STORE_SERVICES,
  PAYMENT_SERVICES,
  DIGITAL_SERVICES,
  GENERAL_PAGES
};
