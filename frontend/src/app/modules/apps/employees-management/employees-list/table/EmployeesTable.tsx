import { FC } from 'react'
import { useQueryResponseData, useQueryResponseLoading } from '../core/QueryResponseProvider'
import { UsersList } from './columns/_columns'
import { Table } from '../../../../../../../_metronic/partials/table/Table'

const EmployeesTable: FC = () => {
  const data = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const columns = UsersList

  return (
    <Table
      columns={columns}
      data={data}
      isLoading={isLoading}
    />
  )
}

export { EmployeesTable }