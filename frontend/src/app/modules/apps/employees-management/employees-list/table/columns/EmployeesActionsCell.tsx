import {FC} from 'react'
import {useMutation, useQueryClient} from 'react-query'
import {useListView} from '../../core/ListViewProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'
import {deleteUser} from '../../core/_requests'
import {canManageRole} from '../../core/permissions'
import {User} from '../../core/_models'
import {KTIcon, QUERIES} from '../../../../../../../_metronic/helpers'
import Swal from 'sweetalert2'

type Props = {
  id: string
  role?: User['role']
}

const getCurrentUser = (): {_id?: string; role?: string} | null => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const EmployeesActionsCell: FC<Props> = ({id, role}) => {
  const {setItemIdForUpdate} = useListView()
  const {query} = useQueryResponse()
  const queryClient = useQueryClient()
  const currentUser = getCurrentUser()
  // Whether the current user may manage (edit) this specific row's role.
  const canManage = canManageRole(role)
  const isEmployee = currentUser?.role === 'employee'
  const isOwnAccount = currentUser?._id === id
  const shouldBlockSelfDelete =
    isEmployee || (currentUser?.role === 'owner' && isOwnAccount)

  const deleteMutation = useMutation(() => deleteUser(id), {
    onSuccess: () => {
      Swal.fire({icon: 'success', title: 'ລຶບສຳເລັດ', timer: 2000, showConfirmButton: false})
      queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-employeess-${query}`])
    },
  })

  const handleDelete = () => {
    if (shouldBlockSelfDelete) {
      Swal.fire({
        icon: 'warning',
        title: 'ບໍ່ສາມາດລຶບບັນຊີຂອງຕົນເອງໄດ້',
        text: 'ບັນຊີທີ່ກຳລັງໃຊ້ງານບໍ່ສາມາດຖືກລຶບໄດ້',
      })
      return
    }

    Swal.fire({
      icon: 'warning',
      title: 'ທ່ານແນ່ໃຈບໍ?',
      showCancelButton: true,
      confirmButtonText: 'ຢືນຢັນລຶບ',
      cancelButtonText: 'ຍົກເລີກ',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate()
      }
    })
  }

  // Rows the current user cannot manage (e.g. an employee viewing an owner)
  // are view-only: show an eye icon and hide the edit/delete actions.
  if (!canManage) {
    return (
      <div className='d-flex justify-content-end gap-2'>
        <button
          className='btn btn-icon btn-light-primary btn-sm'
          onClick={() => setItemIdForUpdate(id)}
          title='ເບິ່ງລາຍລະອຽດ'
        >
          <KTIcon iconName='eye' className='fs-3' />
        </button>
      </div>
    )
  }

  return (
    <div className='d-flex justify-content-end gap-2'>
      <button className='btn btn-icon btn-light-primary btn-sm' onClick={() => setItemIdForUpdate(id)}>
        <KTIcon iconName='pencil' className='fs-3' />
      </button>
      {/* Employees may not delete users; owners may delete anyone but themselves */}
      {!isEmployee && (
        <button
          className='btn btn-icon btn-light-danger btn-sm'
          onClick={handleDelete}
          disabled={shouldBlockSelfDelete}
          title={shouldBlockSelfDelete ? 'ບໍ່ສາມາດລຶບບັນຊີຂອງຕົນເອງ' : undefined}
        >
          <KTIcon iconName='trash' className='fs-3' />
        </button>
      )}
    </div>
  )
}

export {EmployeesActionsCell}
