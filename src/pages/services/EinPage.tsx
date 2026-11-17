import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const EinPage: React.FC = () => {
  const service = getServiceBySlug('ein')!;
  return <ServicePageTemplate service={service} />;
};
