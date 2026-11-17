import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const LogoDesignPage: React.FC = () => {
  const service = getServiceBySlug('logo-design')!;
  return <ServicePageTemplate service={service} />;
};
