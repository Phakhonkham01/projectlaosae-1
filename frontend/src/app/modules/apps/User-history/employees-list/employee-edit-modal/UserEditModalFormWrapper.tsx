import { useQuery } from 'react-query'
import { HistoryDetailModalForm } from './UserEditModalForm'
import { isNotEmpty, QUERIES } from '../../../../../../_metronic/helpers'
import { useListView } from '../core/ListViewProvider'
import { getHistoryBookingById } from '../core/_requests'

const HistoryDetailModalFormWrapper = () => {
  const { itemIdForUpdate, setItemIdForUpdate } = useListView()
  const enabledQuery: boolean = isNotEmpty(itemIdForUpdate)

  const {
    isLoading,
    data: booking,
    error,
  } = useQuery(
    `${QUERIES.USERS_LIST}-history-${itemIdForUpdate}`,
    () => getHistoryBookingById(itemIdForUpdate!),
    {
      cacheTime: 0,
      enabled: enabledQuery,
      onError: (err) => {
        setItemIdForUpdate(undefined)
        console.error(err)
      },
    }
  )

  // Create mode ไม่มีใน history → ปิด modal ทันที
  if (!itemIdForUpdate) {
    return null
  }

  if (!isLoading && !error && booking) {
    return <HistoryDetailModalForm isLoading={isLoading} booking={booking} />
  }

  return null
}

export { HistoryDetailModalFormWrapper }