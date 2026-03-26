import {useMemo, useState} from 'react'
import {KTCardBody} from '../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {BillData, PAYMENT_STATUS_META} from '../core/bill_models'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {UsersListPagination} from '../components/pagination/UsersListPagination'

const formatCurrency = (amount: number) => `${amount.toLocaleString()} LAK`
const defaultStatusMeta = PAYMENT_STATUS_META.pending

const getStatusMeta = (paymentStatus: string | undefined) => {
  if (!paymentStatus) {
    return defaultStatusMeta
  }

  return (
    PAYMENT_STATUS_META[paymentStatus as keyof typeof PAYMENT_STATUS_META] || defaultStatusMeta
  )
}

const SUMMARY_PANEL_STYLE = {
  background: 'linear-gradient( #e6ffff 100%, #e6ffff 100%)',
  border: '1px solid #3b4963',
  borderRadius: '18px',
  boxShadow: '0 14px 28px rgba(15, 23, 42, 0.16)',
} as const

const SUMMARY_ITEM_BASE_STYLE = {
  borderRadius: '12px',
  border: '1px solid #80ffbd',
  backgroundColor: '#006666',
  minHeight: '88px',
} as const

const BillSummaryCard = ({
  title,
  count,
  total,
  pendingCount,
  isActive,
  onClick,
}: {
  title: string
  count: number
  total: number
  pendingCount: number
  isActive: boolean
  onClick: () => void
}) => {
  const accentStyle = isActive
    ? {
        border: '1px solid #6c7c',
        boxShadow: '0 0 0 2px #6c7c inset',
      }
    : {}

  return (
    <div className='col-md-6'>
      <button
        type='button'
        className='p-4 h-100 w-100 text-start'
        onClick={onClick}
        style={{
          ...SUMMARY_ITEM_BASE_STYLE,
          ...accentStyle,
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <div className='d-flex align-items-start justify-content-between mb-3'>
          <div>
            <div
              className='fw-semibold text-uppercase'
              style={{fontSize: '11px', letterSpacing: '0.12em', color: '#9fb0c9'}}
            >
              {title}
            </div>
            <div className='fw-bold mt-1' style={{fontSize: '24px', color: '#ffffff'}}>
              {count}
            </div>
          </div>
          {pendingCount > 0 && (
            <span className='badge badge-danger' style={{minWidth: '28px'}}>
              {pendingCount}
            </span>
          )}
        </div>
        <div className='d-flex justify-content-between align-items-end'>
          <div style={{color: '#c3d0e5', fontSize: '12px'}}>bill(s)</div>
          <div className='text-end'>
            <div className='fw-bold' style={{fontSize: '14px', color: '#f8fbff'}}>
              {formatCurrency(total)}
            </div>
            <div style={{color: '#93a4bf', fontSize: '11px'}}>total amount</div>
          </div>
        </div>
      </button>
    </div>
  )
}

const BillSection = ({
  title,
  emptyText,
  bills,
  onEdit,
  pendingCount,
}: {
  title: string
  emptyText: string
  bills: BillData[]
  onEdit: (id: string) => void
  pendingCount: number
}) => (
  <div className='card mb-7'>
    <div className='card-header border-0 pt-5'>
      <div className='card-title d-flex align-items-center gap-3'>
        <h3 className='fw-bold text-gray-800 mb-0'>{title}</h3>
        {pendingCount > 0 && <span className='badge badge-danger'>{pendingCount}</span>}
      </div>
    </div>
    <div className='card-body pt-0'>
      {bills.length === 0 ? (
        <div className='text-muted py-8 text-center'>{emptyText}</div>
      ) : (
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed fs-6 gy-4'>
            <thead>
              <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                <th>Bill</th>
                <th>Customer</th>
                <th>Booking Date</th>
                <th>Ship</th>
                <th>Total</th>
                <th>Status</th>
                <th className='text-end'>Action</th>
              </tr>
            </thead>
            <tbody className='fw-semibold text-gray-700'>
              {bills.map((bill) => {
                const statusMeta = getStatusMeta(bill.payment_status)
                return (
                  <tr key={bill.id}>
                    <td>
                      <div className='fw-bold'>#{bill.id.slice(0, 8).toUpperCase()}</div>
                      <div className='text-muted fs-7'>{bill.payment_method}</div>
                    </td>
                    <td>
                      <div>{bill.user_name || '-'}</div>
                      <div className='text-muted fs-7'>{bill.user_email || '-'}</div>
                    </td>
                    <td>
                      <div>{bill.booking_date || '-'}</div>
                      <div className='text-muted fs-7'>{bill.booking_time || '-'}</div>
                    </td>
                    <td>{bill.ship_name || '-'}</td>
                    <td className='fw-bolder text-primary'>
                      {formatCurrency(bill.grand_total || 0)}
                    </td>
                    <td>
                      <span className={`badge ${statusMeta.badgeClass}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className='text-end'>
                      <button
                        type='button'
                        className='btn btn-sm btn-light-primary'
                        onClick={() => onEdit(bill.id)}
                      >
                        Edit Status
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)

const ShipTable = () => {
  const bills = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const {setItemIdForUpdate} = useListView()
  const [activeTab, setActiveTab] = useState<'cash' | 'transfer'>('cash')

  const cashBills = useMemo(
    () => bills.filter((bill) => bill.payment_method === 'cash'),
    [bills]
  )
  const transferBills = useMemo(
    () => bills.filter((bill) => bill.payment_method === 'transfer'),
    [bills]
  )

  const cashTotal = useMemo(
    () => cashBills.reduce((sum, bill) => sum + (bill.grand_total || 0), 0),
    [cashBills]
  )
  const cashPendingCount = useMemo(
    () => cashBills.filter((bill) => bill.payment_status === 'pending').length,
    [cashBills]
  )
  const transferTotal = useMemo(
    () => transferBills.reduce((sum, bill) => sum + (bill.grand_total || 0), 0),
    [transferBills]
  )
  const transferPendingCount = useMemo(
    () => transferBills.filter((bill) => bill.payment_status === 'pending').length,
    [transferBills]
  )
  const activeBills = activeTab === 'cash' ? cashBills : transferBills
  const activePendingCount = activeTab === 'cash' ? cashPendingCount : transferPendingCount
  const activeTitle = activeTab === 'cash' ? 'Cash Bills' : 'Transfer Bills'
  const activeEmptyText =
    activeTab === 'cash'
      ? 'No cash bills found for this filter.'
      : 'No transfer bills found for this filter.'

  return (
    <KTCardBody className='py-4'>
      <div className='card border-0 mb-8' style={SUMMARY_PANEL_STYLE}>
        <div className='card-body py-5 px-5 px-md-7'>
          <div className='d-flex justify-content-center mb-5'>
            <div
              style={{
                width: '72px',
                height: '3px',
                borderRadius: '999px',
                backgroundColor: '#FFFF',
                opacity: 0.65,
              }}
            />
          </div>
          <div className='d-flex justify-content-center mb-5'>
            <div
              style={{
                width: '28px',
                height: '3px',
                borderRadius: '999px',
                backgroundColor: '#FFFF',
                opacity: 0.9,
              }}
            />
          </div>
          <div className='row g-4'>
            <BillSummaryCard
              title='Cash Bills'
              count={cashBills.length}
              total={cashTotal}
              pendingCount={cashPendingCount}
              isActive={activeTab === 'cash'}
              onClick={() => setActiveTab('cash')}
            />
            <BillSummaryCard
              title='Transfer Bills'
              count={transferBills.length}
              total={transferTotal}
              pendingCount={transferPendingCount}
              isActive={activeTab === 'transfer'}
              onClick={() => setActiveTab('transfer')}
            />
          </div>
        </div>
      </div>

      <BillSection
        title={activeTitle}
        emptyText={activeEmptyText}
        bills={activeBills}
        onEdit={setItemIdForUpdate}
        pendingCount={activePendingCount}
      />

      <UsersListPagination />
      {isLoading && <UsersListLoading />}
    </KTCardBody>
  )
}

export {ShipTable}
