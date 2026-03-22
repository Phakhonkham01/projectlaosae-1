import { Column } from 'react-table'
import { HistoryBooking } from '../../core/_models'
import { EmployeesSelectionCell } from './EmployeesSelectionCell'
import { EmployeesSelectionHeader } from './EmployeesSelectionHeader'
import { EmployeesActionsCell } from './EmployeesActionsCell'
import { EmployeesListHeader } from '../../components/header/EmployeesListHeader'

// ─── User Info Cell ─────────────────────────────────────────────
const UserInfoCell = ({ booking }: { booking: HistoryBooking }) => (
  <div className='d-flex flex-column'>
    <span className='text-gray-800 fw-bold'>{booking.user_name}</span>
    <span className='text-gray-500 fs-7'>{booking.user_email}</span>
  </div>
)

// ─── Booking Date Cell ──────────────────────────────────────────
const BookingDateCell = ({ booking }: { booking: HistoryBooking }) => (
  <div className='d-flex flex-column'>
    <span className='text-gray-800 fw-bold'>{booking.booking_date}</span>
    <span className='text-gray-500 fs-7'>{booking.booking_time}</span>
  </div>
)

// ─── Status Cell ────────────────────────────────────────────────
const statusStyles: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fff8e1', color: '#f59e0b' },
  confirmed: { bg: '#e8f5e9', color: '#10b981' },
  cancelled: { bg: '#fce8e8', color: '#ef4444' },
  completed: { bg: '#ede9fe', color: '#8b5cf6' },
}

const BookingStatusCell = ({ status }: { status: string }) => {
  const s = statusStyles[status] ?? { bg: '#f1f5f9', color: '#64748b' }
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      borderRadius: 999,
      padding: '4px 12px',
      fontWeight: 600,
      fontSize: 12,
      textTransform: 'capitalize',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {status}
    </span>
  )
}

// ─── Payment Cell ───────────────────────────────────────────────
const paymentStatusStyles: Record<string, { bg: string; color: string }> = {
  pending:  { bg: '#fff8e1', color: '#f59e0b' },
  paid:     { bg: '#e8f5e9', color: '#10b981' },
  failed:   { bg: '#fce8e8', color: '#ef4444' },
  refunded: { bg: '#ede9fe', color: '#8b5cf6' },
}

const methodIcon: Record<string, string> = {
  cash: '💵',
  transfer: '🏦',
  credit_card: '💳',
  promptpay: '📱',
}

const PaymentCell = ({ booking }: { booking: HistoryBooking }) => {
  const s = paymentStatusStyles[booking.payment_status] ?? { bg: '#f1f5f9', color: '#64748b' }
  return (
    <div className='d-flex flex-column gap-1'>
      <span className='text-gray-800 fw-bold' style={{ fontSize: 13 }}>
        {methodIcon[booking.payment_method] ?? '💳'}{' '}
        {booking.payment_method.replace('_', ' ')}
      </span>
      <span style={{
        background: s.bg,
        color: s.color,
        borderRadius: 999,
        padding: '2px 8px',
        fontWeight: 600,
        fontSize: 11,
        textTransform: 'capitalize',
        display: 'inline-block',
        width: 'fit-content',
      }}>
        {booking.payment_status}
      </span>
    </div>
  )
}

// ─── Grand Total Cell ───────────────────────────────────────────
const GrandTotalCell = ({ value }: { value: number }) => (
  <span className='text-gray-800 fw-bold'>
    {value != null ? `${value.toLocaleString()} LAK` : '-'}
  </span>
)

// ─── Columns Definition ─────────────────────────────────────────
const HistoryBookingColumns: ReadonlyArray<Column<HistoryBooking>> = [
  // {
  //   Header: (props) => <EmployeesSelectionHeader tableProps={props} />,
  //   id: 'selection',
  //   Cell: ({ row }) => <EmployeesSelectionCell id={row.original.id} />,
  // },
  // {
  //   Header: (props) => (
  //     <EmployeesListHeader tableProps={props} title='User' className='min-w-180px' />
  //   ),
  //   id: 'user_info',
  //   Cell: ({ row }) => <UserInfoCell booking={row.original} />,
  // },
  {
    Header: (props) => (
      <EmployeesListHeader tableProps={props} title='Ship' className='min-w-130px' />
    ),
    accessor: 'ship_name',
    Cell: ({ value }) => (
      <span className='text-gray-800 fw-bold'>{value ?? '-'}</span>
    ),
  },
  {
    Header: (props) => (
      <EmployeesListHeader tableProps={props} title='Booking Date' className='min-w-130px' />
    ),
    id: 'booking_date',
    Cell: ({ row }) => <BookingDateCell booking={row.original} />,
  },
  {
    Header: (props) => (
      <EmployeesListHeader tableProps={props} title='Status' className='min-w-110px' />
    ),
    accessor: 'status',
    Cell: ({ value }) => <BookingStatusCell status={value} />,
  },
  {
    Header: (props) => (
      <EmployeesListHeader tableProps={props} title='Payment' className='min-w-150px' />
    ),
    id: 'payment',
    Cell: ({ row }) => <PaymentCell booking={row.original} />,
  },
  {
    Header: (props) => (
      <EmployeesListHeader tableProps={props} title='Total' className='min-w-100px' />
    ),
    accessor: 'grand_total',
    Cell: ({ value }) => <GrandTotalCell value={value} />,
  },
  {
    Header: (props) => (
      <EmployeesListHeader tableProps={props} title='Actions' className='text-end min-w-100px' />
    ),
    id: 'actions',
    Cell: ({ row }) => <EmployeesActionsCell id={row.original.id} />,
  },
]

export { HistoryBookingColumns }