// [Module]ListToolbar.tsx

// กรุณาเพิ่มโค้ดตามต้องการimport {KTIcon} from '../../../../../../../_metronic/helpers'
import { KTIcon } from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {EmployeesListFilter} from './EmployeesListFilter'

const EmployeesListToolbar = () => {
  const {setItemIdForUpdate} = useListView()
  const openAddUserModal = () => {
    setItemIdForUpdate(null)
  }

  return (
    <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
      <EmployeesListFilter />

      {/* begin::Export */}
      {/* <button type='button' className='btn btn-light-primary me-3'>
        <KTIcon iconName='exit-up' className='fs-2' />
        Export
      </button> */}
      {/* end::Export */}

      {/* begin::Add user */}
      <button type='button' className='btn btn-primary' onClick={openAddUserModal}>
        <KTIcon iconName='plus' className='fs-2' />
        ເພີ່ມຜູ້ໃຊ້
      </button>
      {/* end::Add user */}
    </div>
  )
}

export {EmployeesListToolbar}
