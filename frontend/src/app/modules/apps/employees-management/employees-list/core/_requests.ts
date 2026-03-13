import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../../../../firebase/useFirebase'
import { User } from './_models'

const COLLECTION = 'users'

// Get all
export const getUsers = async (): Promise<User[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION))
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
}

// Get by ID
export const getUserById = async (id: string): Promise<User | null> => {
  const docSnap = await getDoc(doc(db, COLLECTION, id))
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as User : null
}

// Create
export const createUser = async (data: User): Promise<User> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  return { id: docRef.id, ...data }
}

// Update
export const updateUser = async (id: string, data: Partial<User>): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString()
  })
}

// Delete
export const deleteUser = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id))
}

// Delete selected
export const deleteSelectedUsers = async (ids: string[]): Promise<void> => {
  const promises = ids.map(id => deleteUser(id))
  await Promise.all(promises)
}