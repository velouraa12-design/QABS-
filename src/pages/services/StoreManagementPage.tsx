import React from 'react';
import { getServiceBySlug } from '../../data/pages/index.ts';
import { ServicePageTemplate } from '../../components/pages/ServicePageTemplate.tsx';

export const StoreManagementPage: React.FC = () => {
  const service = getServiceBySlug('store-management')!;
  return <ServicePageTemplate service={service} />;
};
