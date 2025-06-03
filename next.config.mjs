/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf2json'],
  },
  output: 'export', // This ensures the app is exported as static HTML
};

export default nextConfig;
