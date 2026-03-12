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

const ShipActionsCell: FC<Props> = ({ id }) => {
  const { setItemIdForUpdate } = useListView()
  const { query } = useQueryResponse()
  const queryClient = useQueryClient()

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = () => {
    setItemIdForUpdate(id)
  }

  const deleteItem = useMutation(() => deleteShip(id), { // Use single delete
    onSuccess: () => {
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Ship has been deleted.',
        timer: 2000,
        showConfirmButton: false,
      })
      // Invalidate and refetch
      queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-ships-${query}`])
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to delete ship',
      })
    },
  })

  const handleDelete = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You will not be able to recover this ship!',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteItem.mutateAsync()
      }
    })
  }

  return (
    <>
      <a
        href='#'
        className='btn btn-light btn-active-light-primary btn-sm'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        Actions
        <KTIcon iconName='down' className='fs-5 m-0' />
      </a>
      {/* begin::Menu */}
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4'
        data-kt-menu='true'
      >
        {/* begin::Menu item - Edit */}
        <div className='menu-item px-3'>
          <a 
            className='menu-link px-3' 
            onClick={openEditModal}
            style={{ cursor: 'pointer' }}
          >
            Edit
          </a>
        </div>
        {/* end::Menu item */}

        {/* begin::Menu item - Delete */}
        <div className='menu-item px-3'>
          <a
            className='menu-link px-3 text-danger'
            onClick={handleDelete}
            style={{ cursor: 'pointer' }}
          >
            Delete
          </a>
        </div>
        {/* end::Menu item */}
      </div>
      {/* end::Menu */}
    </>
  )
}

export { ShipActionsCell }