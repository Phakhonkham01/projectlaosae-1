import { FC } from 'react'

type Props = {
  status: string
}

const UserStatusCell: FC<Props> = ({ status }) => {
  const statusLabel =
    status === 'Active' ? 'ໃຊ້ງານ' : status === 'Inactive' ? 'ປິດໃຊ້ງານ' : status

  const getBadgeClass = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'badge-light-success'
      case 'inactive': return 'badge-light-secondary'
      default: return 'badge-light-light'
    }
  }

  return (
    <div className={`badge ${getBadgeClass(status)} fw-bold px-3 py-2`}>
      {statusLabel}
    </div>
  )
}

export { UserStatusCell }
