import { FC } from 'react'
import { HistoryTable } from './table/HistoryTable'
import { EmployeesListLoading } from './components/loading/EmployeesListLoading'
import { EmployeesListPagination } from './components/pagination/EmployeesListPagination'
import { QueryResponseProvider, useQueryResponseLoading } from './core/QueryResponseProvider'
import { QueryRequestProvider } from './core/QueryRequestProvider'
import { ListViewProvider, useListView } from './core/ListViewProvider'
import { EmployeesListHeader } from './components/header/EmployeesListHeader'
import {KTCard} from '../../../../../_metronic/helpers'
import { UserEditModal } from './employee-edit-modal/UserEditModal'
import { EmployeesCardHeader } from './components/header/EmployeesCardHeader'

const HistoryList = () => {
  const {itemIdForUpdate} = useListView()
  return (
    <>
      <KTCard>
        <EmployeesCardHeader />
        <HistoryTable />
      </KTCard>
      {itemIdForUpdate !== undefined && <UserEditModal />}
    </>
  )
}

const HistoryListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <HistoryList />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {HistoryListWrapper}