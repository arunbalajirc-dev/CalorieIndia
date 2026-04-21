import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllPosts, getPostBySlug } from '@/lib/blog';

interface Props {
  params: { slug: string };
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

  return (
    <>
      <Navbar />

      <article className="blog-post-wrap">
        <div className="breadcrumb">
          <Link href="/">Home</Link> › <Link href="/blog">Blog</Link> › {post.title}
        </div>

        <header className="blog-post-header">
          <div className="blog-tag" data-category={post.category}>{post.category}</div>
          <h1>{post.title}</h1>
          <div className="blog-post-meta">
            <span>{post.author}</span>
            <span>{post.authorRole}</span>
            <span>{post.date}</span>
            <span>📖 {post.readTime} min read</span>
          </div>
          <p className="blog-post-excerpt">{post.excerpt}</p>
        </header>

        <div className="blog-post-body">
          <p>
            This article is coming soon. In the meantime, use our free calculators to reach your health goals.
          </p>
          <div className="teal-cta-bar" style={{ marginTop: '40px' }}>
            <h3>Try Our Free Calculators</h3>
            <p>Calculate your TDEE, BMI, ideal weight, and more — built for Indian bodies.</p>
            <Link href="/calculator">Open Calculators →</Link>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
}
