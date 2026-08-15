import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogGrid from '@/components/BlogGrid';
import { getAllPosts } from '@/lib/blog';
import { BLOG_IMAGE_DIMENSIONS } from '@/lib/blog-meta';
import { SITE_URL, WEBSITE_ID, ORGANIZATION_ID, serializeJsonLd } from '@/lib/schema';

const BLOG_TITLE = 'Indian Diet & Weight Loss Blog | Nutrition Tracker';
const BLOG_DESCRIPTION = 'Evidence-based weight loss and nutrition guides written for Indian bodies, diets, and lifestyles.';

const featuredPost = getAllPosts().find((p) => p.featured);
const featuredImageUrl = featuredPost?.image ? `https://nutritiontracker.in${featuredPost.image}` : undefined;
const featuredImageDims = featuredPost ? BLOG_IMAGE_DIMENSIONS[featuredPost.id] : undefined;

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  alternates: { canonical: 'https://nutritiontracker.in/blog' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: 'https://nutritiontracker.in/blog',
    siteName: 'NutritionTracker.in',
    locale: 'en_IN',
    type: 'website',
    ...(featuredImageUrl && {
      images: [
        {
          url: featuredImageUrl,
          ...(featuredImageDims && { width: featuredImageDims.width, height: featuredImageDims.height }),
          alt: BLOG_TITLE,
        },
      ],
    }),
  },
  twitter: {
    card: featuredImageUrl ? 'summary_large_image' : 'summary',
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    ...(featuredImageUrl && { images: [featuredImageUrl] }),
  },
};

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${SITE_URL}/blog/#blog`,
  url: `${SITE_URL}/blog`,
  name: 'Indian Diet & Weight Loss Blog',
  description: BLOG_DESCRIPTION,
  isPartOf: { '@id': WEBSITE_ID },
  publisher: { '@id': ORGANIZATION_ID },
};

const CATEGORY_LABELS: Record<string, string> = {
  diet: 'Indian Diet',
  calorie: 'Calories',
  fitness: 'Fitness',
  weight: 'Weight',
  recipe: 'Recipes',
  yoga: 'Yoga',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogJsonLd) }}
      />
      <Navbar />

      <div className="blog-hero">
        <div className="breadcrumb">
          <Link href="/">Home</Link> › Blog
        </div>
        <h1>Weight Loss &amp; Nutrition Blog</h1>
        <p>Evidence-based guides for Indian bodies, Indian diets, and real Indian lifestyles.</p>
      </div>

      <div className="blog-page-content">
        {featured && (
          <div className="blog-featured">
            <Link href={`/blog/${featured.id}`} className="blog-featured-link">
              {featured.image && (
                <div className="blog-featured-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.image} alt={featured.title} />
                </div>
              )}
              <div className="blog-featured-body">
                <div className="blog-tag" data-category={featured.category}>
                  {CATEGORY_LABELS[featured.category] ?? featured.category}
                </div>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <div className="blog-meta">
                  <span>{featured.author}</span>
                  <span>{featured.date}</span>
                  <span>📖 {featured.readTime} min read</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        <BlogGrid posts={rest} />
      </div>

      <Footer />
    </>
  );
}
