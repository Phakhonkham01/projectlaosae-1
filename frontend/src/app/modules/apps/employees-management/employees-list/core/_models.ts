export interface User {
  id?: string
  username: string
  email: string
  first_name: string
  last_name: string
  department_id: string
  position_id: string
  leave_days: number
  status: 'Active' | 'Inactive' | 'On Leave'
  image_url: string
  createdAt?: string
  updatedAt?: string
}