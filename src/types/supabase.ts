export type Role = 'ADMIN' | 'BOSS' | 'EMPLOYEE'

export interface UserMetadata {
  role: Role
  name: string
}