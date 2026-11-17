import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const RegisteredAgentPage: React.FC = () => {
  const service = getServiceBySlug('registered-agent')!;
  return <ServicePageTemplate service={service} />;
};
