import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { ru } from '@payloadcms/translations/languages/ru'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { PageTexts } from './globals/PageTexts'
import { LandingBlocks } from './globals/LandingBlocks'
import { seedLandingBlocks } from './lib/seed'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Фронт может жить на другом домене (HIXO, Pages) — тогда его адрес перечисляется в CORS_ORIGINS.
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Церебро Директ',
    },
  },
  collections: [Leads, Media, Users],
  globals: [PageTexts, LandingBlocks, SiteSettings],
  onInit: seedLandingBlocks,
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: 'ru',
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  cors: corsOrigins,
  csrf: corsOrigins,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Схема меняется только миграциями (npm run payload migrate:create → migrate), и локально, и на сервере.
    push: false,
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [],
})
