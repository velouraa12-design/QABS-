import { readFileSync } from 'node:fs';

const source = readFileSync('src/components/PortalView.tsx', 'utf8');
const typeBlock = source.match(/type ClientTab =([\s\S]*?);/)?.[1] ?? '';
const declared = [...typeBlock.matchAll(/'([^']+)'/g)].map(match => match[1]);
const sidebarBlock = source.match(/const sidebarItems:[\s\S]*?= \[([\s\S]*?)\n  \];/)?.[1] ?? '';
const sidebar = [...sidebarBlock.matchAll(/id: '([^']+)'/g)].map(match => match[1]);
const slugBlock = source.match(/const tabSlugs:[\s\S]*?= \{([\s\S]*?)\n  \};/)?.[1] ?? '';
const slugs = [...slugBlock.matchAll(/([a-z_]+): '([^']+)'/g)].map(match => [match[1], match[2]]);
const rendered = new Set([...source.matchAll(/activeTab === '([^']+)'/g)].map(match => match[1]));
const errors = [];

for (const tab of declared) {
  if (!sidebar.includes(tab)) errors.push(`Missing sidebar item: ${tab}`);
  if (!slugs.some(([key]) => key === tab)) errors.push(`Missing URL slug: ${tab}`);
  if (!rendered.has(tab)) errors.push(`Missing page renderer: ${tab}`);
}
for (const [tab, slug] of slugs) {
  if (!declared.includes(tab)) errors.push(`Unknown slug key: ${tab}`);
  if (slugs.filter(([, value]) => value === slug).length > 1) errors.push(`Duplicate URL slug: ${slug}`);
}
if (declared.length !== sidebar.length) errors.push(`Tab/sidebar count mismatch: ${declared.length}/${sidebar.length}`);

if (errors.length) {
  console.error('QABS workspace route check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`QABS workspace routes OK: ${declared.length} tabs have sidebar entries, unique URL slugs and page renderers.`);
