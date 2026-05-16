/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/blog',                        destination: '/blog.html'                        },
      { source: '/macro-calculator',            destination: '/macro-calculator.html'            },
      { source: '/calorie-deficit-calculator',  destination: '/calorie-deficit-calculator.html'  },
      { source: '/calorie-burn-calculator',     destination: '/calorie-burn-calculator.html'     },
      { source: '/ideal-weight-calculator',     destination: '/ideal-weight-calculator.html'     },
    ];
  },
  async redirects() {
    return [
      { source: '/index.html',                      destination: '/',                           permanent: true },
      { source: '/calculator.html',                 destination: '/calculator',                 permanent: true },
      { source: '/tdee-calculator.html',            destination: '/tdee-calculator',            permanent: true },
      { source: '/bmi-calculator.html',             destination: '/bmi-calculator',             permanent: true },
      { source: '/macro-calculator.html',           destination: '/macro-calculator',           permanent: true },
      { source: '/calorie-deficit-calculator.html', destination: '/calorie-deficit-calculator', permanent: true },
      { source: '/calorie-burn-calculator.html',    destination: '/calorie-burn-calculator',    permanent: true },
      { source: '/ideal-weight-calculator.html',    destination: '/ideal-weight-calculator',    permanent: true },
      { source: '/food-database.html',              destination: '/food-database',              permanent: true },
      { source: '/recipe-database.html',            destination: '/recipe-database',            permanent: true },
      { source: '/meal-plan.html',                  destination: '/meal-plan',                  permanent: true },
      { source: '/get-your-meal-plan.html',         destination: '/get-your-meal-plan',         permanent: true },
      { source: '/privacy-policy.html',             destination: '/privacy-policy',             permanent: true },
      { source: '/terms-of-use.html',               destination: '/terms-of-use',               permanent: true },
      { source: '/disclaimer.html',                 destination: '/disclaimer',                 permanent: true },
      { source: '/about.html',                      destination: '/about',                      permanent: true },
      { source: '/weight-loss.html',                destination: '/blog',                       permanent: true },
    ];
  },
};

export default nextConfig;
