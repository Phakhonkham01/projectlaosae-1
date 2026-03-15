import { FC } from 'react'
import { EmployeesTable } from './table/EmployeesTable'
import { EmployeesListLoading } from './components/loading/EmployeesListLoading'
import { EmployeesListPagination } from './components/pagination/EmployeesListPagination'
import { QueryResponseProvider, useQueryResponseLoading } from './core/QueryResponseProvider'
import { QueryRequestProvider } from './core/QueryRequestProvider'
import { ListViewProvider, useListView } from './core/ListViewProvider'
import { EmployeesListHeader } from './components/header/EmployeesListHeader'
import {KTCard} from '../../../../../_metronic/helpers'
import { UserEditModal } from './employee-edit-modal/UserEditModal'
import { EmployeesCardHeader } from './components/header/EmployeesCardHeader'

const UsersList = () => {
  const {itemIdForUpdate} = useListView()
  return (
    <>
      <KTCard>
        <EmployeesCardHeader />
        <EmployeesTable />
      </KTCard>
      {itemIdForUpdate !== undefined && <UserEditModal />}
    </>
  )
}

const UsersListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <UsersList />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {UsersListWrapper}