import {useQueryClient, useMutation} from 'react-query'
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
    // 💡 response of the mutation is passed to onSuccess
    onSuccess: () => {
      // ✅ update detail view directly
      queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-${query}`])
      clearSelected()
    },
  })

  return (
    <div className='d-flex justify-content-end align-items-center'>
      <div className='fw-bolder me-5'>
        <span className='me-2'>{selected.length}</span> Selected
      </div>

      <button
        type='button'
        className='btn btn-danger'
        onClick={async () => {
          if (hasOwnAccountSelected) {
            await Swal.fire({
              icon: 'warning',
              title: 'ບໍ່ສາມາດລຶບບັນຊີຂອງຕົນເອງໄດ້',
              text: 'ກະລຸນາເອົາບັນຊີທີ່ກຳລັງ login ອອກຈາກລາຍການກ່ອນລຶບ',
            })
            return
          }
          await deleteSelectedItems.mutateAsync()
        }}
      >
        Delete Selected
      </button>
    </div>
  )
}

export {EmployeesListGrouping}
