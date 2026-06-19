// ─── Product Model ────────────────────────────────────────────────────────────
export interface Product {
  product_id?: string    // alias ຂອງ Firestore doc id (ບໍ່ໄດ້ເກັບລົງ document)
  name: string           // ຊື່ສິນຄ້າ
  price: number          // ລາຄາ
  categoryId: string     // ອ້າງອີງ collection categories (FK)
  available: boolean     // ສະຖານະຄວາມພ້ອມ
  imageUrl: string       // ຮູບສິນຄ້າ
}

// ── aliases ให้ Metronic boilerplate ยังใช้ชื่อ User ได้ (ไม่ต้องแก้ทุกไฟล์) ──
export type User = Product

export type ProductCreate = Omit<Product, 'product_id'>
export type ProductUpdate = Partial<ProductCreate>

export const initialProduct: Product = {
  product_id: undefined,
  name: '',
  price: 0,
  categoryId: '',
  available: true,
  imageUrl: '',
}

// alias สำหรับ Metronic boilerplate ที่ใช้ initialUser
export const initialUser = initialProduct

// ─── Metronic Response types ──────────────────────────────────────────────────
export type ID = undefined | null | number | string

export type PaginationState = {
  page: number
  items_per_page: 10 | 30 | 50 | 100
  links?: Array<{
    label: string
    active: boolean
    url: string | null
    page: number | null
  }>
}

export type SortState = {
  sort?: string
  order?: 'asc' | 'desc'
}

export type FilterState = {
  filter?: Record<string, string | number | boolean>
}

export type SearchState = {
  search?: string
}

export type Response<T> = {
  data?: T
  payload?: {
    message?: string
    errors?: { [key: string]: Array<string> }
    pagination?: PaginationState
  }
}

export type QueryState = PaginationState & SortState & FilterState & SearchState

export type QueryRequestContextProps = {
  state: QueryState
  updateState: (updates: Partial<QueryState>) => void
}

export const initialQueryState: QueryState = {
  page: 1,
  items_per_page: 10,
}

export const initialQueryRequest: QueryRequestContextProps = {
  state: initialQueryState,
  updateState: () => {},
}

export type QueryResponseContextProps<T> = {
  response?: Response<Array<T>>
  refetch: () => void
  isLoading: boolean
  query: string
}

export const initialQueryResponse = {
  refetch: () => {},
  isLoading: false,
  query: '',
}