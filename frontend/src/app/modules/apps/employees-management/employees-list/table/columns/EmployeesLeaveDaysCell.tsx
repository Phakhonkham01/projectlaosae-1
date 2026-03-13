import { FC } from 'react'

type Props = {
  leave_days: number
}

const UserLeaveDaysCell: FC<Props> = ({ leave_days }) => {
  return (
    <div className="text-gray-800">
      {leave_days} days
    </div>
  )
}

export { UserLeaveDaysCell }