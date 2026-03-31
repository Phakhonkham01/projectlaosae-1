import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../../../../../../../../firebase/useFirebase'
import { HistoryBooking } from './_models'

const COLLECTION = 'bill'

// Get all history
export const getHistoryBookings = async (): Promise<HistoryBooking[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  )
  return querySnapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as HistoryBooking[]
}

// Get by ID
export const getHistoryBookingById = async (id: string): Promise<HistoryBooking | null> => {
  const docSnap = await getDoc(doc(db, COLLECTION, id))
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as HistoryBooking
}

// Get by user_id
export const getHistoryBookingsByUserId = async (userId: string): Promise<HistoryBooking[]> => {
  const querySnapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where('user_id', '==', userId),
      orderBy('createdAt', 'desc')
    )
  )
  return querySnapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as HistoryBooking[]
}

// Get by status
export const getHistoryBookingsByStatus = async (
  status: HistoryBooking['status']
): Promise<HistoryBooking[]> => {
  const querySnapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    )
  )
  return querySnapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as HistoryBooking[]
}

// Create
export const createHistoryBooking = async (
  data: Omit<HistoryBooking, 'id'>
): Promise<HistoryBooking> => {
  const cleanData = Object.fromEntries(
    Object.entries({
      ...data,
      createdAt: new Date().toISOString(),
    }).filter(([_, v]) => v !== undefined)
  )

  const docRef = await addDoc(collection(db, COLLECTION), cleanData)
  return { id: docRef.id, ...cleanData } as HistoryBooking
}

// Update
export const updateHistoryBooking = async (
  id: string,
  data: Partial<HistoryBooking>
): Promise<void> => {
  const { id: _id, ...rest } = data as any
  await updateDoc(doc(db, COLLECTION, id), {
    ...rest,
    updatedAt: new Date().toISOString(),
  })
}

// Update payment status only
export const updatePaymentStatus = async (
  id: string,
  payment_status: string,
  slip_url?: string
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    payment_status,
    ...(slip_url !== undefined && { slip_url }),
    updatedAt: new Date().toISOString(),
  })
}

// Update booking status only
export const updateBookingStatus = async (
  id: string,
  status: HistoryBooking['status']
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updatedAt: new Date().toISOString(),
  })
}

// Delete
export const deleteHistoryBooking = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id))
}