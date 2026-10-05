import type { CollectionConfig } from 'payload'
import { adminOnly, adminOnlyField, isAdminUser } from '@/lib/access'

// Роли: «Администратор» — всё; «Редактор» (заказчик) — контент и заявки,
// без пользователей и без вебхука Битрикс24.
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: {
    useAsTitle: 'email',
    group: 'Настройки',
    hidden: ({ user }) => !isAdminUser(user),
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    read: ({ req }) => (isAdminUser(req.user) ? true : { id: { equals: req.user?.id } }),
    create: adminOnly,
    update: ({ req }) => (isAdminUser(req.user) ? true : { id: { equals: req.user?.id } }),
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', label: 'Имя' },
    {
      name: 'role',
      type: 'select',
      label: 'Роль',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Редактор (контент и заявки)', value: 'editor' },
      ],
      access: { update: adminOnlyField },
    },
  ],
}
