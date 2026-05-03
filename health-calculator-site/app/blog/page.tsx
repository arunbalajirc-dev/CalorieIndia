import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogGrid from '@/components/BlogGrid';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — CalorieIndia',
  description: 'Evidence-based weight loss and nutrition guides written for Indian bodies, diets, and lifestyles.',
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
