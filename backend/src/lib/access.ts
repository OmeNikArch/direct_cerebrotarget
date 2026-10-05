import type { Access, FieldAccess } from 'payload'

// Пользователь без роли (созданный до появления ролей) считается администратором.
export const isAdminUser = (user: unknown) => Boolean(user) && (user as { role?: string }).role !== 'editor'
export const loggedIn: Access = ({ req }) => Boolean(req.user)
export const adminOnly: Access = ({ req }) => isAdminUser(req.user)
export const adminOnlyField: FieldAccess = ({ req }) => isAdminUser(req.user)
