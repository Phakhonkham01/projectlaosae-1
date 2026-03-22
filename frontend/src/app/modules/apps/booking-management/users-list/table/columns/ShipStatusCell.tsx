import { FC } from 'react'

type Props = {
  status: 'Active' | 'Inactive' | 'Maintenance'
}

const ShipStatusCell: FC<Props> = ({ status }) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Active':
        return 'ໃຊ້ງານ'
      case 'Inactive':
        return 'ບໍ່ໃຊ້ງານ'
      case 'Maintenance':
        return 'ກຳລັງບຳລຸງ'
      default:
        return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'badge-light-success'
      case 'Inactive':
        return 'badge-light-secondary'
      case 'Maintenance':
        return 'badge-light-warning'
      default:
        return 'badge-light-light'
    }
  }

  return (
    <div className="text-center">
      <span className={`badge ${getStatusClass(status)} fw-bold px-3 py-2`}>
        {getStatusLabel(status)}
      </span>
    </div>
  )
}

export { ShipStatusCell }
