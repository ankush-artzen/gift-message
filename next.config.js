/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_HOST: process.env.HOST,
    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  },
  async headers() {
    return [
      {
        source: '/:path*.png',
        headers: [
          {key: 'Access-Control-Allow-Origin', value: '*'},
        ],
      },
    ]
  },
}

module.exports = nextConfig
