import {useMutation, useQueryClient} from 'react-query'
import {QUERIES} from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'
import {deleteSelectedUsers} from '../../core/_requests'
import Swal from 'sweetalert2'

const getCurrentUser = (): {_id?: string; role?: string} | null => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const EmployeesListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const queryClient = useQueryClient()
  const {query} = useQueryResponse()
  const currentUser = getCurrentUser()
  const hasOwnAccountSelected =
    currentUser?.role === 'employee' && !!currentUser._id && selected.includes(currentUser._id)

  const deleteSelectedItems = useMutation(() => deleteSelectedUsers(selected), {
    onSuccess: () => {
      queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-${query}`])
      clearSelected()
    },
  })

  return (
    <div className='d-flex justify-content-end align-items-center'>
      <div className='fw-bolder me-5'>
        <span className='me-2'>{selected.length}</span> ລາຍການທີ່ເລືອກ
      </div>

      <button
        type='button'
        className='btn btn-danger'
        onClick={async () => {
          if (hasOwnAccountSelected) {
            await Swal.fire({
              icon: 'warning',
              title: 'ບໍ່ສາມາດລຶບບັນຊີຂອງຕົນເອງໄດ້',
              text: 'ກະລຸນາເອົາບັນຊີທີ່ກຳລັງໃຊ້ງານອອກຈາກລາຍການກ່ອນ',
            })
            return
          }
          await deleteSelectedItems.mutateAsync()
        }}
      >
        ລຶບທີ່ເລືອກ
      </button>
    </div>
  )
}

export {EmployeesListGrouping}
