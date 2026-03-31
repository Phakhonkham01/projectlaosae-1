import { FC } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useListView } from '../../core/ListViewProvider'
import { useQueryResponse } from '../../core/QueryResponseProvider'
import { deleteUser } from '../../core/_requests'
import { KTIcon, QUERIES } from '../../../../../../../_metronic/helpers'
import Swal from 'sweetalert2'

type Props = {
  id: string
}

const getCurrentUser = (): { _id?: string; role?: string } | null => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const EmployeesActionsCell: FC<Props> = ({ id }) => {
  const { setItemIdForUpdate } = useListView()
  const { query } = useQueryResponse()
  const queryClient = useQueryClient()
  const currentUser = getCurrentUser()
  const isOwnAccount = currentUser?._id === id
  const shouldBlockSelfDelete = currentUser?.role === 'employee' && isOwnAccount

  const deleteMutation = useMutation(() => deleteUser(id), {
    onSuccess: () => {
      Swal.fire({ icon: 'success', title: 'Deleted!', timer: 2000, showConfirmButton: false })
      queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-employeess-${query}`])
    }
  })

  const handleDelete = () => {
    if (shouldBlockSelfDelete) {
      Swal.fire({
        icon: 'warning',
        title: 'ບໍ່ສາມາດລຶບບັນຊີຂອງຕົນເອງໄດ້',
        text: 'ພະນັກງານທີ່ກຳລັງ login ບໍ່ສາມາດລຶບບັນຊີຂອງຕົນເອງໄດ້',
      })
      return
    }

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
    }).then(result => {
      if (result.isConfirmed) {
        deleteMutation.mutate()
      }
    })
  }

  return (
    <div className="d-flex justify-content-end gap-2">
      <button className="btn btn-icon btn-light-primary btn-sm" onClick={() => setItemIdForUpdate(id)}>
        <KTIcon iconName="pencil" className="fs-3" />
      </button>
      <button
        className="btn btn-icon btn-light-danger btn-sm"
        onClick={handleDelete}
        disabled={shouldBlockSelfDelete}
        title={shouldBlockSelfDelete ? 'You cannot delete your own account' : undefined}
      >
        <KTIcon iconName="trash" className="fs-3" />
      </button>
    </div>
  )
}

export { EmployeesActionsCell }
