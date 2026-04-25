import blogsData from '@/data/blogs.json';
import blogContent from '@/data/blog-content';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  image: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: number;
  featured: boolean;
  published: boolean;
  content?: string;
}

const allPosts: BlogPost[] = blogsData as BlogPost[];

export function getAllPosts(): BlogPost[] {
  return allPosts.filter((p) => p.published);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const post = allPosts.find((p) => p.id === slug && p.published);
  if (!post) return undefined;
  return {
    ...post,
    content: blogContent[slug] ?? '',
  };
}
