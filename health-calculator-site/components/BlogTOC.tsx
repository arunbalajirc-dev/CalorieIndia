'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface Props {
  content: string;
}

export default function BlogTOC({ content }: Props) {
  const [activeId, setActiveId] = useState<string>('');

  const headings: Heading[] = [];
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
  let match: RegExpExecArray | null;
  while ((match = h2Regex.exec(content)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    const id = slugify(text);
    if (id) headings.push({ id, text });
  }

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-20px 0px -70% 0px' }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <aside className="blog-toc">
      <div className="blog-toc-inner">
        <p className="blog-toc-title">In this article</p>
        <ul className="blog-toc-list">
          {headings.map(({ id, text }) => (
            <li key={id} className="blog-toc-item">
              <a
                href={`#${id}`}
                className={activeId === id ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
