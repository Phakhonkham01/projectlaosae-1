import { useQuery } from 'react-query'
import { UserEditModalForm } from './UserEditModalForm'
import { isNotEmpty, QUERIES } from '../../../../../../_metronic/helpers'
import { useListView } from '../core/ListViewProvider'
import { getUserById } from '../core/_requests'
import { initialUser } from '../core/_models'

const UserEditModalFormWrapper = () => {
  const { itemIdForUpdate, setItemIdForUpdate } = useListView()
  const enabledQuery: boolean = isNotEmpty(itemIdForUpdate)

  const {
    isLoading,
    data: user,
    error,
  } = useQuery(
    `${QUERIES.USERS_LIST}-user-${itemIdForUpdate}`,
    () => getUserById(itemIdForUpdate as string),
    {
      cacheTime: 0,
      enabled: enabledQuery,
      onError: (err) => {
        setItemIdForUpdate(undefined)
        console.error(err)
      },
    }
  )

  // ✅ Create mode — ไม่มี itemIdForUpdate
  if (!itemIdForUpdate) {
    return <UserEditModalForm isUserLoading={false} user={initialUser} />
  }

  // ✅ Edit mode — โหลด user สำเร็จ
  if (!isLoading && !error && user) {
    return <UserEditModalForm isUserLoading={isLoading} user={user} />
  }

  // ⏳ Loading
  if (isLoading) {
    return (
      <div className='d-flex justify-content-center align-items-center py-10'>
        <div className='spinner-border text-primary' />
      </div>
    )
  }

  return null
}

export { UserEditModalFormWrapper }