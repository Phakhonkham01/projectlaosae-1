import { FC } from 'react'

type Props = {
  ship_name: string
  status?: string
}

const ShipInfoCell: FC<Props> = ({ ship_name, status }) => {
  const statusLabel =
    status === 'Active'
      ? 'ໃຊ້ງານ'
      : status === 'Inactive'
      ? 'ປິດໃຊ້ງານ'
      : status === 'Maintenance'
      ? 'ກຳລັງປັບປຸງເຮືອ'
      : status

  return (
    <div className="d-flex align-items-center">
      <div className="d-flex flex-column">
        <span className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">
          {ship_name}
        </span>
        {status && (
          <span className="text-gray-600 fw-semibold d-block fs-7">
            ສະຖານະ: {statusLabel}
          </span>
        )}
      </div>
    </div>
  )
}

export { ShipInfoCell }
