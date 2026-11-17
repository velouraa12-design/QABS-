import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const CompliancePage: React.FC = () => {
  const service = getServiceBySlug('compliance')!;
  return <ServicePageTemplate service={service} />;
};
