import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import {db} from '../../../../../../../../firebase/useFirebase'
import {BillData, PaymentStatus} from './bill_models'

const BILLS_COLLECTION = 'booking'
const BILL_DETAILS_COLLECTION = 'booking_details'

// ດຶງ field ລະອຽດການຊຳລະ (cash/transfer/bcel) ຈາກ booking_details.
// doc ເກົ່າທີ່ບໍ່ມີ booking_details ຈະ return {} → detail modal fallback ໃຊ້ field ໃນ booking ເອງ
export const getBookingDetails = async (
  billId: string
): Promise<Partial<BillData>> => {
  const snap = await getDoc(doc(db, BILL_DETAILS_COLLECTION, billId))
  return snap.exists() ? (snap.data() as Partial<BillData>) : {}
}

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
  selectedStatus: PaymentStatus,
  reject_reason?: string
): Promise<void> => {
  // 'used' = ລູກຄ້າເຂົ້າມາໃຊ້ງານແລ້ວ → ເປັນ "ສະຖານະການຈອງ" (field `status`),
  // ການຊຳລະຍັງຄົງເປັນ approved. ສ່ວນ approved/rejected ຂຽນທັງ payment_status ແລະ status ໃຫ້ກົງກັນ.
  const payload =
    selectedStatus === 'used'
      ? {status: 'used', payment_status: 'approved', reject_reason: ''}
      : {
          payment_status: selectedStatus,
          status: selectedStatus,
          reject_reason: selectedStatus === 'rejected' ? reject_reason || '' : '',
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
    batch.delete(doc(db, BILL_DETAILS_COLLECTION, id))
  })
  await batch.commit()
}

export const getShips = getBills
export const getShipById = getBillById
export const deleteShip = async (billId: string): Promise<void> => {
  await deleteSelectedBills([billId])
}
export const deleteSelectedShips = deleteSelectedBills
