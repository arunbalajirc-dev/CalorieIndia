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
};

export default nextConfig;
