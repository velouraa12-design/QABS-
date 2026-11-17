import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const PaymentIntegrationPage: React.FC = () => {
  const service = getServiceBySlug('payment-integration')!;
  return <ServicePageTemplate service={service} />;
};
