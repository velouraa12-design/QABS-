export type ServiceCategoryId =
  | 'formation'
  | 'compliance'
  | 'stores'
  | 'payments'
  | 'digital';

export interface ServicePackageTier {
  id: string;
  nameAr: string;
  nameEn: string;
  priceUsd: number;
  billingNoteAr: string;
  billingNoteEn: string;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: string[];
  featuresEn: string[];
  recommended?: boolean;
}

export interface ServiceStep {
  stepNumber: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  durationAr: string;
  durationEn: string;
}

export interface ServiceFeatureItem {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface ServiceFaq {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export interface ServiceFormField {
  name: string;
  labelAr: string;
  labelEn: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  required?: boolean;
  placeholderAr?: string;
  placeholderEn?: string;
  options?: { value: string; labelAr: string; labelEn: string }[];
}

export interface ServicePageData {
  slug: string;
  path: string;
  category: ServiceCategoryId;
  categoryLabelAr: string;
  categoryLabelEn: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
  detailedDescriptionAr: string[];
  detailedDescriptionEn: string[];
  deliveryTimeAr: string;
  deliveryTimeEn: string;
  startingPriceUsd: number;
  pricingNoteAr: string;
  pricingNoteEn: string;
  features: ServiceFeatureItem[];
  benefitsAr: string[];
  benefitsEn: string[];
  steps: ServiceStep[];
  packages: ServicePackageTier[];
  faqs: ServiceFaq[];
  formFields: ServiceFormField[];
  relatedPaths: string[];
}

export interface GeneralPageData {
  slug: string;
  path: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
}

export interface SubmittedServiceOrder {
  id: string;
  referenceCode: string;
  serviceSlug: string;
  servicePath: string;
  serviceTitleAr: string;
  serviceTitleEn: string;
  packageId?: string;
  packageNameAr?: string;
  packageNameEn?: string;
  priceUsd: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyOrStoreName?: string;
  customFields: Record<string, string>;
  notes?: string;
  status: 'received' | 'in_review' | 'awaiting_payment';
  createdAt: string;
}
