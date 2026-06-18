import { FC } from 'react'

type Props = {
  price: number
}

const ShipPriceCell: FC<Props> = ({ price }) => {
  // Format as Lao Kip
  const formattedPrice = `${price?.toLocaleString() ?? '—'} ກີບ`

  return <div className="fw-bold text-end">{formattedPrice}</div>
}

export { ShipPriceCell }