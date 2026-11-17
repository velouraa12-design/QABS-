import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const StoreCreationPage: React.FC = () => {
  const service = getServiceBySlug('store-creation')!;
  return <ServicePageTemplate service={service} />;
};
