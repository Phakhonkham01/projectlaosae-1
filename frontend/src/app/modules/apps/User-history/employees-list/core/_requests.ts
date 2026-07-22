import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../../../../../../../../firebase/useFirebase'
import { HistoryBooking } from './_models'

const COLLECTION = 'booking'
const DETAILS_COLLECTION = 'booking_details'

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
  // merge field ລະອຽດ (booked_by_*, customer_*) ຈາກ booking_details;
  // doc ເກົ່າທີ່ບໍ່ມີ booking_details → fallback ໃຊ້ field ໃນ booking ເອງ
  const detailsSnap = await getDoc(doc(db, DETAILS_COLLECTION, id))
  const details = detailsSnap.exists() ? detailsSnap.data() : {}
  return { id: docSnap.id, ...docSnap.data(), ...details } as HistoryBooking
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
  const payload = {
    payment_status,
    ...(slip_url !== undefined && { slip_url }),
    updatedAt: new Date().toISOString(),
  }

  await updateDoc(doc(db, COLLECTION, id), payload)
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
  await deleteDoc(doc(db, DETAILS_COLLECTION, id))
}
