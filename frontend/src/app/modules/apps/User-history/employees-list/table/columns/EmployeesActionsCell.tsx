import {FC} from 'react'
import {useListView} from '../../core/ListViewProvider'

type Props = {
  id: string
  paymentStatus?: string
}

const EmployeesActionsCell: FC<Props> = ({id, paymentStatus}) => {
  const {setItemIdForUpdate} = useListView()
  const normalizedPaymentStatus = paymentStatus?.toLowerCase().trim().replace(/[\s-]+/g, '_')
  const canRepay = normalizedPaymentStatus === 'payment_failed'

  return (
    <div className='d-flex justify-content-end gap-2'>
      <button
        className={`btn btn-sm ${canRepay ? 'btn-light-danger' : 'btn-light-primary'}`}
        onClick={() => setItemIdForUpdate(id)}
      >
        {canRepay ? 'Pay Again' : 'Details'}
      </button>
    </div>
  )
}

export {EmployeesActionsCell}