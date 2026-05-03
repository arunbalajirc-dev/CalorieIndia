'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image?: string;
  author: string;
  date: string;
  readTime: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  diet: 'Indian Diet',
  calorie: 'Calories',
  fitness: 'Fitness',
  weight: 'Weight',
  recipe: 'Recipes',
  yoga: 'Yoga',
};

interface Props {
  posts: Post[];
}

export default function BlogGrid({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(posts.map((p) => p.category)))];

  const filtered =
    activeCategory === 'all' ? posts : posts.filter((p) => p.category === activeCategory);

  const getCount = (cat: string) =>
    cat === 'all' ? posts.length : posts.filter((p) => p.category === cat).length;

  return (
    <>
      <div className="blog-filter-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`blog-filter-pill${activeCategory === cat ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'all' ? 'All Posts' : (CATEGORY_LABELS[cat] ?? cat)}
            <span className="blog-filter-count">({getCount(cat)})</span>
          </button>
        ))}
      </div>

      <div className="blog-grid">
        {filtered.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`} className="blog-card-link">
            <div className="blog-card">
              {post.image && (
                <div className="blog-card-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt={post.title} loading="lazy" />
                </div>
              )}
              <div className="blog-card-body">
                <div className="blog-tag" data-category={post.category}>
                  {CATEGORY_LABELS[post.category] ?? post.category}
                </div>
                <div className="blog-title">{post.title}</div>
                <div className="blog-excerpt">{post.excerpt}</div>
                <div className="blog-meta">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                  <span>📖 {post.readTime} min read</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
