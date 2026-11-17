import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const BrandIdentityPage: React.FC = () => {
  const service = getServiceBySlug('brand-identity')!;
  return <ServicePageTemplate service={service} />;
};
