import { FC } from 'react'

type Props = {
  quantity: number
}

const ShipQuantityCell: FC<Props> = ({ quantity }) => {
  const getBadgeClass = (qty: number) => {
    if (qty <= 0) return 'badge-light-danger'
    if (qty < 10) return 'badge-light-warning'
    return 'badge-light-success'
  }

  return (
    <div className="text-center">
      <span className={`badge ${getBadgeClass(quantity)} fw-bold px-3 py-2`}>
        {quantity}
      </span>
    </div>
  )
}

export { ShipQuantityCell }