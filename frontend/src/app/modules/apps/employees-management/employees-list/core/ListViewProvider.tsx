import { FC, useContext, useState, createContext } from 'react'
import { WithChildren } from '../../../../../../_metronic/helpers'

type ListViewContextProps = {
  itemIdForUpdate: string | undefined
  setItemIdForUpdate: (id: string | undefined) => void
  selected: Array<string>
  setSelected: (selected: Array<string>) => void
}

const ListViewContext = createContext<ListViewContextProps | undefined>(undefined)

const ListViewProvider: FC<WithChildren> = ({ children }) => {
  const [itemIdForUpdate, setItemIdForUpdate] = useState<string | undefined>()
  const [selected, setSelected] = useState<Array<string>>([])

  return (
    <ListViewContext.Provider value={{ itemIdForUpdate, setItemIdForUpdate, selected, setSelected }}>
      {children}
    </ListViewContext.Provider>
  )
}

const useListView = () => {
  const context = useContext(ListViewContext)
  if (!context) {
    throw new Error('useListView must be used within ListViewProvider')
  }
  return context
}

export { ListViewProvider, useListView }