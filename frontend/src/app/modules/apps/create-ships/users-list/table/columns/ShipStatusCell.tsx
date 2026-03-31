import { FC } from 'react'

type Props = {
  status: 'Active' | 'Inactive' | 'Maintenance'
}

const ShipStatusCell: FC<Props> = ({ status }) => {
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
