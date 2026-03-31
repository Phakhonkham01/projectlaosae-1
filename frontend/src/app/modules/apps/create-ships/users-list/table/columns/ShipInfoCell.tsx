import { FC } from 'react'

type Props = {
  ship_name: string
  status?: string
}

const ShipInfoCell: FC<Props> = ({ ship_name, status }) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Active':
        return 'ພ້ອມໃຊ້ງານ'
      case 'Inactive':
        return 'ບໍ່ພ້ອມໃຊ້ງານ'
      case 'Maintenance':
        return 'ກຳລັງບຳລຸງຮັກສາ'
      default:
        return status
    }
  }

  return (
    <div className="d-flex align-items-center">
      <div className="d-flex flex-column">
        <span className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">
          {ship_name}
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
