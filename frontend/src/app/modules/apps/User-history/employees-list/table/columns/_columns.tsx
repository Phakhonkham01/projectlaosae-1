import {Column} from 'react-table'
import {HistoryBooking} from '../../core/_models'
import {EmployeesActionsCell} from './EmployeesActionsCell'
import {EmployeesListHeader} from '../../components/header/EmployeesListHeader'

const bookingStatusStyles: Record<string, {bg: string; color: string}> = {
  confirmed: {bg: '#e8f5e9', color: '#10b981'},
  cancelled: {bg: '#fce8e8', color: '#ef4444'},
  completed: {bg: '#ede9fe', color: '#8b5cf6'},
  approved: {bg: '#e8f5e9', color: '#10b981'},
  rejected: {bg: '#fce8e8', color: '#ef4444'},
  re_submitted: {bg: '#e0f2fe', color: '#0284c7'},
}

const bookingStatusLabels: Record<string, string> = {
  confirmed: 'ຢືນຢັນແລ້ວ',
  cancelled: 'ຍົກເລີກ',
  completed: 'ສຳເລັດ',
  approved: 'ອະນຸມັດ',
  rejected: 'ປະຕິເສດ',
  re_submitted: 'ສົ່ງກວດອີກຄັ້ງ',
}

const paymentStatusStyles: Record<string, {bg: string; color: string}> = {
  paid: {bg: '#e8f5e9', color: '#10b981'},
  refunded: {bg: '#ede9fe', color: '#8b5cf6'},
  approved: {bg: '#e8f5e9', color: '#10b981'},
  rejected: {bg: '#fce8e8', color: '#ef4444'},
  re_submitted: {bg: '#e0f2fe', color: '#0284c7'},
}

const paymentStatusLabels: Record<string, string> = {
  paid: 'ຊຳລະແລ້ວ',
  refunded: 'ຄືນເງິນແລ້ວ',
  approved: 'ອະນຸມັດ',
  rejected: 'ປະຕິເສດ',
  re_submitted: 'ສົ່ງກວດອີກຄັ້ງ',
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'ເງິນສົດ',
  transfer: 'ໂອນເງິນ',
  credit_card: 'ບັດເຄຣດິດ',
  promptpay: 'PromptPay',
}

const getBookingTimeRange = (startTime?: string, hours?: number) => {
  if (!startTime) return '-'

  const [hourText, minuteText = '0'] = startTime.split(':')
  const startHour = Number(hourText)
  const startMinute = Number(minuteText)

  if (!Number.isFinite(startHour) || !Number.isFinite(startMinute) || !hours) {
    return startTime
  }

  const startTotalMinutes = startHour * 60 + startMinute
  const endTotalMinutes = Math.round(startTotalMinutes + hours * 60)
  const endHour = Math.floor(endTotalMinutes / 60) % 24
  const endMinute = endTotalMinutes % 60
  const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`

  return `${startTime} - ${endTime}`
}

const normalizeStatus = (value?: string) => value?.toLowerCase().trim().replace(/[\s-]+/g, '_') ?? ''
const getDisplayStatus = (value?: string) => {
  const normalized = normalizeStatus(value)
  if (normalized === 'slip_submitted') return 'pending'
  if (normalized === 'payment_failed') return 'payment failed'
  return normalized
}

const BookingDateCell = ({booking}: {booking: HistoryBooking}) => (
  <div className='d-flex flex-column'>
    <span className='text-gray-800 fw-bold'>{booking.booking_date}</span>
    <span className='text-gray-500 fs-7'>{getBookingTimeRange(booking.booking_time, booking.num_hours)}</span>
  </div>
)

const BookingStatusCell = ({status}: {status: string}) => {
  const normalized = getDisplayStatus(status)
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
  const normalized = getDisplayStatus(booking.payment_status)
  const style = paymentStatusStyles[normalized] ?? {bg: '#f1f5f9', color: '#64748b'}

  return (
    <div className='d-flex flex-column gap-1'>
      <span className='text-gray-800 fw-bold' style={{fontSize: 13}}>
        {paymentMethodLabels[booking.payment_method] ?? booking.payment_method}
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

const PaymentSlipCell = ({url}: {url?: string}) => {
  if (!url) return <span className='text-muted'>-</span>

  return (
    <a href={url} target='_blank' rel='noreferrer' className='d-inline-block'>
      <img
        src={url}
        alt='payment slip'
        className='rounded'
        style={{
          width: 100,
          height: 100,
          objectFit: 'contain',
          border: '1px solid var(--bs-gray-300)',
          background: 'var(--bs-gray-100)',
        }}
      />
    </a>
  )
}

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
    Header: (props) => <EmployeesListHeader tableProps={props} title='ສະຖານະການຈອງ' className='min-w-110px' />,
    accessor: 'status',
    Cell: ({value}) => <BookingStatusCell status={value} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='ການຊຳລະ' className='min-w-150px' />,
    id: 'payment',
    Cell: ({row}) => <PaymentCell booking={row.original} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='ບິນ' className='min-w-250px' />,
    accessor: 'slip_url',
    Cell: ({value}) => <PaymentSlipCell url={value} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='ລວມ' className='min-w-100px' />,
    accessor: 'grand_total',
    Cell: ({value}) => <GrandTotalCell value={value} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='ຈັດການ' className='text-end min-w-100px' />,
    id: 'actions',
    Cell: ({row}) => (
      <EmployeesActionsCell id={row.original.id} paymentStatus={row.original.payment_status} />
    ),
  },
]

export {HistoryBookingColumns}
