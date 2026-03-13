import { FC } from 'react'
import { ListViewProvider } from './employees-list/core/ListViewProvider'
import { QueryRequestProvider } from './employees-list/core/QueryRequestProvider'
import { QueryResponseProvider } from './employees-list/core/QueryResponseProvider'
import { EmployeesList } from './employees-list/EmployeesList'

const EmployeesPage: FC = () => {
  return (
    <QueryRequestProvider>
      <QueryResponseProvider>
        <ListViewProvider>
          <EmployeesList />
        </ListViewProvider>
      </QueryResponseProvider>
    </QueryRequestProvider>
  )
}

export { EmployeesPage }