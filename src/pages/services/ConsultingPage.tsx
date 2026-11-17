import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const ConsultingPage: React.FC = () => {
  const service = getServiceBySlug('consulting')!;
  return <ServicePageTemplate service={service} />;
};
