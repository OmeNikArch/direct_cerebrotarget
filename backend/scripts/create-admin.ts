// Создаёт первого администратора из ADMIN_EMAIL / ADMIN_PASSWORD (.env), если его ещё нет.
// Нужно до открытия админки наружу: иначе первый посетитель /admin сам создаст себе аккаунт.
import { getPayload } from 'payload'
import config from '@payload-config'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
if (!email || !password) {
  console.error('Задайте ADMIN_EMAIL и ADMIN_PASSWORD в .env')
  process.exit(1)
}

const payload = await getPayload({ config })
const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (existing.docs.length) {
  console.log(`Администратор ${email} уже есть`)
} else {
  await payload.create({ collection: 'users', data: { email, password, name: 'Администратор' } })
  console.log(`Создан администратор ${email}`)
}
process.exit(0)
