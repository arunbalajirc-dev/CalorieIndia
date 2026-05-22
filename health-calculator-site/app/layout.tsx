import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  icons: {
    icon: '/images/Nutrition tracker logo (256 x 256 px).png',
    apple: '/images/Nutrition tracker logo (256 x 256 px).png',
  },
  title: 'Nutrition Tracker — Personalized Indian Diet Plans',
  description: 'Get your personalized Indian meal plan based on your TDEE, BMI and health goals. Instant PDF download.',
  metadataBase: new URL('https://nutritiontracker.in'),
  openGraph: {
    title: 'Nutrition Tracker — Personalized Indian Diet Plans',
    description: 'Get your personalized Indian meal plan based on your TDEE, BMI and health goals. Instant PDF download.',
    url: 'https://nutritiontracker.in',
    siteName: 'NutritionTracker.in',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0HNX6C7YDC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0HNX6C7YDC');
          `}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@300;400;500;600&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />

        {/* Razorpay — loaded lazily, available site-wide */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
