import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ALL_SERVICE_PAGES,
  FORMATION_SERVICES,
  COMPLIANCE_SERVICES,
  STORE_SERVICES,
  PAYMENT_SERVICES,
  DIGITAL_SERVICES,
  GENERAL_PAGES
} from '../src/data/pages/index.ts';

describe('QABS Standalone Service Pages & Routing Contracts', () => {
  it('defines all 20 independent service pages across the 5 required categories', () => {
    assert.equal(FORMATION_SERVICES.length, 4);
    assert.equal(COMPLIANCE_SERVICES.length, 3);
    assert.equal(STORE_SERVICES.length, 4);
    assert.equal(PAYMENT_SERVICES.length, 3);
    assert.equal(DIGITAL_SERVICES.length, 6);
    assert.equal(ALL_SERVICE_PAGES.length, 20);
  });

  it('defines all 8 required general pages with complete bilingual SEO and content sections', () => {
    const requiredSlugs = ['about', 'how-it-works', 'pricing', 'contact', 'faq', 'support', 'privacy', 'terms'];
    const allGeneral = Object.values(GENERAL_PAGES);
    for (const slug of requiredSlugs) {
      const page = allGeneral.find((p) => p.slug === slug);
      assert.ok(page, `Missing general page: ${slug}`);
      assert.ok(page.seoTitleAr.length > 3);
      assert.ok(page.seoTitleEn.length > 3);
      assert.ok(page.seoDescriptionAr.length > 10);
      assert.ok(page.seoDescriptionEn.length > 10);
    }
  });

  it('gives every service unique slug, unique /services/* path, packages/features/steps/faqs, and mounts it in App.tsx', () => {
    const slugs = new Set<string>();
    const paths = new Set<string>();
    const appSource = fs.readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf8');

    for (const svc of ALL_SERVICE_PAGES) {
      assert.ok(!slugs.has(svc.slug), `Duplicate service slug: ${svc.slug}`);
      assert.ok(!paths.has(svc.path), `Duplicate service path: ${svc.path}`);
      slugs.add(svc.slug);
      paths.add(svc.path);

      assert.ok(svc.path.startsWith('/services/'), `Service path must start with /services/: ${svc.path}`);
      assert.ok(svc.features.length >= 3, `${svc.slug} missing features`);
      assert.ok(svc.steps.length >= 3, `${svc.slug} missing execution steps`);
      assert.ok(svc.faqs.length >= 2, `${svc.slug} missing FAQs`);
      assert.ok(svc.seoTitleAr.length > 3 && svc.seoTitleEn.length > 3, `${svc.slug} missing SEO titles`);
      assert.ok(appSource.includes(`'${svc.path}'`), `App.tsx missing route for ${svc.path}`);
    }

    assert.ok(appSource.includes("path === '/order'"), 'App.tsx missing dedicated /order route');
  });
});
