import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
 
// ─── Types ─────────────────────────────────────────────────────
interface FoodItem {
  image: string
  name: string
  price: number
  product_id: string
  quantity: number
}
 
interface HistoryBooking {
  id: string
  booking_date: string
  booking_time: string
  createdAt: Timestamp | string
  foods: FoodItem[]
  grand_total: number
  num_hours: number
  num_people: number
  payment_method: string
  payment_status: string
  reject_reason?: string
  ship_id: string
  ship_name: string
  ship_price_per_hour: number
  slip_url: string
  status:
    | 'pending'
    | 'approved'
    | 'used'
    | 'rejected'
    | 'payment failed'
    | 'payment_failed'
    | 'slip_submitted'
    | 're_submitted'
    | 'under_review_again'
  total_food_price: number
  total_ship_price: number
  user_email: string
  user_id: string
  user_name: string
  customer_name?: string
  customer_phone?: string
  booked_by_name?: string
  booked_by_email?: string
  booked_by_role?: string
}

export type { HistoryBooking, FoodItem }
