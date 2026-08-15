import { ORGANIZATION_ID, ORGANIZATION_NAME, ORGANIZATION_LOGO_URL, ORGANIZATION_EMAIL, SITE_URL } from './constants';

export interface OrganizationSchema {
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
  logo: { '@type': 'ImageObject'; url: string };
  email: string;
}

/**
 * Sitewide Organization node. No `sameAs` — no verified social profiles
 * exist anywhere in the codebase; never fill it with a guess.
 */
export function buildOrganizationSchema(): OrganizationSchema {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: ORGANIZATION_LOGO_URL },
    email: ORGANIZATION_EMAIL,
  };
}
