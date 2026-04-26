import {Timestamp} from 'firebase/firestore'

export interface User {
  _id: string
  name: string
  lastname: string
  email: string
  password: string
  phone_number?: string
  status: 'Active' | 'Inactive'
  image_url?: string
  role: 'owner' | 'employee' | 'customer'
  createdAt?: Timestamp | string
  updatedAt?: Timestamp | string
}
