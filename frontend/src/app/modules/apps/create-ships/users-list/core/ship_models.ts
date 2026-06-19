// core/ship_models.ts
// ShipData = canonical ShipDoc (ເບິ່ງ /firebase/schema.ts). id ເປັນ optional ສຳລັບ form ຕອນສ້າງໃໝ່.
import {ShipDoc, ShipStatus} from '../../../../../../../../firebase/schema'

export type {ShipStatus}

export interface ShipData extends Omit<ShipDoc, 'id'> {
  id?: string
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
