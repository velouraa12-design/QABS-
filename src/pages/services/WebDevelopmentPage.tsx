import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const WebDevelopmentPage: React.FC = () => {
  const service = getServiceBySlug('web-development')!;
  return <ServicePageTemplate service={service} />;
};
