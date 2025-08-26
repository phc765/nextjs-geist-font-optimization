import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    }

    // Handle WebAssembly files for Tesseract.js
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Handle binary files
    config.module.rules.push({
      test: /\.(wasm|pdf)$/,
      type: 'asset/resource',
    })

    // Handle worker files
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    })

    return config
  },
  // Enable experimental features for file handling
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist', 'tesseract.js', 'docx'],
  },
}

export default nextConfig
