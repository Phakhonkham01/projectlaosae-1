import { useMemo, useState } from 'react'
import { useTable, ColumnInstance, Row } from 'react-table'
import { useQueryResponseData, useQueryResponseLoading } from '../core/QueryResponseProvider'
import { User } from '../core/_models'
import { UsersList } from './columns/_columns'
import { KTCardBody } from '../../../../../../_metronic/helpers'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { EmployeesListLoading } from '../components/loading/EmployeesListLoading'
import { EmployeesListPagination } from '../components/pagination/EmployeesListPagination'

type RoleTab = 'all' | 'ownner' | 'employee' | 'customer'

const tabs: { label: string; value: RoleTab }[] = [
  { label: 'All',      value: 'all'      },
  { label: 'Owner',    value: 'ownner'   },
  { label: 'Employee', value: 'employee' },
  { label: 'Customer', value: 'customer' },
]

const EmployeesTable = () => {
  const users = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const [activeTab, setActiveTab] = useState<RoleTab>('all')

  const data = useMemo(() =>
    activeTab === 'all' ? users : users.filter(u => u.role === activeTab),
    [users, activeTab]
  )

  const counts = useMemo(() =>
    tabs.reduce((acc, tab) => {
      acc[tab.value] = tab.value === 'all'
        ? users.length
        : users.filter(u => u.role === tab.value).length
      return acc
    }, {} as Record<RoleTab, number>),
    [users]
  )

  const columns = useMemo(() => UsersList, [])

  const { getTableProps, getTableBodyProps, headers, rows, prepareRow } = useTable({
    columns,
    data,
  })

  return (
    <KTCardBody className='py-4'>
      {/* Tabs */}
      <div className='d-flex justify-content-end mb-4'>
        <ul className='nav nav-tabs nav-line-tabs nav-stretch fs-6 border-0'>
          {tabs.map(tab => {
            const isActive = activeTab === tab.value
            return (
              <li key={tab.value} className='nav-item'>
                <a
                  className={`nav-link fw-bold ${isActive ? 'active' : 'text-muted'}`}
                  onClick={() => setActiveTab(tab.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {tab.label}
                  <span className={`ms-2 badge ${isActive ? 'badge-primary' : 'badge-light'}`}>
                    {counts[tab.value] ?? 0}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Table */}
      <div className='table-responsive'>
        <table
          id='kt_table_users'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<User>) => (
                <CustomHeaderColumn key={column.id} column={column} />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<User>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.id}`} />
              })
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    No matching records found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <EmployeesListPagination />
      {isLoading && <EmployeesListLoading />}
    </KTCardBody>
  )
}

export { EmployeesTable }