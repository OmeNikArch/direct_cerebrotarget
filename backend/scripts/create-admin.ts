// Создаёт пользователя из ADMIN_EMAIL / ADMIN_PASSWORD (.env), если его ещё нет.
// Нужно до открытия админки наружу: иначе первый посетитель /admin сам создаст себе аккаунт.
// Редактор (доступ заказчику): ADMIN_ROLE=editor ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run create-admin
import { getPayload } from 'payload'
import config from '@payload-config'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const role = process.env.ADMIN_ROLE === 'editor' ? 'editor' : 'admin'
if (!email || !password) {
  console.error('Задайте ADMIN_EMAIL и ADMIN_PASSWORD в .env')
  process.exit(1)
}

const payload = await getPayload({ config })
const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (existing.docs.length) {
  console.log(`Пользователь ${email} уже есть`)
} else {
  await payload.create({ collection: 'users', data: { email, password, role, name: role === 'editor' ? 'Редактор' : 'Администратор' } })
  console.log(`Создан пользователь ${email} (${role})`)
}
process.exit(0)
