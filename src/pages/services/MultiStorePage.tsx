import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const MultiStorePage: React.FC = () => {
  const service = getServiceBySlug('multi-store')!;
  return <ServicePageTemplate service={service} />;
};
