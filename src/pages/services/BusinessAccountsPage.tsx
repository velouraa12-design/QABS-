import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const BusinessAccountsPage: React.FC = () => {
  const service = getServiceBySlug('business-accounts')!;
  return <ServicePageTemplate service={service} />;
};
