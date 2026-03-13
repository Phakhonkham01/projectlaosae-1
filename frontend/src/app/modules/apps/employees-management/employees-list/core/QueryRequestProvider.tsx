import { FC, useContext, useMemo, useState, createContext } from 'react'
import { initialQueryState } from '../../../../../../_metronic/helpers'
import { WithChildren } from '../../../../../../_metronic/helpers'

type QueryRequestContextProps = {
  state: typeof initialQueryState
  updateState: (updates: Partial<typeof initialQueryState>) => void
}

const QueryRequestContext = createContext<QueryRequestContextProps | undefined>(undefined)

const QueryRequestProvider: FC<WithChildren> = ({ children }) => {
  const [state, setState] = useState(initialQueryState)

  const updateState = (updates: Partial<typeof initialQueryState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const value = useMemo(() => ({ state, updateState }), [state])

  return (
    <QueryRequestContext.Provider value={value}>
      {children}
    </QueryRequestContext.Provider>
  )
}

const useQueryRequest = () => {
  const context = useContext(QueryRequestContext)
  if (!context) {
    throw new Error('useQueryRequest must be used within QueryRequestProvider')
  }
  return context
}

export { QueryRequestProvider, useQueryRequest }