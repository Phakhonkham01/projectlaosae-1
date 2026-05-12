import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '../../../../../../../../firebase/useFirebase'
import { User } from './_models'

const COLLECTION = 'Users'

// Get all
export const getUsers = async (): Promise<User[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION))
  return querySnapshot.docs.map(d => {
    const { _id, ...rest } = d.data()
    return { _id: d.id, ...rest } as User
  })
}

// Get by ID
export const getUserById = async (id: string): Promise<User | null> => {
  const docSnap = await getDoc(doc(db, COLLECTION, id))
  if (!docSnap.exists()) return null
  const { _id, ...rest } = docSnap.data()
  return { _id: docSnap.id, ...rest } as User
}

// Create - สร้าง Auth + Firestore พร้อมกัน
export const createUser = async (data: User & { password?: string }): Promise<User> => {
  const { _id, password, id, ...rest } = data as any  // ← destructure id ออกด้วย

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    password || '123456'
  )

  const uid = userCredential.user.uid

  // กรอง undefined fields ออกก่อน save
  const cleanData = Object.fromEntries(
    Object.entries({
      ...rest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).filter(([_, v]) => v !== undefined)
  )

  await setDoc(doc(db, COLLECTION, uid), cleanData)

  return { _id: uid, ...rest }
}

// Update
export const updateUser = async (id: string, data: Partial<User>): Promise<void> => {
  const { _id, ...rest } = data
  await updateDoc(doc(db, COLLECTION, id), {
    ...rest,
    updatedAt: new Date().toISOString()
  })
}

// Delete - ลบจาก Firestore เท่านั้น Cloud Function จะลบจาก Authentication อัตโนมัติ
export const deleteUser = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id))
}

// Delete selected
export const deleteSelectedUsers = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map(id => deleteUser(id)))
}