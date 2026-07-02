// core/ship_requests.ts
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy 
} from 'firebase/firestore'
import { db } from '../../../../../../../../firebase/useFirebase'
import { ShipData } from './ship_models'

const SHIPS_COLLECTION = 'ship'

// ─── Normalize ──────────────────────────────────────────────────────────────
// ໜ້າສ້າງເຮືອ (create-ships) ບັນທຶກ field ຊື່ pricePerHour / imageUrl
// ແຕ່ໂມເດລການຈອງໃຊ້ price / image_url — ຕ້ອງແມັບໃຫ້ກົງ (ຮອງຮັບທັງຊື່ເກົ່າ ແລະ ໃໝ່)
const normalizeShip = (id: string, raw: Record<string, any>): ShipData => ({
  ...(raw as ShipData),
  id,
  name: raw.name ?? raw.ship_name ?? '',
  ship_name: raw.ship_name ?? raw.name ?? '',
  price: raw.price ?? raw.pricePerHour ?? 0,
  image_url: raw.image_url ?? raw.imageUrl ?? '',
})

// Get all ships
export const getShips = async (): Promise<ShipData[]> => {
  try {
    const shipsRef = collection(db, SHIPS_COLLECTION)
    const q = query(shipsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    const ships: ShipData[] = []
    querySnapshot.forEach((doc) => {
      ships.push(normalizeShip(doc.id, doc.data()))
    })

    return ships
  } catch (error) {
    console.error('Error getting ships:', error)
    throw error
  }
}

// Get ship by ID
export const getShipById = async (id: string): Promise<ShipData | null> => {
  try {
    const shipRef = doc(db, SHIPS_COLLECTION, id)
    const shipSnap = await getDoc(shipRef)

    if (shipSnap.exists()) {
      return normalizeShip(shipSnap.id, shipSnap.data())
    }
    return null
  } catch (error) {
    console.error('Error getting ship:', error)
    throw error
  }
}

// Create ship
export const createShip = async (shipData: ShipData): Promise<ShipData> => {
  try {
    const shipsRef = collection(db, SHIPS_COLLECTION)
    const docRef = await addDoc(shipsRef, {
      ...shipData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    return {
      id: docRef.id,
      ...shipData
    }
  } catch (error) {
    console.error('Error creating ship:', error)
    throw error
  }
}

// Update ship
export const updateShip = async (id: string, shipData: Partial<ShipData>): Promise<void> => {
  try {
    const shipRef = doc(db, SHIPS_COLLECTION, id)
    await updateDoc(shipRef, {
      ...shipData,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating ship:', error)
    throw error
  }
}

// Delete ship
export const deleteShip = async (id: string): Promise<void> => {
  try {
    const shipRef = doc(db, SHIPS_COLLECTION, id)
    await deleteDoc(shipRef)
  } catch (error) {
    console.error('Error deleting ship:', error)
    throw error
  }
}

// Delete multiple ships
export const deleteSelectedShips = async (selectedIds: string[]): Promise<void> => {
  try {
    const deletePromises = selectedIds.map(id => deleteShip(id))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error deleting ships:', error)
    throw error
  }
}