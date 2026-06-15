import {KTIcon} from '../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {isViewOnlyUser} from '../core/permissions'

const UserEditModalHeader = () => {
  const {itemIdForUpdate, setItemIdForUpdate} = useListView()
  const viewOnly = isViewOnlyUser()

  return (
    <div className='modal-header'>
      {/* begin::Modal title */}
      <h2 className='fw-bolder'>
        {viewOnly ? 'ລາຍລະອຽດຜູ້ໃຊ້' : itemIdForUpdate == null ? 'ເພີ່ມຜູ້ໃຊ້' : 'ແກ້ໄຂຜູ້ໃຊ້'}
      </h2>
      {/* end::Modal title */}

      {/* begin::Close */}
      <div
        className='btn btn-icon btn-sm btn-active-icon-primary'
        data-kt-users-modal-action='close'
        onClick={() => setItemIdForUpdate(undefined)}
        style={{cursor: 'pointer'}}
      >
        <KTIcon iconName='cross' className='fs-1' />
      </div>
      {/* end::Close */}
    </div>
  )
}

export {UserEditModalHeader}
