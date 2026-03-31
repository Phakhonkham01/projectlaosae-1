import clsx from 'clsx'

type Props = {
  status?: string | number
}

const UserStatusCell: React.FC<Props> = ({status}) => {
  const getDisplayStatus = () => {
    if (status === 'work day') return 'ໃຊ້ງານ'
    if (status === 'leave day') return 'ບໍ່ໃຊ້ງານ'
    if (status === 'on leave' || status === 'On Leave') return 'ພັກວຽກ'
    if (status === 1) return 'ໃຊ້ງານ'
    if (status === 0) return 'ບໍ່ໃຊ້ງານ'
    return status?.toString() || 'ບໍ່ໃຊ້ງານ'
  }

  const getStatusClass = () => {
    const displayStatus = getDisplayStatus()

    switch (displayStatus) {
      case 'ໃຊ້ງານ':
        return 'badge-light-success'
      case 'ບໍ່ໃຊ້ງານ':
        return 'badge-light-danger'
      case 'ພັກວຽກ':
        return 'badge-light-warning'
      default:
        return 'badge-light-secondary'
    }
  }

  const displayStatus = getDisplayStatus()

  return <span className={clsx('badge fw-bolder', getStatusClass())}>{displayStatus}</span>
}

export {UserStatusCell}
