/* eslint-disable react-refresh/only-export-components */
import {FC, useContext, useMemo, useState, createContext} from 'react'
import {
  initialQueryState,
} from '../../../../../../_metronic/helpers'
import { WithChildren } from '../../../../../../_metronic/helpers'

// Define the context type
type QueryRequestContextProps = {
  state: typeof initialQueryState
  updateState: (updates: Partial<typeof initialQueryState>) => void
}

// Create context directly
const QueryRequestContext = createContext<QueryRequestContextProps | undefined>(undefined)

const QueryRequestProvider: FC<WithChildren> = ({children}) => {
  const [state, setState] = useState(initialQueryState)

  const updateState = (updates: Partial<typeof initialQueryState>) => {
    const updatedState = {...state, ...updates} as typeof initialQueryState
    setState(updatedState)
  }

  const value = useMemo(() => ({
    state,
    updateState
  }), [state])

  return (
    <QueryRequestContext.Provider value={value}>
      {children}
    </QueryRequestContext.Provider>
  )
}

const useQueryRequest = () => {
  const context = useContext(QueryRequestContext)
  if (context === undefined) {
    throw new Error('useQueryRequest must be used within QueryRequestProvider')
  }
  return context
}

export {
  QueryRequestProvider,
  useQueryRequest,
}