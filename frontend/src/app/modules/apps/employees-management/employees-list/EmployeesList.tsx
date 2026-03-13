import { FC } from 'react'
import { EmployeesListHeader } from './components/header/EmployeesListHeader'
import { EmployeesTable } from './table/EmployeesTable'
import { EmployeesListLoading } from './components/loading/EmployeesListLoading'
import { EmployeesListPagination } from './components/pagination/EmployeesListPagination'
import { useQueryResponseLoading } from './core/QueryResponseProvider'

const EmployeesList: FC = () => {
  const isLoading = useQueryResponseLoading()

  return (
    <div className="card">
      <EmployeesListHeader />
      <EmployeesTable />
      {isLoading && <EmployeesListLoading />}
      <EmployeesListPagination />
    </div>
  )
}

export { EmployeesList }