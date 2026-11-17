import { useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ServiceFaq } from '../types/pages.ts';

interface SeoConfig {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  path: string;
  schemaType?: 'Service' | 'WebPage' | 'FAQPage' | 'AboutPage' | 'ContactPage';
  priceUsd?: number;
  faqs?: ServiceFaq[];
}

function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function usePageSeo(config: SeoConfig) {
  const { language } = useApp();
  const isAr = language === 'ar';

  useEffect(() => {
    const title = isAr ? config.titleAr : config.titleEn;
    const description = isAr ? config.descriptionAr : config.descriptionEn;
    const origin = window.location.origin;
    const canonicalUrl = `${origin}${config.path}`;

    document.title = title;
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', 'QABS | قبس الرقمية');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    const existingJsonLd = document.getElementById('qabs-page-jsonld');
    if (existingJsonLd) existingJsonLd.remove();

    const jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': config.schemaType || 'WebPage',
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: isAr ? 'ar' : 'en',
      provider: {
        '@type': 'Organization',
        name: 'QABS Digital Platform',
        url: origin
      }
    };

    if (config.schemaType === 'Service' && typeof config.priceUsd === 'number') {
      jsonLd.offers = {
        '@type': 'Offer',
        price: String(config.priceUsd),
        priceCurrency: 'USD'
      };
    }

    if (config.faqs && config.faqs.length > 0) {
      jsonLd.mainEntity = config.faqs.map(item => ({
        '@type': 'Question',
        name: isAr ? item.questionAr : item.questionEn,
        acceptedAnswer: {
          '@type': 'Answer',
          text: isAr ? item.answerAr : item.answerEn
        }
      }));
    }

    const script = document.createElement('script');
    script.id = 'qabs-page-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }, [
    isAr,
    config.titleAr,
    config.titleEn,
    config.descriptionAr,
    config.descriptionEn,
    config.path,
    config.schemaType,
    config.priceUsd,
    config.faqs
  ]);
}
