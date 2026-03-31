import {useMemo, useState} from 'react'
import {ColumnInstance, Row, useTable} from 'react-table'
import {KTCardBody} from '../../../../../../_metronic/helpers'
import {EmployeesListLoading} from '../components/loading/EmployeesListLoading'
import {EmployeesListPagination} from '../components/pagination/EmployeesListPagination'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import {HistoryBooking} from '../core/_models'
import {CustomHeaderColumn} from './columns/CustomHeaderColumn'
import {CustomRow} from './columns/CustomRow'
import {HistoryBookingColumns} from './columns/_columns'

type StatusTab = 'all' | 'pending' | 'approved' | 'rejected' | 'payment failed'

const tabs: {label: string; value: StatusTab; color: string}[] = [
  {label: 'ທັງໝົດ', value: 'all', color: '#64748b'},
  {label: 'ລໍຖ້າ', value: 'pending', color: '#f59e0b'},
  {label: 'ອະນຸມັດແລ້ວ', value: 'approved', color: '#10b981'},
  {label: 'ປະຕິເສດແລ້ວ', value: 'rejected', color: '#ef4444'},
  {label: 'ການຊຳລະລົ້ມເຫຼວ', value: 'payment failed', color: '#8b5cf6'},
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

const normalizeStatus = (value?: string) => value?.toLowerCase().replace(/_/g, ' ').trim() ?? ''

const HistoryTable = () => {
  const allData = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const [activeTab, setActiveTab] = useState<StatusTab>('all')

  const data = useMemo(() => {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) return []

    return allData
      .filter((item) => item.user_id === currentUserId)
      .filter((item) => activeTab === 'all' || normalizeStatus(item.payment_status) === activeTab)
  }, [allData, activeTab])

  const columns = useMemo(() => HistoryBookingColumns, [])

  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
    columns,
    data,
  })

  const counts = useMemo(() => {
    const currentUserId = getCurrentUserId()
    const userItems = allData.filter((item) => item.user_id === currentUserId)

    return tabs.reduce((acc, tab) => {
      acc[tab.value] =
        tab.value === 'all'
          ? userItems.length
          : userItems.filter((item) => normalizeStatus(item.payment_status) === tab.value).length
      return acc
    }, {} as Record<StatusTab, number>)
  }, [allData])

  return (
    <KTCardBody className='py-4'>
      <div className='d-flex justify-content-end mb-4'>
        <ul className='nav nav-tabs nav-line-tabs nav-stretch fs-6 border-0'>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <li key={tab.value} className='nav-item'>
                <a
                  className={`nav-link fw-bold ${isActive ? 'active' : 'text-muted'}`}
                  onClick={() => setActiveTab(tab.value)}
                  style={{cursor: 'pointer'}}
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
                    ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັນ
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

export {HistoryTable}
