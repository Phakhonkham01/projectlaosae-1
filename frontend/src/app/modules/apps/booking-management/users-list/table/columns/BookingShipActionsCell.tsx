import { FC, useEffect } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { MenuComponent } from '../../../../../../../_metronic/assets/ts/components'
import { ID, KTIcon, QUERIES } from '../../../../../../../_metronic/helpers'
import { useListView } from '../../core/ListViewProvider'
import { useQueryResponse } from '../../core/QueryResponseProvider'
import { deleteShip } from '../../core/ship_requests' // Changed to single delete
import Swal from 'sweetalert2'

type Props = {
  id: ID
}

const BookingShipActionsCell: FC<Props> = ({ id }) => {
  const { setItemIdForUpdate } = useListView()
  const { query } = useQueryResponse()
  const queryClient = useQueryClient()

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = () => {
    setItemIdForUpdate(id)
  }

  return (
    <>
      <a
        href='#'
        className='btn btn-light btn-active-light-primary btn-sm'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
        onClick={openEditModal}
      >
        ຈອງດຽວນີ້
        {/* <KTIcon iconName='down' className='fs-5 m-0' /> */}
      
      
      </a>
      {/* begin::Menu */}
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4'
        data-kt-menu='true'
      >
        {/* begin::Menu item - Edit */}
     
        {/* end::Menu item */}

        {/* begin::Menu item - Delete */}

        {/* end::Menu item */}
      </div>
      {/* end::Menu */}
    </>
  )
}

export { BookingShipActionsCell }
