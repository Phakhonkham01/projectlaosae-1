import {useQuery} from 'react-query'
import {BookingShipEditModalForm} from './BookingShipEditModalForm'
import {isNotEmpty, QUERIES} from '../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {getShipById} from '../core/ship_requests'
import { getUserById } from '../../../user-required/users-list/core/_requests'

const BookingShipEditModalFormWrapper = () => {
  const {itemIdForUpdate, setItemIdForUpdate} = useListView()
  const enabledQuery: boolean = isNotEmpty(itemIdForUpdate)
  const {
    isLoading,
    data: user,
    error,
  } = useQuery(
    `${QUERIES.USERS_LIST}-user-${itemIdForUpdate}`,
    () => {
      return getUserById(itemIdForUpdate)
    },
    {
      cacheTime: 0,
      enabled: enabledQuery,
      onError: (err) => {
        setItemIdForUpdate(undefined)
        console.error(err)
      },
    }
  )

  
  if (!itemIdForUpdate) {
    return <BookingShipEditModalForm isUserLoading={isLoading} user ={{id: undefined}} />
  }

  if (!isLoading && !error && user) {
    return <BookingShipEditModalForm isUserLoading={isLoading} user={user} />
  }

  return null
}

export {BookingShipEditModalFormWrapper}
