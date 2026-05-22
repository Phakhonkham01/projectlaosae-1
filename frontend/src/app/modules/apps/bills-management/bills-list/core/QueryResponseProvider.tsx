/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import {FC, createContext, useContext, useEffect, useMemo, useState} from 'react'
import {useQuery} from 'react-query'
import {
  initialQueryState,
  PaginationState,
  QueryResponseContextProps as BaseQueryResponseContextProps,
  QUERIES,
  stringifyRequestQuery,
  WithChildren,
} from '../../../../../../_metronic/helpers'
import {BillData, BillFilter} from './bill_models'
import {getBills} from './bill_requests'
import {useQueryRequest} from './QueryRequestProvider'

type BillsQueryResponse = {
  data: BillData[]
  payload: {
    pagination: PaginationState
  }
}

const initialBillsQueryResponse: BillsQueryResponse = {
  data: [],
  payload: {
    pagination: {
      ...initialQueryState,
      links: [],
    },
  },
}

type QueryResponseContextProps = BaseQueryResponseContextProps<BillData> & {
  response: BillsQueryResponse
}

const normalizePaymentStatus = (value?: string) => value?.toLowerCase().trim().replace(/[\s-]+/g, '_') ?? ''
const getDisplayPaymentStatus = (value?: string) => {
  const normalized = normalizePaymentStatus(value)
  if (normalized === 'slip_submitted') return 'pending'
  if (normalized === 'payment_failed') return 'payment failed'
  return normalized
}

const QueryResponseContext = createContext<QueryResponseContextProps | undefined>(undefined)

const QueryResponseProvider: FC<WithChildren> = ({children}) => {
  const {state} = useQueryRequest()
  const [query, setQuery] = useState<string>(stringifyRequestQuery(state))
  const updatedQuery = useMemo(() => stringifyRequestQuery(state), [state])
  

  useEffect(() => {
    if (query !== updatedQuery) {
      setQuery(updatedQuery)
    }
  }, [updatedQuery])

  const {isFetching, refetch, data: response} = useQuery<BillsQueryResponse>(
    `${QUERIES.USERS_LIST}-bills-${query}`,
    async () => {
      const bills = await getBills()
      const filter = (state.filter as BillFilter | undefined) ?? {}

      let filteredBills = [...bills]

      if (state.search) {
        const searchTerm = state.search.toLowerCase()
        filteredBills = filteredBills.filter((bill) =>
          [
            bill.ship_name,
            bill.user_name,
            bill.user_email,
            bill.booking_date,
            bill.booking_time,
            bill.payment_method,
            bill.payment_status,
            bill.id,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(searchTerm))
        )
      }

      if (filter.paymentMethod) {
        filteredBills = filteredBills.filter(
          (bill) => bill.payment_method === filter.paymentMethod
        )
      }

      if (filter.paymentStatus) {
        const selectedStatus = getDisplayPaymentStatus(filter.paymentStatus)
        filteredBills = filteredBills.filter(
          (bill) => getDisplayPaymentStatus(bill.payment_status) === selectedStatus
        )
      }

      if (filter.bookingDateFrom) {
        filteredBills = filteredBills.filter(
          (bill) => bill.booking_date >= filter.bookingDateFrom!
        )
      }

      if (filter.bookingDateTo) {
        filteredBills = filteredBills.filter(
          (bill) => bill.booking_date <= filter.bookingDateTo!
        )
      }

      if (filter.dateRange) {
        filteredBills = filteredBills.filter((bill) => {
          const d = new Date(bill.booking_date)
          if (Number.isNaN(d.getTime())) return false

          const billDay = d.getDate()
          const billMonth = d.getMonth() + 1
          const billYear = d.getFullYear()

          if (filter.dateRange === 'day') {
            return billDay === filter.dateDay && billMonth === filter.dateMonth && billYear === filter.dateYear
          }

          if (filter.dateRange === 'month') {
            return billMonth === filter.dateMonth && billYear === filter.dateYear
          }

          if (filter.dateRange === 'year') {
            return billYear === filter.dateYear
          }

          return true
        })
      }

      const page = state.page || 1
      const itemsPerPage = state.items_per_page || 10
      const total = filteredBills.length
      const lastPage = Math.max(1, Math.ceil(total / itemsPerPage))
      const safePage = Math.min(page, lastPage)
      const start = (safePage - 1) * itemsPerPage
      const paginatedBills = filteredBills.slice(start, start + itemsPerPage)

      const pageLinks: NonNullable<PaginationState['links']> = []
      for (let index = 1; index <= lastPage; index += 1) {
        pageLinks.push({
          url: index === safePage ? null : `?page=${index}`,
          label: index.toString(),
          active: index === safePage,
          page: index,
        })
      }

      return {
        data: paginatedBills,
        payload: {
          pagination: {
            page: safePage,
            items_per_page: itemsPerPage,
            links: [
              {
                url: safePage > 1 ? `?page=${safePage - 1}` : null,
                label: '&laquo; Previous',
                active: false,
                page: safePage > 1 ? safePage - 1 : null,
              },
              ...pageLinks,
              {
                url: safePage < lastPage ? `?page=${safePage + 1}` : null,
                label: 'Next &raquo;',
                active: false,
                page: safePage < lastPage ? safePage + 1 : null,
              },
            ],
          },
        },
      }
    },
    {
      cacheTime: 0,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  )

  return (
    <QueryResponseContext.Provider
      value={{
        isLoading: isFetching,
        refetch,
        response: response || initialBillsQueryResponse,
        query,
      }}
    >
      {children}
    </QueryResponseContext.Provider>
  )
}

const useQueryResponse = () => {
  const context = useContext(QueryResponseContext)
  if (!context) {
    throw new Error('useQueryResponse must be used within QueryResponseProvider')
  }
  return context
}

const useQueryResponseData = (): BillData[] => {
  const {response} = useQueryResponse()
  return response?.data || []
}

const useQueryResponsePagination = () => {
  const {response} = useQueryResponse()
  return (
    response?.payload?.pagination || {
      ...initialQueryState,
      links: [],
    }
  )
}

const useQueryResponseLoading = (): boolean => {
  const {isLoading} = useQueryResponse()
  return isLoading
}

export {
  QueryResponseProvider,
  useQueryResponse,
  useQueryResponseData,
  useQueryResponseLoading,
  useQueryResponsePagination,
}
