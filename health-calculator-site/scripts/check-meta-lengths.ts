/**
 * Fails the build if any blog post's SEO title exceeds 60 chars or
 * description exceeds 155 chars. Run via `npm run check-meta` (wired as a
 * prebuild step) — see lib/blog-meta.ts for the source data.
 */
import { BLOG_SEO_META } from '../lib/blog-meta';

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

let failed = false;

for (const [slug, meta] of Object.entries(BLOG_SEO_META)) {
  const titleLen = meta.title.length;
  const descLen = meta.description.length;

  const titleOk = titleLen <= TITLE_MAX;
  const descOk = descLen <= DESCRIPTION_MAX;

  if (!titleOk || !descOk) failed = true;

  const titleMark = titleOk ? 'OK' : 'FAIL';
  const descMark = descOk ? 'OK' : 'FAIL';
  console.log(
    `${slug}\n  title (${titleLen}/${TITLE_MAX}) ${titleMark}: ${meta.title}\n  desc  (${descLen}/${DESCRIPTION_MAX}) ${descMark}: ${meta.description}`
  );
}

if (failed) {
  console.error('\ncheck-meta-lengths: one or more titles/descriptions exceed budget.');
  process.exit(1);
} else {
  console.log(`\ncheck-meta-lengths: all ${Object.keys(BLOG_SEO_META).length} posts within budget.`);
}
