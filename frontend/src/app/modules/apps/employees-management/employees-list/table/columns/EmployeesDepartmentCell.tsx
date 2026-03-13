import { FC } from 'react'

type Props = {
  department_id: string
}

const UserDepartmentCell: FC<Props> = ({ department_id }) => {
  return (
    <div className="badge badge-light-info">
      {department_id || 'N/A'}
    </div>
  )
}

export { UserDepartmentCell }