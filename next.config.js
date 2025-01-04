/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Images must be handled differently in static sites
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig