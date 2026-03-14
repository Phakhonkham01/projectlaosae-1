// core/ship_models.ts
export interface ShipData {
  id?: string
  name: string
  capacity: number
  image_url: string
  price: number
  quantity: number
  ship_name: string
  status: 'Active' | 'Inactive' | 'Maintenance'
  createdAt?: string
  updatedAt?: string
  status_color?: string
}

export interface ShipQueryResponse {
  data: ShipData[]
  total: number
  page: number
  lastPage: number
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
}