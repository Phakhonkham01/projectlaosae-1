import { FC } from 'react'

type Props = {
  capacity: number
}

const ShipCapacityCell: FC<Props> = ({ capacity }) => {
  return (
    <div className="text-end">
      <span className="fw-semibold">{capacity.toLocaleString()}</span>
      <span className="text-gray-600 fw-semibold fs-7 ms-1">ທີ່ນັ່ງ</span>
    </div>
  )
}

export { ShipCapacityCell }
