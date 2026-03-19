import {useMemo} from 'react'
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

const BillSummaryCard = ({
  title,
  count,
  total,
  badgeClass,
}: {
  title: string
  count: number
  total: number
  badgeClass: string
}) => (
  <div className='col-md-6'>
    <div className={`card border-0 ${badgeClass}`}>
      <div className='card-body'>
        <div className='text-muted fw-semibold text-uppercase fs-8 mb-2'>{title}</div>
        <div className='d-flex justify-content-between align-items-end'>
          <div>
            <div className='fs-2hx fw-bold'>{count}</div>
            <div className='text-muted fs-7'>bill(s)</div>
          </div>
          <div className='text-end'>
            <div className='fs-4 fw-bolder'>{formatCurrency(total)}</div>
            <div className='text-muted fs-7'>total amount</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const BillSection = ({
  title,
  emptyText,
  bills,
  onEdit,
}: {
  title: string
  emptyText: string
  bills: BillData[]
  onEdit: (id: string) => void
}) => (
  <div className='card mb-7'>
    <div className='card-header border-0 pt-5'>
      <h3 className='card-title fw-bold text-gray-800'>{title}</h3>
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
  const transferTotal = useMemo(
    () => transferBills.reduce((sum, bill) => sum + (bill.grand_total || 0), 0),
    [transferBills]
  )

  return (
    <KTCardBody className='py-4'>
      <div className='row g-5 mb-8'>
        <BillSummaryCard
          title='Cash Bills'
          count={cashBills.length}
          total={cashTotal}
          badgeClass='bg-light-warning'
        />
        <BillSummaryCard
          title='Transfer Bills'
          count={transferBills.length}
          total={transferTotal}
          badgeClass='bg-light-info'
        />
      </div>

      <BillSection
        title='Cash Bills'
        emptyText='No cash bills found for this filter.'
        bills={cashBills}
        onEdit={setItemIdForUpdate}
      />

      <BillSection
        title='Transfer Bills'
        emptyText='No transfer bills found for this filter.'
        bills={transferBills}
        onEdit={setItemIdForUpdate}
      />

      <UsersListPagination />
      {isLoading && <UsersListLoading />}
    </KTCardBody>
  )
}

export {ShipTable}
