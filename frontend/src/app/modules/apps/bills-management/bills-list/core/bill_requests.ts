import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import {db} from '../../../../../../../../firebase/useFirebase'
import {BillData, PaymentStatus} from './bill_models'

const BILLS_COLLECTION = 'booking'

export const getBills = async (): Promise<BillData[]> => {
  const billsRef = collection(db, BILLS_COLLECTION)
  const billQuery = query(billsRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(billQuery)

  return snapshot.docs.map((billDoc) => ({
    id: billDoc.id,
    ...billDoc.data(),
  })) as BillData[]
}

export const getBillById = async (billId: string): Promise<BillData | null> => {
  const bills = await getBills()
  return bills.find((bill) => bill.id === billId) || null
}

export const updateBillStatus = async (
  billId: string,
  payment_status: PaymentStatus,
  reject_reason?: string
): Promise<void> => {
  const payload = {
    payment_status,
    reject_reason: payment_status === 'rejected' ? reject_reason || '' : '',
  }

  await updateDoc(doc(db, BILLS_COLLECTION, billId), payload)
}

export const deleteSelectedBills = async (selectedIds: string[]): Promise<void> => {
  if (!selectedIds.length) {
    return
  }

  const batch = writeBatch(db)
  selectedIds.forEach((id) => {
    batch.delete(doc(db, BILLS_COLLECTION, id))
  })
  await batch.commit()
}

export const getShips = getBills
export const getShipById = getBillById
export const deleteShip = async (billId: string): Promise<void> => {
  await deleteSelectedBills([billId])
}
export const deleteSelectedShips = deleteSelectedBills
