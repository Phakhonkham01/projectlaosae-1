import {useMemo, useState} from 'react'
import {useTable, ColumnInstance, Row} from 'react-table'
import {CustomHeaderColumn} from './columns/CustomHeaderColumn'
import {CustomRow} from './columns/CustomRow'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import {shipColumns} from './columns/_columns'
import {ShipData} from '../core/ship_models'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {UsersListPagination} from '../components/pagination/UsersListPagination'
import {KTCardBody} from '../../../../../../_metronic/helpers'
import {ShipCardGrid} from './columns/Shipcardgrid '

type ViewMode = 'table' | 'card'

const ShipTable = () => {
  const users = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const data = useMemo(() => users, [users])
  const columns = useMemo(() => shipColumns, [])
  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
    columns,
    data,
  })

  const [viewMode, setViewMode] = useState<ViewMode>('card')

  return (
    <KTCardBody className='py-4'>
      {/* ── View Toggle ─────────────────────────────────────────── */}
      <div className='d-flex justify-content-end mb-5'>
        <div className='btn-group' role='group'>
          <button
            type='button'
            className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setViewMode('card')}
            title='Card View'
          >
            <i className='ki-duotone ki-element-equal fs-4 m-0'>
              <span className='path1' />
              <span className='path2' />
              <span className='path3' />
              <span className='path4' />
            </i>
            <span className='ms-1'>Card</span>
          </button>
          <button
            type='button'
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setViewMode('table')}
            title='Table View'
          >
            <i className='ki-duotone ki-row-horizontal fs-4 m-0'>
              <span className='path1' />
              <span className='path2' />
            </i>
            <span className='ms-1'>Table</span>
          </button>
        </div>
      </div>

      {/* ── Card View ───────────────────────────────────────────── */}
      {viewMode === 'card' && (
        <>
          <ShipCardGrid data={data as ShipData[]} />
          {isLoading && <UsersListLoading />}
          <UsersListPagination />
        </>
      )}

      {/* ── Table View ──────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <>
          <div className='table-responsive'>
            <table
              id='kt_table_users'
              className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
              {...getTableProps()}
            >
              <thead>
                <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                  {headers.map((column: ColumnInstance<ShipData>) => (
                    <CustomHeaderColumn key={column.id} column={column} />
                  ))}
                </tr>
              </thead>
              <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
                {rows.length > 0 ? (
                  rows.map((row: Row<ShipData>, i) => {
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
          <UsersListPagination />
          {isLoading && <UsersListLoading />}
        </>
      )}
    </KTCardBody>
  )
}

export {ShipTable}