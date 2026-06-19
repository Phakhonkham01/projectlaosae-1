import { FC } from 'react'
import { ShipStatus, SHIP_STATUS_META } from '../../../../../../../../../firebase/schema'

type Props = {
  status: ShipStatus
}

const ShipStatusCell: FC<Props> = ({ status }) => {
  const meta = SHIP_STATUS_META[status] ?? SHIP_STATUS_META.active
  return (
    <div className="text-center">
      <span className={`badge badge-light-${meta.color} fw-bold px-3 py-2`}>
        {meta.label}
      </span>
    </div>
  )
}

export { ShipStatusCell }
