/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Only use static export in production
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    images: {
      unoptimized: true
    },
    trailingSlash: true,
    distDir: '../_build'
  })
};

module.exports = nextConfig;