import {useMemo, useState} from 'react'
import {KTCardBody} from '../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {
  BillData,
  PaymentMethod,
  PaymentStatus,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_META,
} from '../core/bill_models'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {UsersListPagination} from '../components/pagination/UsersListPagination'

const formatCurrency = (amount: number) => `${amount.toLocaleString()} LAK`
const defaultStatusMeta = PAYMENT_STATUS_META.pending

type PaymentMethodTab = PaymentMethod
type StatusTab = 'all' | PaymentStatus

const normalizePaymentStatus = (value?: string) => value?.toLowerCase().trim().replace(/[\s-]+/g, '_') ?? ''

const getStatusMeta = (paymentStatus: string | undefined) => {
  const normalized = normalizePaymentStatus(paymentStatus)
  const key = normalized === 'payment_failed' ? 'payment failed' : normalized
  return PAYMENT_STATUS_META[key as PaymentStatus] || defaultStatusMeta
}

const statusTabs: {label: string; value: StatusTab}[] = [
  {label: 'ທັງໝົດ', value: 'all'},
  {label: PAYMENT_STATUS_META.pending.label, value: 'pending'},
  {label: PAYMENT_STATUS_META.slip_submitted.label, value: 'slip_submitted'},
  {label: PAYMENT_STATUS_META.approved.label, value: 'approved'},
  {label: PAYMENT_STATUS_META.rejected.label, value: 'rejected'},
  {label: PAYMENT_STATUS_META.re_submitted.label, value: 're_submitted'},
  {label: PAYMENT_STATUS_META['payment failed'].label, value: 'payment failed'},
  {label: PAYMENT_STATUS_META.under_review_again.label, value: 'under_review_again'},
]

const paymentMethodMeta: Record<PaymentMethod, {title: string; shortLabel: string}> = {
  cash: {title: 'ບິນເງິນສົດ', shortLabel: 'ເງິນສົດ'},
  transfer: {title: 'ບິນໂອນເງິນ', shortLabel: 'ໂອນເງິນ'},
  'cash+transfer': {title: 'ບິນເງິນສົດ + ໂອນ', shortLabel: 'ເງິນສົດ + ໂອນ'},
  bcel: {title: 'ບິນ BCEL QR', shortLabel: 'BCEL QR'},
}

