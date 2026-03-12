/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import {FC, useContext, useState, useEffect, useMemo, createContext} from 'react'
import {useQuery} from 'react-query'
import {
  initialQueryResponse,
  initialQueryState,
  PaginationState,
  QUERIES,
  stringifyRequestQuery,
  WithChildren,
} from '../../../../../../_metronic/helpers'
import { getShips } from './ship_requests'
import { ShipData } from './ship_models'
import { useQueryRequest } from './QueryRequestProvider'

// Define response context type
type QueryResponseContextProps = {
  isLoading: boolean
  refetch: () => void
  response: typeof initialQueryResponse
  query: string
}

// Create response context for ships
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

  const {
    isFetching,
    refetch,
    data: response,
  } = useQuery(
    `${QUERIES.USERS_LIST}-ships-${query}`,
    async () => {
      try {
        // Get all ships from Firebase
        const ships = await getShips()
        
        // Apply search/filter if needed
        let filteredShips = [...ships]
        
        // Filter by search term
        if (state.search) {
          const searchTerm = state.search.toLowerCase()
          filteredShips = filteredShips.filter(ship => 
            ship.name.toLowerCase().includes(searchTerm) ||
            ship.ship_name.toLowerCase().includes(searchTerm) ||
            ship.status.toLowerCase().includes(searchTerm)
          )
        }

        // Filter by status if provided
        if (state.filter?.status) {
          filteredShips = filteredShips.filter(ship => 
            ship.status === state.filter?.status
          )
        }

        // Sort by field
        if (state.sort) {
          const [sortField, sortDirection] = state.sort.split(':')
          filteredShips.sort((a: any, b: any) => {
            let aValue = a[sortField]
            let bValue = b[sortField]
            
            // Handle numeric values
            if (typeof aValue === 'number' && typeof bValue === 'number') {
              return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
            }
            
            // Handle string values
            aValue = String(aValue).toLowerCase()
            bValue = String(bValue).toLowerCase()
            
            if (sortDirection === 'asc') {
              return aValue.localeCompare(bValue)
            } else {
              return bValue.localeCompare(aValue)
            }
          })
        }

        // Calculate pagination
        const page = state.page || 1
        const itemsPerPage = state.items_per_page || 10
        const total = filteredShips.length
        const lastPage = Math.ceil(total / itemsPerPage)
        const start = (page - 1) * itemsPerPage
        const end = start + itemsPerPage
        const paginatedShips = filteredShips.slice(start, end)

        // Create pagination links
        const links = []
        for (let i = 1; i <= lastPage; i++) {
          links.push({
            url: i === page ? null : `?page=${i}`,
            label: i.toString(),
            active: i === page
          })
        }

        return {
          data: paginatedShips,
          payload: {
            pagination: {
              current_page: page,
              from: start + 1,
              last_page: lastPage,
              per_page: itemsPerPage,
              to: end,
              total: total,
              links: [
                {
                  url: page > 1 ? `?page=${page - 1}` : null,
                  label: '&laquo; Previous',
                  active: false
                },
                ...links,
                {
                  url: page < lastPage ? `?page=${page + 1}` : null,
                  label: 'Next &raquo;',
                  active: false
                }
              ]
            }
          }
        }
      } catch (error) {
        console.error('Error fetching ships:', error)
        return {
          data: [],
          payload: {
            pagination: {
              current_page: 1,
              from: 0,
              last_page: 1,
              per_page: 10,
              to: 0,
              total: 0,
              links: []
            }
          }
        }
      }
    },
    {
      cacheTime: 0,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  )

  const value = {
    isLoading: isFetching,
    refetch,
    response: response || initialQueryResponse,
    query
  }

  return (
    <QueryResponseContext.Provider value={value}>
      {children}
    </QueryResponseContext.Provider>
  )
}

const useQueryResponse = () => {
  const context = useContext(QueryResponseContext)
  if (context === undefined) {
    throw new Error('useQueryResponse must be used within QueryResponseProvider')
  }
  return context
}

const useQueryResponseData = (): ShipData[] => {
  const {response} = useQueryResponse()
  if (!response) {
    return []
  }

  return response?.data || []
}

const useQueryResponsePagination = () => {
  const defaultPaginationState: PaginationState = {
    links: [],
    ...initialQueryState,
  }

  const {response} = useQueryResponse()
  if (!response || !response.payload || !response.payload.pagination) {
    return defaultPaginationState
  }

  return response.payload.pagination
}

const useQueryResponseLoading = (): boolean => {
  const {isLoading} = useQueryResponse()
  return isLoading
}

export {
  QueryResponseProvider,
  useQueryResponse,
  useQueryResponseData,
  useQueryResponsePagination,
  useQueryResponseLoading,
}