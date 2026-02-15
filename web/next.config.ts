import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // AJOUTÉ : Indispensable pour l'APK
  basePath: '/web', // AJOUTÉ : Pour que le site fonctionne dans le sous-dossier /web
  assetPrefix: '/web', // AJOUTÉ : Pour que les assets se chargent correctement
  transpilePackages: ['@genkit-ai/next'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // AJOUTÉ : Obligatoire avec 'output: export'
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
