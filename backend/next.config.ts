import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Тестовый показ через Cloudflare-туннель.
  allowedDevOrigins: ['*.trycloudflare.com'],
  // Лендинг — статическая копия ../site в public/ (scripts/sync-site.mjs). Корень отдаёт его index.html.
  async rewrites() {
    return [{ source: '/', destination: '/index.html' }]
  },
  async headers() {
    return [
      {
        source: '/:path*.mjs',
        headers: [{ key: 'Content-Type', value: 'text/javascript; charset=utf-8' }],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
