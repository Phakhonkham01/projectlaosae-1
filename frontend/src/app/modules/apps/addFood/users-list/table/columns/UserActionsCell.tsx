import { FC, useEffect } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { MenuComponent } from '../../../../../../../_metronic/assets/ts/components'
import { ID, KTIcon, QUERIES } from '../../../../../../../_metronic/helpers'
import { useListView } from '../../core/ListViewProvider'
import { useQueryResponse } from '../../core/QueryResponseProvider'
import { deleteUser } from '../../core/_requests'
import Swal from 'sweetalert2'

type Props = {
  id: ID
}

const UserActionsCell: FC<Props> = ({ id }) => {
  const { setItemIdForUpdate } = useListView()
  const { query } = useQueryResponse()
  const queryClient = useQueryClient()

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = () => {
    setItemIdForUpdate(id)
  }

  const deleteItem = useMutation(() => deleteUser(id), {
    onSuccess: () => {
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'ລຶບສິນຄ້າສຳເລັດ!',
        text: 'ລຶບສິນຄ້າສຳເລັດແລ້ວ.',
        showConfirmButton: false,
        timer: 1500
      })

      // ✅ update detail view directly
      queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-${query}`])
    },
    onError: (error) => {
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'ຜິດພາດ!',
        text: 'ລຶບສິນຄ້າບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່.',
        confirmButtonText: 'ຕົກລົງ',
        confirmButtonColor: '#F1416C'
      })
    }
  })

  const handleDelete = () => {
    Swal.fire({
      title: 'ທ່ານແນ່ໃຈບໍ?',
      text: "ໝວດຮາຍການນີ້ຈະຖືກລຶບແລ້ວຈະບໍ່ສາມາດກູ້ຄືນໄດ້!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F1416C',
      cancelButtonColor: '#A1A5B7',
      confirmButtonText: 'ແມ່ນແລ້ວ, ລຶບ!',
      cancelButtonText: 'ຍົກເລີກ',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteItem.mutateAsync()
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
        ຈັດການ
        <KTIcon iconName='down' className='fs-5 m-0' />
      </a>
      {/* begin::Menu */}
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4'
        data-kt-menu='true'
      >
        {/* begin::Menu item */}
        <div className='menu-item px-3'>
          <a className='menu-link px-3' onClick={openEditModal}>
            ການແກ້ໄຂ
          </a>
        </div>
        {/* end::Menu item */}

        {/* begin::Menu item */}
        <div className='menu-item px-3'>
          <a
            className='menu-link px-3 text-danger'
            data-kt-users-table-filter='delete_row'
            onClick={handleDelete}
          >
            ລຶບ
          </a>
        </div>
        {/* end::Menu item */}
      </div>
      {/* end::Menu */}
    </>
  )
}

export { UserActionsCell }