import { useMemo, useState } from 'react'
import { useTable, ColumnInstance, Row } from 'react-table'
import { useQueryResponseData, useQueryResponseLoading } from '../core/QueryResponseProvider'
import { HistoryBooking } from '../core/_models'
import { HistoryBookingColumns } from './columns/_columns'
import { KTCardBody } from '../../../../../../_metronic/helpers'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { EmployeesListLoading } from '../components/loading/EmployeesListLoading'
import { EmployeesListPagination } from '../components/pagination/EmployeesListPagination'

type StatusTab = 'all' | 'pending' | 'approved' | 'rejected' | 'payment_failed'

const tabs: { label: string; value: StatusTab; color: string }[] = [
  { label: 'All',            value: 'all',            color: '#64748b' },
  { label: 'Pending',        value: 'pending',        color: '#f59e0b' },
  { label: 'Approved',       value: 'approved',       color: '#10b981' },
  { label: 'Rejected',       value: 'rejected',       color: '#ef4444' },
  { label: 'Payment Failed', value: 'payment_failed', color: '#8b5cf6' },
]

const getCurrentUserId = (): string | null => {
  try {
    const stored = localStorage.getItem('user')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed?._id ?? null
  } catch {
    return null
  }
}

const HistoryTable = () => {
  const allData = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const [activeTab, setActiveTab] = useState<StatusTab>('all')

  const data = useMemo(() => {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) return []
    return allData
      .filter(item => item.user_id === currentUserId)
      .filter(item => activeTab === 'all' || item.status === activeTab)
  }, [allData, activeTab])

  const columns = useMemo(() => HistoryBookingColumns, [])

  const { getTableProps, getTableBodyProps, headers, rows, prepareRow } = useTable({
    columns,
    data,
  })

  // นับจำนวนแต่ละ status
  const counts = useMemo(() => {
    const currentUserId = getCurrentUserId()
    const userItems = allData.filter(item => item.user_id === currentUserId)
    return tabs.reduce((acc, tab) => {
      acc[tab.value] = tab.value === 'all'
        ? userItems.length
        : userItems.filter(item => item.status === tab.value).length
      return acc
    }, {} as Record<StatusTab, number>)
  }, [allData])

  return (
    <KTCardBody className='py-4'>
     
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
              {headers.map((column: ColumnInstance<HistoryBooking>) => (
                <CustomHeaderColumn key={column.id} column={column} />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<HistoryBooking>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.id}`} />
              })
            ) : (
              <tr>
                <td colSpan={8}>
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

export { HistoryTable }