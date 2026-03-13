import { FC } from 'react'

type Props = {
  position_id: string
}

const UserPositionCell: FC<Props> = ({ position_id }) => {
  return (
    <div className="badge badge-light-primary">
      {position_id || 'N/A'}
    </div>
  )
}

export { UserPositionCell }