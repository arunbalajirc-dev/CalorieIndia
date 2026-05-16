import HomeClient from '@/components/HomeClient'

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://calorieindia.com/#organization',
      name: 'CalorieIndia',
      url: 'https://calorieindia.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://calorieindia.com/logo.png',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://calorieindia.com/#website',
      url: 'https://calorieindia.com',
      name: 'CalorieIndia',
      publisher: { '@id': 'https://calorieindia.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://calorieindia.com/food-database?q={search_term_string}',
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
