import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

const BASE = 'https://nutritiontracker.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  const blogRoutes = posts.map((post) => ({
    url: `${BASE}/blog/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    // Homepage
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },

    // Calculator pages
    { url: `${BASE}/calculator`,                lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE}/tdee-calculator`,           lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE}/bmi-calculator`,            lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE}/macro-calculator`,          lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE}/calorie-deficit-calculator`,lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE}/calorie-burn-calculator`,   lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE}/ideal-weight-calculator`,   lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },

    // Resource pages
    { url: `${BASE}/food-database`,      lastModified: new Date(), changeFrequency: 'weekly' as const,  priority: 0.8 },
    { url: `${BASE}/recipe-database`,    lastModified: new Date(), changeFrequency: 'weekly' as const,  priority: 0.8 },
    { url: `${BASE}/meal-plan`,          lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE}/get-your-meal-plan`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },

    // Blog index
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },

    // Blog posts (dynamic — all slugs from getAllPosts())
    ...blogRoutes,

    // About
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },

    // Info pages
    { url: `${BASE}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE}/terms-of-use`,   lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE}/disclaimer`,     lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]
}
