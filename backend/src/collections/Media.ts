import type { CollectionConfig } from 'payload'
import { loggedIn } from '@/lib/access'
import { invalidateHook } from '@/lib/siteCache'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Картинка', plural: 'Картинки' },
  admin: { group: 'Контент сайта' },
  access: {
    read: () => true,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  hooks: { afterChange: [invalidateHook], afterDelete: [invalidateHook] },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
  },
  fields: [{ name: 'alt', type: 'text', label: 'Описание (alt)' }],
}
