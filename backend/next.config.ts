import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Тестовый показ через Cloudflare-туннель.
  allowedDevOrigins: ['*.trycloudflare.com'],
  // Лендинг: ассеты — копия ../site в public/ (scripts/sync-site.mjs); index.html, script.js и quiz.mjs
  // собираются с данными админки маршрутами src/app/(site).
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
