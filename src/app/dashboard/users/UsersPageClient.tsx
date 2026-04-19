'use client'

import { useState } from 'react'
import { toggleUserStatus, changeUserRole, createUserAction } from '@/app/actions/user-actions'
import { ShieldAlert, UserPlus, Power, Users as UsersIcon } from 'lucide-react'
import { Role } from '@prisma/client'
import Swal from 'sweetalert2'

type User = {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
}

export default function UsersPageClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' as Role })

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setIsLoading(userId)
    try {
      await toggleUserStatus(userId, currentStatus)
      setUsers(users.map(u =>
        u.id === userId ? { ...u, isActive: !currentStatus } : u
      ))
    } finally {
      setIsLoading(null)
    }
  }

  const handleChangeRole = async (userId: string, newRole: Role) => {
    setIsLoading(userId)
    try {
      await changeUserRole(userId, newRole)
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ))
    } finally {
      setIsLoading(null)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      Swal.fire({
        title: 'Missing fields',
        text: 'Please fill in all fields.',
        icon: 'warning',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#a855f7'
      })
      return
    }

    setIsCreating(true)
    try {
      const formData = new FormData()
      formData.set('name', newUser.name)
      formData.set('email', newUser.email)
      formData.set('password', newUser.password)
      formData.set('role', newUser.role)

      await createUserAction(formData)

      setIsAddingUser(false)
      setNewUser({ name: '', email: '', password: '', role: 'EMPLOYEE' })

      Swal.fire({
        title: 'User Created',
        text: `${newUser.name} has been added successfully.`,
        icon: 'success',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#a855f7',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500
      })

      window.location.reload()
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to create user.',
        icon: 'error',
        background: '#0a0a0a',
        color: '#ffffff',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getRoleBadgeStyles = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      case 'BOSS':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  const getRoleBgColor = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-600'
      case 'BOSS':
        return 'bg-cyan-600'
      default:
        return 'bg-gray-700'
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            User <span className="text-purple-500">Management</span>
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-500" />
            System Administrator Area
          </p>
        </div>
        <button
          onClick={() => setIsAddingUser(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        >
          <UserPlus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      <div className="w-full bg-background/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.05)]">
        <table className="w-full text-left">
          <thead className="bg-black/80 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-widest">
            <tr>
              <th className="p-5 font-medium">User Profile</th>
              <th className="p-5 font-medium">Role</th>
              <th className="p-5 font-medium">Status</th>
              <th className="p-5 font-medium">Joined Date</th>
              <th className="p-5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-800/50 hover:bg-purple-900/10 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getRoleBgColor(user.role)}`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value as Role)}
                    disabled={isLoading === user.id}
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider border ${getRoleBadgeStyles(user.role)} bg-transparent`}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="BOSS">BOSS</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                  </select>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                    <span className="text-sm font-medium">{user.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </td>
                <td className="p-5 text-sm text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-5 text-right">
                  <button
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                    disabled={isLoading === user.id}
                    className={`p-2 rounded-lg transition-all ${user.isActive ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' : 'text-green-400 hover:bg-green-500/10 hover:text-green-300'}`}
                    title={user.isActive ? 'Deactivate User' : 'Activate User'}
                  >
                    <Power className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#111111] rounded-[2rem] p-8 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <UsersIcon className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white tracking-tight">Add New User</h2>
                </div>
                <button
                  onClick={() => setIsAddingUser(false)}
                  className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-foreground/10 transition-all"
                >
                  ×
                </button>
              </div>

              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                    className="w-full glass-input rounded-xl py-3 px-4 text-sm bg-[#0a0a0a] text-white appearance-none"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="BOSS">BOSS</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-foreground/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateUser}
                    disabled={isCreating}
                    className="px-8 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm tracking-tight hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
