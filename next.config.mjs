/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optional: keep fetch URL logging if you need it
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Enable React strict mode – recommended for all Next.js apps
  reactStrictMode: true,
};

export default nextConfig;
