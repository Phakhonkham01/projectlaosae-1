export type PaymentMethod = 'cash' | 'transfer'

export type PaymentStatus =
  | 'pending'
  | 'slip_submitted'
  | 'approved'
  | 'rejected'
  | 're_submitted'

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
  dateRange?: 'today' | 'this_month' | 'this_year'
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = ['cash', 'transfer']

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = [
  'pending',
  'slip_submitted',
  'approved',
  'rejected',
  're_submitted',
]

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  {label: string; badgeClass: string}
> = {
  pending: {label: 'Pending', badgeClass: 'badge-light-warning'},
  slip_submitted: {label: 'Slip Submitted', badgeClass: 'badge-light-info'},
  approved: {label: 'Approved', badgeClass: 'badge-light-success'},
  rejected: {label: 'Rejected', badgeClass: 'badge-light-danger'},
  re_submitted: {label: 'Re-Submitted', badgeClass: 'badge-light-primary'},
}
