import { useMemo } from 'react'
import { useTable, ColumnInstance, Row } from 'react-table'
import { useQueryResponseData, useQueryResponseLoading } from '../core/QueryResponseProvider'
import { HistoryBooking } from '../core/_models'
import { HistoryBookingColumns } from './columns/_columns'
import { KTCardBody } from '../../../../../../_metronic/helpers'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { EmployeesListLoading } from '../components/loading/EmployeesListLoading'
import { EmployeesListPagination } from '../components/pagination/EmployeesListPagination'

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

  const data = useMemo(() => {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) return []
    return allData.filter(item => item.user_id === currentUserId)
  }, [allData])

  const columns = useMemo(() => HistoryBookingColumns, [])

  const { getTableProps, getTableBodyProps, headers, rows, prepareRow } = useTable({
    columns,
    data,
  })

  return (
    <KTCardBody className='py-4'>
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