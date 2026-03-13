import { FC, useContext, useState, useEffect, useMemo, createContext } from 'react'
import { useQuery } from 'react-query'
import {
  initialQueryResponse,
  initialQueryState,
  QUERIES,
  stringifyRequestQuery,
  WithChildren,
} from '../../../../../../_metronic/helpers'
import { getUsers } from './_requests'
import { User } from './_models'
import { useQueryRequest } from './QueryRequestProvider'

type QueryResponseContextProps = {
  isLoading: boolean
  refetch: () => void
  response: typeof initialQueryResponse
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

  const { isFetching, refetch, data: response } = useQuery(
    `${QUERIES.USERS_LIST}-employeess-${query}`,
    async () => {
      try {
        let items = await getUsers()
        
        if (state.search) {
          const searchTerm = state.search.toLowerCase()
          items = items.filter(item => 
            Object.values(item).some(val => 
              String(val).toLowerCase().includes(searchTerm)
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
              total: total,
              from: start + 1,
              to: start + paginatedItems.length,
              links: []
            }
          }
        }
      } catch (error) {
        return { data: [], payload: { pagination: initialQueryState } }
      }
    },
    { cacheTime: 0, keepPreviousData: true, refetchOnWindowFocus: false }
  )

  const value = { isLoading: isFetching, refetch, response: response || initialQueryResponse, query }

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

const useQueryResponseData = (): User[] => {
  const { response } = useQueryResponse()
  return response?.data || []
}

const useQueryResponseLoading = (): boolean => {
  const { isLoading } = useQueryResponse()
  return isLoading
}

const useQueryResponsePagination = () => {
  const { response } = useQueryResponse()
  return response?.payload?.pagination || initialQueryState
}

export {
  QueryResponseProvider,
  useQueryResponse,
  useQueryResponseData,
  useQueryResponseLoading,
  useQueryResponsePagination
}