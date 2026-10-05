import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: {
    useAsTitle: 'email',
    group: 'Настройки',
  },
  auth: {
    // Защита админки от перебора пароля.
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  fields: [{ name: 'name', type: 'text', label: 'Имя' }],
}
