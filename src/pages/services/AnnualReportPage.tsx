import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const AnnualReportPage: React.FC = () => {
  const service = getServiceBySlug('annual-report')!;
  return <ServicePageTemplate service={service} />;
};