const getMethodLabel = (method?: string) => paymentMethodMeta[method as PaymentMethod]?.shortLabel || method || '-'

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
  const accentStyle = isActive ? {border: '1px solid #6c7c', boxShadow: '0 0 0 2px #6c7c inset'} : {}

  return (
    <div className='col-12 col-md-6 col-xl-3'>
      <button
        type='button'
        className='p-4 h-100 w-100 text-start'
        onClick={onClick}
        style={{...SUMMARY_ITEM_BASE_STYLE, ...accentStyle, cursor: 'pointer', outline: 'none'}}
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
          <div style={{color: '#c3d0e5', fontSize: '12px'}}>ບິນ</div>
          <div className='text-end'>
            <div className='fw-bold' style={{fontSize: '14px', color: '#f8fbff'}}>
              {formatCurrency(total)}
            </div>
            <div style={{color: '#93a4bf', fontSize: '11px'}}>ຍອດລວມ</div>
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
  activeStatus,
  onStatusChange,
  counts,
}: {
  title: string
  emptyText: string
  bills: BillData[]
  onEdit: (id: string) => void
  pendingCount: number
  activeStatus: StatusTab
  onStatusChange: (s: StatusTab) => void
  counts: Record<StatusTab, number>
}) => (
  <div className='card mb-7'>
    <div className='card-header border-0 pt-5 d-flex align-items-center justify-content-between flex-wrap gap-3'>
      <div className='card-title d-flex align-items-center gap-3'>
        <h3 className='fw-bold text-gray-800 mb-0'>{title}</h3>
        {pendingCount > 0 && <span className='badge badge-danger'>{pendingCount}</span>}
      </div>

      <ul className='nav nav-tabs nav-line-tabs nav-stretch fs-7 border-0'>
        {statusTabs.map((tab) => (
          <li key={tab.value} className='nav-item'>
            <a
              className={`nav-link fw-bold ${activeStatus === tab.value ? 'active' : 'text-muted'}`}
              onClick={() => onStatusChange(tab.value)}
              style={{cursor: 'pointer'}}
            >
              {tab.label}
              <span className={`ms-1 badge ${activeStatus === tab.value ? 'badge-primary' : 'badge-light'}`}>
                {counts[tab.value] ?? 0}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div className='card-body pt-0'>
      {bills.length === 0 ? (
        <div className='text-muted py-8 text-center'>{emptyText}</div>
      ) : (
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed fs-6 gy-4'>
            <thead>
              <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                <th>ບິນ</th>
                <th>ລູກຄ້າ</th>
                <th>ວັນທີຈອງ</th>
                <th>ເຮືອ</th>
                <th>ລວມ</th>
                <th>ສະຖານະ</th>
                <th className='text-end'>ຈັດການ</th>
              </tr>
            </thead>
            <tbody className='fw-semibold text-gray-700'>
              {bills.map((bill) => {
                const statusMeta = getStatusMeta(bill.payment_status)
                return (
                  <tr key={bill.id}>
                    <td>
                      <div className='fw-bold'>#{bill.id.slice(0, 8).toUpperCase()}</div>
                      <div className='text-muted fs-7'>{getMethodLabel(bill.payment_method)}</div>
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
                    <td className='fw-bolder text-primary'>{formatCurrency(bill.grand_total || 0)}</td>
                    <td>
                      <span className={`badge ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
                    </td>
                    <td className='text-end'>
                      <button type='button' className='btn btn-sm btn-light-primary' onClick={() => onEdit(bill.id)}>
                        ເບິ່ງລາຍລະອຽດ
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
  const [activeTab, setActiveTab] = useState<PaymentMethodTab>('cash')
  const [activeStatus, setActiveStatus] = useState<StatusTab>('all')

  const billsByMethod = useMemo(
    () =>
      PAYMENT_METHOD_OPTIONS.reduce((acc, method) => {
        acc[method] = bills.filter((bill) => bill.payment_method === method)
        return acc
      }, {} as Record<PaymentMethod, BillData[]>),
    [bills]
  )

  const methodBills = billsByMethod[activeTab] || []

  const filteredBills = useMemo(
    () =>
      activeStatus === 'all'
        ? methodBills
        : methodBills.filter((bill) => normalizePaymentStatus(bill.payment_status) === normalizePaymentStatus(activeStatus)),
    [methodBills, activeStatus]
  )

  const statusCounts = useMemo(
    () =>
      statusTabs.reduce((acc, tab) => {
        acc[tab.value] =
          tab.value === 'all'
            ? methodBills.length
            : methodBills.filter((bill) => normalizePaymentStatus(bill.payment_status) === normalizePaymentStatus(tab.value)).length
        return acc
      }, {} as Record<StatusTab, number>),
    [methodBills]
  )

  const methodSummaries = useMemo(
    () =>
      PAYMENT_METHOD_OPTIONS.map((method) => {
        const methodItems = billsByMethod[method] || []
        return {
          method,
          count: methodItems.length,
          total: methodItems.reduce((sum, bill) => sum + (bill.grand_total || 0), 0),
          pendingCount: methodItems.filter((bill) => normalizePaymentStatus(bill.payment_status) === 'pending').length,
        }
      }),
    [billsByMethod]
  )

  const activeSummary = methodSummaries.find((item) => item.method === activeTab)
  const activePendingCount = activeSummary?.pendingCount || 0
  const activeTitle = paymentMethodMeta[activeTab].title
  const activeEmptyText = `ບໍ່ພົບ${paymentMethodMeta[activeTab].title}ຕາມຕົວກອງນີ້`

  return (
    <KTCardBody className='py-4'>
      <div className='card border-0 mb-8' style={SUMMARY_PANEL_STYLE}>
        <div className='card-body py-5 px-5 px-md-7'>
          <div className='row g-4'>
            {methodSummaries.map((summary) => (
              <BillSummaryCard
                key={summary.method}
                title={paymentMethodMeta[summary.method].title}
                count={summary.count}
                total={summary.total}
                pendingCount={summary.pendingCount}
                isActive={activeTab === summary.method}
                onClick={() => {
                  setActiveTab(summary.method)
                  setActiveStatus('all')
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <BillSection
        title={activeTitle}
        emptyText={activeEmptyText}
        bills={filteredBills}
        onEdit={setItemIdForUpdate}
        pendingCount={activePendingCount}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        counts={statusCounts}
      />

      <UsersListPagination />
      {isLoading && <UsersListLoading />}
    </KTCardBody>
  )
}

export {ShipTable}
