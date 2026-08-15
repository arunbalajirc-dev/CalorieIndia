/**
 * Serializes a schema object for a <script type="application/ld+json"> tag.
 * Escapes "<" so a literal "</script>" inside string content (e.g. blog
 * copy pulled into a description field) can't break out of the script tag.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
