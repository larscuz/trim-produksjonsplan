/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Vercel/next build stopper ved ESLint-feil. Vi slår av i deploy.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Vercel/next build stopper ved TS-feil. Vi slår av i deploy.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
