import { ORGANIZATION_ID, SITE_URL } from './constants';

export interface BlogPostingInput {
  slug: string;
  headline: string;
  description: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** YYYY-MM-DD */
  datePublished: string;
  /** YYYY-MM-DD — omit when no real modification date exists; never invent one. */
  dateModified?: string;
  articleSection: string;
  keywords: string[];
  /** Plain rendered body HTML, used only to compute wordCount. */
  bodyHtml: string;
}

export interface BlogPostingSchema {
  '@type': 'BlogPosting';
  '@id': string;
  mainEntityOfPage: { '@type': 'WebPage'; '@id': string };
  headline: string;
  description: string;
  image?: { '@type': 'ImageObject'; url: string; width?: number; height?: number };
  datePublished: string;
  dateModified?: string;
  author: { '@id': string };
  publisher: { '@id': string };
  articleSection: string;
  keywords: string;
  inLanguage: 'en-IN';
  wordCount: number;
  isAccessibleForFree: true;
}

/** IST is a fixed UTC+5:30 offset year-round (no DST) — safe to hardcode. */
function toIstIso(dateOnly: string): string {
  return `${dateOnly}T00:00:00+05:30`;
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function buildBlogPostingSchema(input: BlogPostingInput): BlogPostingSchema {
  const postUrl = `${SITE_URL}/blog/${input.slug}`;
  return {
    '@type': 'BlogPosting',
    '@id': `${postUrl}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    headline: input.headline,
    description: input.description,
    ...(input.imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: input.imageUrl,
        ...(input.imageWidth && { width: input.imageWidth }),
        ...(input.imageHeight && { height: input.imageHeight }),
      },
    }),
    datePublished: toIstIso(input.datePublished),
    ...(input.dateModified && { dateModified: toIstIso(input.dateModified) }),
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    articleSection: input.articleSection,
    keywords: input.keywords.join(', '),
    inLanguage: 'en-IN',
    wordCount: countWords(input.bodyHtml),
    isAccessibleForFree: true,
  };
}
