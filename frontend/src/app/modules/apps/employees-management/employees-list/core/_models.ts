import { Timestamp } from 'firebase/firestore'

export interface User {
  _id: string                              // Firestore document ID (= Firebase Auth UID)
  name: string                             // ชื่อ (Firestore field)
  lastname: string                         // นามสกุล (Firestore field)
  email: string
  password: string                       // อีเมล (Firestore field)
  phone_number?: string                    // เบอร์โทร (Firestore field)
  status: 'Active' | 'Inactive' | 'On Leave' // สถานะ (Firestore field)
  image_url?: string                       // รูปโปรไฟล์ (Firebase Storage URL)                    // วันลาคงเหลือ
  role: 'owner' | 'employee' | 'customer'     // บทบาท
  createdAt?: Timestamp | string
  updatedAt?: Timestamp | string
}


