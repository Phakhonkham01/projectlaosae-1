export type PaymentMethod = 'cash' | 'transfer' | 'cash+transfer' | 'bcel'

export type PaymentStatus =
  | 'pending'
  | 'slip_submitted'
  | 'approved'
  | 'rejected'
  | 're_submitted'
  | 'payment failed'
  | 'under_review_again'

export interface FoodItem {
  product_id: string
  name: string
  price: number
  quantity: number
}

export interface BillData {
  id: string
  name?: string
  ship_id?: string
  ship_name: string
  image_url?: string
  capacity?: number
  price?: number
  quantity?: number
  status?: string
  booking_date: string
  booking_time: string
  num_people: number
  num_hours: number
  ship_price_per_hour: number
  total_ship_price: number
  foods: FoodItem[]
  total_food_price: number
  grand_total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  slip_url?: string
  cash_amount?: number
  transfer_amount?: number
  bcel_amount_usd?: number
  user_id?: string
  user_name: string
  user_email: string
  reject_reason?: string
  createdAt?: string
}

export type ShipData = BillData

export type BillFilter = {
  bookingDateFrom?: string
  bookingDateTo?: string
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  dateRange?: 'day' | 'month' | 'year'
  dateDay?: number
  dateMonth?: number
  dateYear?: number
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = ['cash', 'transfer', 'cash+transfer', 'bcel']

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = [
  'pending',
  'slip_submitted',
  'approved',
  'rejected',
  're_submitted',
  'payment failed',
  'under_review_again',
]

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  {label: string; badgeClass: string}
> = {
  pending: {label: 'ລໍຖ້າ', badgeClass: 'badge-light-warning'},
  slip_submitted: {label: 'ສົ່ງສະລິບແລ້ວ', badgeClass: 'badge-light-info'},
  approved: {label: 'ອະນຸມັດແລ້ວ', badgeClass: 'badge-light-success'},
  rejected: {label: 'ປະຕິເສດ', badgeClass: 'badge-light-danger'},
  re_submitted: {label: 'ສົ່ງກວດອີກຄັ້ງ', badgeClass: 'badge-light-info'},
  'payment failed': {label: 'ຊຳລະບໍ່ສຳເລັດ', badgeClass: 'badge-light-danger'},
  under_review_again: {label: 'ກວດສອບອີກຄັ້ງ', badgeClass: 'badge-light-primary'},
}
