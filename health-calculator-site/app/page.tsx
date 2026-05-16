import HomeClient from '@/components/HomeClient'

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://nutritiontracker.in/#organization',
      name: 'CalorieIndia',
      url: 'https://nutritiontracker.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nutritiontracker.in/images/nutrition-tracker-logo.png',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://nutritiontracker.in/#website',
      url: 'https://nutritiontracker.in',
      name: 'CalorieIndia',
      publisher: { '@id': 'https://nutritiontracker.in/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://nutritiontracker.in/food-database?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomeClient />
    </>
  )
}
