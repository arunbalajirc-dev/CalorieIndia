import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogProgressBar from '@/components/BlogProgressBar';
import BlogTOC from '@/components/BlogTOC';
import { getAllPosts, getPostBySlug } from '@/lib/blog';

interface Props {
  params: { slug: string };
}

const CATEGORY_LABELS: Record<string, string> = {
  diet: 'Indian Diet',
  calorie: 'Calories',
  fitness: 'Fitness',
  weight: 'Weight',
  recipe: 'Recipes',
  yoga: 'Yoga',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function addHeadingIds(html: string): string {
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (_, attrs, inner) => {
    if (attrs.includes('id=')) return `<h2${attrs}>${inner}</h2>`;
    const id = slugify(inner.replace(/<[^>]*>/g, '').trim());
    if (!id) return `<h2${attrs}>${inner}</h2>`;
    return `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });
}

/** Wrap every bare <table> in a scrollable div so columns aren't clipped on mobile */
function wrapTables(html: string): string {
  return html.replace(/<table([\s\S]*?)<\/table>/g, (match) => {
    if (match.includes('class="table-wrap"')) return match;
    return `<div class="table-wrap">${match}</div>`;
  });
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — CalorieIndia`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const idx = allPosts.findIndex((p) => p.id === params.slug);
  const prevPost = idx > 0 ? allPosts[idx - 1] : null;
  const nextPost = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

  const processedContent = wrapTables(addHeadingIds(post.content ?? ''));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: post.title,
        url: `https://nutritiontracker.in/blog/${params.slug}`,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          '@type': 'Organization',
          name: 'CalorieIndia',
          '@id': 'https://nutritiontracker.in/#organization',
        },
        publisher: { '@id': 'https://nutritiontracker.in/#organization' },
        ...(post.image ? { image: `https://nutritiontracker.in${post.image}` } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nutritiontracker.in' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://nutritiontracker.in/blog' },
          { '@type': 'ListItem', position: 3, name: post.title, item: `https://nutritiontracker.in/blog/${params.slug}` },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <BlogProgressBar />

      <div className="blog-post-layout">
        <article className="blog-post-wrap">
          <div className="blog-post-breadcrumb">
            <Link href="/">Home</Link> › <Link href="/blog">Blog</Link> › {post.title}
          </div>

          {post.image && (
            <div className="blog-post-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt={post.title} />
            </div>
          )}

          <header className="blog-post-header">
            <div className="blog-tag" data-category={post.category}>
              {CATEGORY_LABELS[post.category] ?? post.category}
            </div>
            <h1>{post.title}</h1>
            <div className="blog-post-meta">
              <span className="blog-post-author">{post.author}</span>
              <span className="blog-post-role">{post.authorRole}</span>
              <span>{post.date}</span>
              <span>📖 {post.readTime} min read</span>
            </div>
            <p className="blog-post-excerpt">{post.excerpt}</p>
          </header>

          <div
            className="blog-post-body"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          {(prevPost || nextPost) && (
            <nav className="blog-prevnext" aria-label="Post navigation">
              {prevPost ? (
                <Link href={`/blog/${prevPost.id}`} className="blog-prevnext-card">
                  {prevPost.image && (
                    <div className="blog-prevnext-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={prevPost.image} alt={prevPost.title} loading="lazy" />
                    </div>
                  )}
                  <div className="blog-prevnext-body">
                    <div className="blog-prevnext-dir">← Previous</div>
                    <div className="blog-prevnext-title">{prevPost.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.id}`}
                  className="blog-prevnext-card blog-prevnext-card--next"
                >
                  {nextPost.image && (
                    <div className="blog-prevnext-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={nextPost.image} alt={nextPost.title} loading="lazy" />
                    </div>
                  )}
                  <div className="blog-prevnext-body">
                    <div className="blog-prevnext-dir">Next →</div>
                    <div className="blog-prevnext-title">{nextPost.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          )}

          <div className="teal-cta-bar">
            <h3>Try Our Free Calculators</h3>
            <p>Calculate your TDEE, BMI, ideal weight, and more — built for Indian bodies.</p>
            <Link href="/calculator">Open Calculators →</Link>
          </div>
        </article>

        <BlogTOC content={processedContent} />
      </div>

      <Footer />
    </>
  );
}
