import { FC } from 'react'

type Props = {
  email: string
}

const UserEmailCell: FC<Props> = ({ email }) => {
  return (
    <div className="text-gray-800">
      {email}
    </div>
  )
}

export { UserEmailCell }