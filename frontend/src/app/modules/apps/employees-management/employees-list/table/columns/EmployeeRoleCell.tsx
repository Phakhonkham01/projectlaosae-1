import { FC } from 'react'

type Props = {
  role: string
}

const UserRoleCell: FC<Props> = ({ role }) => {
  const getBadgeClass = (r: string) => {
    switch (r?.toLowerCase()) {
      case 'ownner': return 'badge-light-danger'
      case 'employee': return 'badge-light-primary'
      default: return 'badge-light-secondary'
    }
  }

  return (
    <div className={`badge ${getBadgeClass(role)} fw-bold px-3 py-2`}>
      {role}
    </div>
  )
}

export { UserRoleCell }