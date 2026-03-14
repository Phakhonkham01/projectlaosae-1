import { FC } from 'react'

type Props = {
  price: number
}

const ShipPriceCell: FC<Props> = ({ price }) => {
  // Format as currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)

  return <div className="fw-bold text-end">{formattedPrice}</div>
}

export { ShipPriceCell }