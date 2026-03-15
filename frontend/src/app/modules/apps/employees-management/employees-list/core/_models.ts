import { Timestamp } from 'firebase/firestore'

// ─── Department ───────────────────────────────────────────────


// ─── User (Firestore collection: USER) ────────────────────────
// Firestore fields: name, lastname, email, phone_number, status, createdAt
// Extended with: username, first_name, last_name, leave_days, image_url
export interface User {
  _id: string                              // Firestore document ID (= Firebase Auth UID)
  name: string                             // ชื่อ (Firestore field)
  lastname: string                         // นามสกุล (Firestore field)
  email: string     
  password: string                       // อีเมล (Firestore field)
  phone_number?: string                    // เบอร์โทร (Firestore field)
  status: 'Active' | 'Inactive' | 'On Leave' // สถานะ (Firestore field)
  image_url?: string                       // รูปโปรไฟล์ (Firebase Storage URL)                    // วันลาคงเหลือ
  role:   'ownner' | 'employee'       // บทบาท
  createdAt?: Timestamp | string
  updatedAt?: Timestamp | string
}


// ─── Firestore document shape (raw) ───────────────────────────
// ใช้สำหรับ type snap.data() ให้ถูกต้อง
export interface UserFirestoreDoc {
  name:          string
  lastname:      string
  email:         string
  phone_number?: string
  status:        'Active' | 'Inactive' | 'On Leave'
  image_url?:    string
  leave_days?:   number
  role?:         'CEO' | 'admin' | 'employee'
  department_id?: string | null
  createdAt?:    Timestamp
  updatedAt?:    Timestamp
}