import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  experimental: {
    cssChunking: true,
    serverMinification: true,
  },

  turbopack: {
    // Set the root to the current project directory to bypass warning
    root: resolve(__dirname),
  },
  webpack: (config, { isServer }) => {
    if (config.experiments) {
      delete config.experiments.disableOptimizedPackageImports;
    }
    if (config.experiments?.experimental) {
      delete config.experiments.experimental.disableOptimizedPackageImports;
    }
    return config;
  },
};

export default nextConfig;
