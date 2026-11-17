import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const StoreDevelopmentPage: React.FC = () => {
  const service = getServiceBySlug('store-development')!;
  return <ServicePageTemplate service={service} />;
};
