import { FC } from 'react'
import { ShipStatus, SHIP_STATUS_META } from '../../../../../../../../../firebase/schema'

type Props = {
  name: string
  status?: ShipStatus
}

const ShipInfoCell: FC<Props> = ({ name, status }) => {
  const getStatusLabel = (s: ShipStatus) => SHIP_STATUS_META[s]?.label ?? s

  return (
    <div className="d-flex align-items-center">
      <div className="d-flex flex-column">
        <span className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">
          {name}
        </span>
        {status && (
          <span className="text-gray-600 fw-semibold d-block fs-7">
            ສະຖານະ: {getStatusLabel(status)}
          </span>
        )}
      </div>
    </div>
  )
}

export { ShipInfoCell }
