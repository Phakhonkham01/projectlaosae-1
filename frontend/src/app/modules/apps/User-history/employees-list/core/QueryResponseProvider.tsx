import { FC, useContext, useState, useEffect, useMemo, createContext } from 'react'
import { useQuery, QueryObserverResult, RefetchOptions, RefetchQueryFilters } from 'react-query'
import {
  initialQueryState,
  QUERIES,
  stringifyRequestQuery,
  WithChildren,
} from '../../../../../../_metronic/helpers'
import { getHistoryBookings } from './_requests'
import { HistoryBooking } from './_models'
import { useQueryRequest } from './QueryRequestProvider'

type QueryResponseData = {
  data: HistoryBooking[]
  payload: {
    pagination: {
      current_page: number
      last_page: number
      per_page: number
      total: number
      from: number
      to: number
      links: any[]
    }
  }
}

type QueryResponseContextProps = {
  isLoading: boolean
  refetch: (
    options?: RefetchOptions & RefetchQueryFilters
  ) => Promise<QueryObserverResult<QueryResponseData, unknown>>
  response: QueryResponseData | undefined
  query: string
}

const QueryResponseContext = createContext<QueryResponseContextProps | undefined>(undefined)

const QueryResponseProvider: FC<WithChildren> = ({ children }) => {
  const { state } = useQueryRequest()
  const [query, setQuery] = useState(stringifyRequestQuery(state))
  const updatedQuery = useMemo(() => stringifyRequestQuery(state), [state])

  useEffect(() => {
    if (query !== updatedQuery) {
      setQuery(updatedQuery)
    }
  }, [updatedQuery])

  const { isFetching, refetch, data: response } = useQuery<QueryResponseData>(
    `${QUERIES.USERS_LIST}-history-${query}`,
    async () => {
      let items = await getHistoryBookings()

      // Filter
      if (state.filter) {
        const filter = state.filter as Record<string, string>
        if (filter.status) {
          items = items.filter(item => item.status === filter.status)
        }
        if (filter.payment_status) {
          items = items.filter(item => item.payment_status === filter.payment_status)
        }
        if (filter.payment_method) {
          items = items.filter(item => item.payment_method === filter.payment_method)
        }
      }

      // Search
      if (state.search) {
        const searchTerm = state.search.toLowerCase()
        items = items.filter(item =>
          [item.user_name, item.user_email, item.ship_name, item.id].some(val =>
            String(val ?? '').toLowerCase().includes(searchTerm)
          )
        )
      }

      const page = state.page || 1
      const itemsPerPage = state.items_per_page || 10
      const total = items.length
      const start = (page - 1) * itemsPerPage
      const paginatedItems = items.slice(start, start + itemsPerPage)

      return {
        data: paginatedItems,
        payload: {
          pagination: {
            current_page: page,
            last_page: Math.ceil(total / itemsPerPage),
            per_page: itemsPerPage,
            total,
            from: start + 1,
            to: start + paginatedItems.length,
            links: [],
          },
        },
      }
    },
    { cacheTime: 0, keepPreviousData: true, refetchOnWindowFocus: false }
  )

  const value: QueryResponseContextProps = {
    isLoading: isFetching,
    refetch,
    response,
    query,
  }

  return (
    <QueryResponseContext.Provider value={value}>
      {children}
    </QueryResponseContext.Provider>
  )
}

const useQueryResponse = () => {
  const context = useContext(QueryResponseContext)
  if (!context) throw new Error('useQueryResponse must be used within QueryResponseProvider')
  return context
}

const useQueryResponseData = (): HistoryBooking[] => {
  const { response } = useQueryResponse()
  return response?.data ?? []
}

const useQueryResponseLoading = (): boolean => {
  const { isLoading } = useQueryResponse()
  return isLoading
}

const useQueryResponsePagination = () => {
  const { response } = useQueryResponse()
  return response?.payload?.pagination ?? initialQueryState
}

export {
  QueryResponseProvider,
  useQueryResponse,
  useQueryResponseData,
  useQueryResponseLoading,
  useQueryResponsePagination,
}