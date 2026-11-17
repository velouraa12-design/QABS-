import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const MarketingPage: React.FC = () => {
  const service = getServiceBySlug('marketing')!;
  return <ServicePageTemplate service={service} />;
};
