import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '../../../../../../../../firebase/useFirebase' // ✅ ปรับ path ให้ตรงกับโปรเจค
import { Product, ProductCreate, ProductUpdate, Response } from './_models'

const PRODUCTS = 'products'
const colRef = () => collection(db, PRODUCTS)

// ─── Helper: strip undefined fields ──────────────────────────────────────────
// Firestore ไม่รับ undefined — ต้องกรอง field ที่เป็น undefined ออกทั้งหมด
const toFirestore = (data: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined))

// ─── getUsers — Metronic QueryResponseProvider ────────────────────────────────
export const getUsers = async (queryString: string): Promise<Response<Array<Product>>> => {
  const params = new URLSearchParams(queryString)
  const search = params.get('search')?.toLowerCase() ?? ''
  const page = parseInt(params.get('page') ?? '1', 10)
  const perPage = parseInt(params.get('items_per_page') ?? '10', 10)

  const snapshot = await getDocs(colRef())
  let all: Product[] = snapshot.docs.map(
    (d) => ({ product_id: d.id, ...d.data() } as Product)
  )

  if (search) {
    all = all.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.category_id.toLowerCase().includes(search)
    )
  }

  // ── client-side filter ────────────────────────────────────────────────────
  // Metronic stringifyRequestQuery flat-maps filter keys ออกมาเป็น params ตรงๆ
  // เช่น category_id=xxx&availability=true (ไม่ได้ wrap ใน filter=...)
  const filterCategoryId = params.get('category_id')
  const filterAvailability = params.get('availability')

  if (filterCategoryId) {
    all = all.filter((p) => p.category_id === filterCategoryId)
  }
  if (filterAvailability !== null && filterAvailability !== '') {
    const wantAvailable = filterAvailability === 'true'
    all = all.filter((p) => p.availability === wantAvailable)
  }

  const total = all.length
  const totalPages = Math.max(Math.ceil(total / perPage), 1)
  const start = (page - 1) * perPage
  const data = all.slice(start, start + perPage)

  // Metronic sliceLinks() expects: [Previous, ...pages, Next]
  const links = [
    {
      label: '&laquo; Previous',
      active: false,
      url: page > 1 ? `?page=${page - 1}` : null,
      page: page > 1 ? page - 1 : null,
    },
    ...Array.from({ length: totalPages }, (_, i) => ({
      label: String(i + 1),
      active: i + 1 === page,
      url: `?page=${i + 1}`,
      page: i + 1,
    })),
    {
      label: 'Next &raquo;',
      active: false,
      url: page < totalPages ? `?page=${page + 1}` : null,
      page: page < totalPages ? page + 1 : null,
    },
  ]

  return {
    data,
    payload: {
      pagination: {
        page,
        items_per_page: perPage as 10 | 30 | 50 | 100,
        links,
      },
    },
  }
}

// ─── getUserById ──────────────────────────────────────────────────────────────
export const getUserById = async (id: string): Promise<Product | undefined> => {
  const snap = await getDoc(doc(db, PRODUCTS, id))
  if (!snap.exists()) return undefined
  return { product_id: snap.id, ...snap.data() } as Product
}

// ─── createUser ───────────────────────────────────────────────────────────────
export const createUser = async (data: Product | ProductCreate): Promise<Product> => {
  // ✅ เก็บเฉพาะ 5 fields ของ Product เท่านั้น ตัด id, product_id และ undefined ทั้งหมด
  const clean = toFirestore({
    name: data.name,
    price: data.price,
    category_id: data.category_id,
    availability: data.availability,
    image: data.image,
  })
  const docRef = await addDoc(colRef(), clean)
  return { product_id: docRef.id, ...clean } as Product
}

// ─── updateUser ───────────────────────────────────────────────────────────────
export const updateUser = async (data: Product): Promise<Product> => {
  const { product_id } = data
  if (!product_id) throw new Error('product_id is required for update')
  // ✅ เก็บเฉพาะ 5 fields เช่นกัน
  const clean = toFirestore({
    name: data.name,
    price: data.price,
    category_id: data.category_id,
    availability: data.availability,
    image: data.image,
  })
  await updateDoc(doc(db, PRODUCTS, product_id), clean)
  return { product_id, ...clean } as Product
}

// ─── deleteUser ───────────────────────────────────────────────────────────────
export const deleteUser = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, PRODUCTS, id))
}

// ─── deleteSelectedUsers ──────────────────────────────────────────────────────
export const deleteSelectedUsers = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => deleteDoc(doc(db, PRODUCTS, id))))
}

// ─── getProductsByCategory ────────────────────────────────────────────────────
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const constraints: QueryConstraint[] = [
    where('category_id', '==', categoryId),
    orderBy('name'),
  ]
  const snapshot = await getDocs(query(colRef(), ...constraints))
  return snapshot.docs.map((d) => ({ product_id: d.id, ...d.data() } as Product))
}