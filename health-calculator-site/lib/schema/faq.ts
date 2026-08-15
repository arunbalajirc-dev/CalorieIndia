export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqPageSchema {
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

const FAQ_HEADING = /<h2[^>]*>\s*Frequently Asked Questions\s*<\/h2>/i;
const NEXT_HEADING = /<h2[^>]*>/i;
const QA_PAIR = /<p>\s*<strong>(.*?)<\/strong>\s*(.*?)<\/p>/gi;

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Extracts Q&A pairs directly from the post's rendered HTML — not from a
 * hand-copied source — so the FAQPage markup is guaranteed to match the
 * visible page text character for character, per Google's FAQ policy.
 * Returns an empty array for posts with no "Frequently Asked Questions"
 * section (the other 5 posts), so callers can skip emitting FAQPage there.
 */
export function extractFaqItems(html: string): FaqItem[] {
  const headingMatch = FAQ_HEADING.exec(html);
  if (!headingMatch) return [];

  const sectionStart = headingMatch.index + headingMatch[0].length;
  const rest = html.slice(sectionStart);
  const nextHeadingMatch = NEXT_HEADING.exec(rest);
  const section = nextHeadingMatch ? rest.slice(0, nextHeadingMatch.index) : rest;

  const items: FaqItem[] = [];
  let m: RegExpExecArray | null;
  QA_PAIR.lastIndex = 0;
  while ((m = QA_PAIR.exec(section)) !== null) {
    const question = decodeEntities(stripTags(m[1]));
    const answer = decodeEntities(stripTags(m[2]));
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

export function buildFaqSchema(items: FaqItem[]): FaqPageSchema {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
