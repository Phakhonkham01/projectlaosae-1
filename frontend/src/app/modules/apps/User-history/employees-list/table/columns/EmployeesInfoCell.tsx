import { FC } from 'react'
import { User } from '../../core/_models'

type Props = {
  user: User
}

const EmployeesInfoCell: FC<Props> = ({ user }) => {
  return (
    <div className="d-flex align-items-center">
      <div className="d-flex flex-column">
        <span className="text-gray-800 fw-bold text-hover-primary mb-1">
          {user.name} {user.lastname}
        </span>
        <span className="text-gray-600 fw-semibold d-block fs-7">
          @{user.name}
        </span>
      </div>
    </div>
  )
}

export { EmployeesInfoCell }