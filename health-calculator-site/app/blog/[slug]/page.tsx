import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogProgressBar from '@/components/BlogProgressBar';
import BlogTOC from '@/components/BlogTOC';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { BLOG_SEO_META, BLOG_IMAGE_DIMENSIONS } from '@/lib/blog-meta';
import {
  SITE_URL,
  serializeJsonLd,
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  extractFaqItems,
  buildFaqSchema,
} from '@/lib/schema';

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

  const seo = BLOG_SEO_META[params.slug];
  const title = seo?.title ?? post.title;
  const description = seo?.description ?? post.excerpt;
  const url = `https://nutritiontracker.in/blog/${params.slug}`;
  const imageUrl = post.image ? `https://nutritiontracker.in${post.image}` : undefined;
  const imageDims = BLOG_IMAGE_DIMENSIONS[params.slug];

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: 'NutritionTracker.in',
      locale: 'en_IN',
      publishedTime: post.date,
      ...(post.dateModified && { modifiedTime: post.dateModified }),
      authors: [post.author],
      section: CATEGORY_LABELS[post.category] ?? post.category,
      tags: post.tags,
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            ...(imageDims && { width: imageDims.width, height: imageDims.height }),
            alt: post.title,
          },
        ],
      }),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
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

  const seo = BLOG_SEO_META[params.slug];
  const imageUrl = post.image ? `${SITE_URL}${post.image}` : undefined;
  const imageDims = BLOG_IMAGE_DIMENSIONS[params.slug];

  const blogPosting = buildBlogPostingSchema({
    slug: params.slug,
    headline: post.title,
    description: seo?.description ?? post.excerpt,
    imageUrl,
    imageWidth: imageDims?.width,
    imageHeight: imageDims?.height,
    datePublished: post.date,
    dateModified: post.dateModified,
    articleSection: CATEGORY_LABELS[post.category] ?? post.category,
    keywords: post.tags,
    bodyHtml: processedContent,
  });

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Blog', url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${params.slug}` },
  ]);

  // Extracted from the rendered body, not hand-copied, so the markup can
  // never drift from the visible FAQ text. Posts with no FAQ section
  // (5 of 11) yield an empty array and emit no FAQPage node.
  const faqItems = extractFaqItems(processedContent);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [blogPosting, breadcrumb, ...(faqItems.length > 0 ? [buildFaqSchema(faqItems)] : [])],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
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
              {post.dateModified && <span className="blog-post-updated">Updated {post.dateModified}</span>}
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
