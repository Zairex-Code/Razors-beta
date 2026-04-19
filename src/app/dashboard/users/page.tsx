import { getUsers } from '@/app/actions/user-actions'
import UsersPageClient from './UsersPageClient'

export default async function UsersPage() {
  const users = await getUsers()

  const formattedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString()
  }))

  return <UsersPageClient initialUsers={formattedUsers} />
}
