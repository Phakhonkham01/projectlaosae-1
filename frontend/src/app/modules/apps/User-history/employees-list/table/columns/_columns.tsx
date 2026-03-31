import {Column} from 'react-table'
import {HistoryBooking} from '../../core/_models'
import {EmployeesActionsCell} from './EmployeesActionsCell'
import {EmployeesListHeader} from '../../components/header/EmployeesListHeader'

const bookingStatusStyles: Record<string, {bg: string; color: string}> = {
  pending: {bg: '#fff8e1', color: '#f59e0b'},
  confirmed: {bg: '#e8f5e9', color: '#10b981'},
  cancelled: {bg: '#fce8e8', color: '#ef4444'},
  completed: {bg: '#ede9fe', color: '#8b5cf6'},
  approved: {bg: '#e8f5e9', color: '#10b981'},
  rejected: {bg: '#fce8e8', color: '#ef4444'},
  payment_failed: {bg: '#ede9fe', color: '#8b5cf6'},
}

const bookingStatusLabels: Record<string, string> = {
  pending: 'ລໍຖ້າ',
  confirmed: 'ຢືນຢັນແລ້ວ',
  cancelled: 'ຍົກເລີກແລ້ວ',
  completed: 'ສຳເລັດແລ້ວ',
  approved: 'ອະນຸມັດແລ້ວ',
  rejected: 'ປະຕິເສດແລ້ວ',
  payment_failed: 'ການຊຳລະລົ້ມເຫຼວ',
}

const paymentStatusStyles: Record<string, {bg: string; color: string}> = {
  pending: {bg: '#fff8e1', color: '#f59e0b'},
  paid: {bg: '#e8f5e9', color: '#10b981'},
  failed: {bg: '#fce8e8', color: '#ef4444'},
  refunded: {bg: '#ede9fe', color: '#8b5cf6'},
}

const paymentStatusLabels: Record<string, string> = {
  pending: 'ລໍຖ້າ',
  paid: 'ຊຳລະແລ້ວ',
  failed: 'ລົ້ມເຫຼວ',
  refunded: 'ຄືນເງິນແລ້ວ',
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'ເງິນສົດ',
  transfer: 'ໂອນເງິນ',
  credit_card: 'ບັດເຄຣດິດ',
  promptpay: 'ພຣອມເພ',
}

const methodIcon: Record<string, string> = {
  cash: '💵',
  transfer: '🏦',
  credit_card: '💳',
  promptpay: '📱',
}

const BookingDateCell = ({booking}: {booking: HistoryBooking}) => (
  <div className='d-flex flex-column'>
    <span className='text-gray-800 fw-bold'>{booking.booking_date}</span>
    <span className='text-gray-500 fs-7'>{booking.booking_time}</span>
  </div>
)

const BookingStatusCell = ({status}: {status: string}) => {
  const normalized = status?.toLowerCase?.() ?? ''
  const style = bookingStatusStyles[normalized] ?? {bg: '#f1f5f9', color: '#64748b'}

  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        borderRadius: 999,
        padding: '4px 12px',
        fontWeight: 600,
        fontSize: 12,
        textTransform: 'capitalize',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <span style={{width: 6, height: 6, borderRadius: '50%', background: style.color, display: 'inline-block'}} />
      {bookingStatusLabels[normalized] ?? status}
    </span>
  )
}

const PaymentCell = ({booking}: {booking: HistoryBooking}) => {
  const normalized = booking.payment_status?.toLowerCase?.() ?? ''
  const style = paymentStatusStyles[normalized] ?? {bg: '#f1f5f9', color: '#64748b'}

  return (
    <div className='d-flex flex-column gap-1'>
      <span className='text-gray-800 fw-bold' style={{fontSize: 13}}>
        {methodIcon[booking.payment_method] ?? '💳'} {paymentMethodLabels[booking.payment_method] ?? booking.payment_method}
      </span>
      <span
        style={{
          background: style.bg,
          color: style.color,
          borderRadius: 999,
          padding: '2px 8px',
          fontWeight: 600,
          fontSize: 11,
          textTransform: 'capitalize',
          display: 'inline-block',
          width: 'fit-content',
        }}
      >
        {paymentStatusLabels[normalized] ?? booking.payment_status}
      </span>
    </div>
  )
}

const GrandTotalCell = ({value}: {value: number}) => (
  <span className='text-gray-800 fw-bold'>{value != null ? `${value.toLocaleString()} LAK` : '-'}</span>
)

const HistoryBookingColumns: ReadonlyArray<Column<HistoryBooking>> = [
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='ເຮືອ' className='min-w-130px' />,
    accessor: 'ship_name',
    Cell: ({value}) => <span className='text-gray-800 fw-bold'>{value ?? '-'}</span>,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='ວັນທີຈອງ' className='min-w-130px' />,
    id: 'booking_date',
    Cell: ({row}) => <BookingDateCell booking={row.original} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='ສະຖານະ' className='min-w-110px' />,
    accessor: 'status',
    Cell: ({value}) => <BookingStatusCell status={value} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='ການຊຳລະ' className='min-w-150px' />,
    id: 'payment',
    Cell: ({row}) => <PaymentCell booking={row.original} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='ລວມ' className='min-w-100px' />,
    accessor: 'grand_total',
    Cell: ({value}) => <GrandTotalCell value={value} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='ຈັດການ' className='text-end min-w-100px' />,
    id: 'actions',
    Cell: ({row}) => <EmployeesActionsCell id={row.original.id} />,
  },
]

export {HistoryBookingColumns}
