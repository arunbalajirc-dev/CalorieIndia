import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

  return (
    <>
      <Navbar />

      <article className="blog-post-wrap">
        <div className="blog-post-breadcrumb">
          <Link href="/">Home</Link> › <Link href="/blog">Blog</Link> › {post.title}
        </div>

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
          dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
        />

        <div className="teal-cta-bar">
          <h3>Try Our Free Calculators</h3>
          <p>Calculate your TDEE, BMI, ideal weight, and more — built for Indian bodies.</p>
          <Link href="/calculator">Open Calculators →</Link>
        </div>
      </article>

      <Footer />
    </>
  );
}
