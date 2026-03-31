import {FC, useMemo} from 'react'
import {ID} from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'

type Props = {
  id: ID
}

const getCurrentUser = (): {_id?: string; role?: string} | null => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const EmployeesSelectionCell: FC<Props> = ({id}) => {
  const {selected, onSelect} = useListView()
  const isSelected = useMemo(() => selected.includes(id), [id, selected])
  const currentUser = getCurrentUser()
  const disableSelfSelect = currentUser?.role === 'employee' && currentUser?._id === id
  return (
    <div className='form-check form-check-custom form-check-solid'>
      <input
        className='form-check-input'
        type='checkbox'
        data-kt-check={isSelected}
        data-kt-check-target='#kt_table_users .form-check-input'
        checked={isSelected}
        onChange={() => onSelect(id)}
        disabled={disableSelfSelect}
        title={disableSelfSelect ? 'You cannot delete your own account' : undefined}
      />
    </div>
  )
}

export {EmployeesSelectionCell}
