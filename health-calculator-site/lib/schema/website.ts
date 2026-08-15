import { WEBSITE_ID, ORGANIZATION_ID, ORGANIZATION_NAME, SITE_URL } from './constants';

export interface WebSiteSchema {
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  publisher: { '@id': string };
}

/**
 * Sitewide WebSite node. No `SearchAction` — no on-site search endpoint
 * exists in app/api/, so a SearchAction would point at a URL that 404s.
 */
export function buildWebsiteSchema(): WebSiteSchema {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: ORGANIZATION_NAME,
    publisher: { '@id': ORGANIZATION_ID },
  };
}
