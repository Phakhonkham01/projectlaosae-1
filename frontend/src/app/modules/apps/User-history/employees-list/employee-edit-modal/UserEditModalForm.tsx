import {FC, useEffect, useState, type ReactNode} from 'react'
import {useListView} from '../core/ListViewProvider'
import {HistoryBooking} from '../core/_models'
import {EmployeesListLoading} from '../components/loading/EmployeesListLoading'

const readCurrentRole = (): string => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return ''
    const parsed = JSON.parse(raw)
    return (parsed?.role ?? '').toString().toLowerCase()
  } catch {
    return ''
  }
}

type Props = {
  isLoading: boolean
  booking?: HistoryBooking
}

// ─── Status meta (only the statuses we still show) ──────────────────────────
const statusMap: Record<string, {label: string; cls: string; icon: string}> = {
  approved: {label: 'ອະນຸມັດ', cls: 'badge-light-success', icon: '✅'},
  used: {label: 'ເຂົ້າມາໃຊ້ງານສຳເລັດ', cls: 'badge-light-primary', icon: '🎉'},
  confirmed: {label: 'ຢືນຢັນແລ້ວ', cls: 'badge-light-success', icon: '✅'},
  completed: {label: 'ສຳເລັດແລ້ວ', cls: 'badge-light-primary', icon: '✅'},
  paid: {label: 'ຊຳລະແລ້ວ', cls: 'badge-light-success', icon: '💸'},
  rejected: {label: 'ປະຕິເສດແລ້ວ', cls: 'badge-light-danger', icon: '⛔'},
  cancelled: {label: 'ຍົກເລີກແລ້ວ', cls: 'badge-light-danger', icon: '⛔'},
  refunded: {label: 'ຄືນເງິນແລ້ວ', cls: 'badge-light-info', icon: '↩️'},
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'ເງິນສົດ',
  bcel: 'BCEL QR',
  'cash+transfer': 'ເງິນສົດ + ໂອນ (BCEL)',
  credit_card: 'ບັດເຄຣດິດ',
  promptpay: 'ພຣອມເພ',
}

const methodIcon: Record<string, string> = {
  cash: '💵',
  bcel: '🏦',
  'cash+transfer': '💵🏦',
  credit_card: '💳',
  promptpay: '📱',
}

const normalizeStatus = (value?: string) =>
  value?.toLowerCase().trim().replace(/[\s-]+/g, '_') ?? ''

const Badge = ({value}: {value?: string}) => {
  if (!value) return <span className='text-muted'>-</span>
  const key = normalizeStatus(value)
  const meta = statusMap[key]
  if (!meta) {
    return <span className='badge badge-light-secondary fw-bold fs-8 px-3 py-2'>{value}</span>
  }
  return (
    <span className={`badge ${meta.cls} fw-bold fs-7 px-3 py-2`}>
      <span className='me-1'>{meta.icon}</span>
      {meta.label}
    </span>
  )
}

const formatDateDMY = (iso?: string) => {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
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
  return `${startTime} → ${endTime}`
}

const fmt = (n?: number) => (n != null ? `${n.toLocaleString()} LAK` : '-')

// ─── Layout primitives ──────────────────────────────────────────────────────
const Field = ({label, children}: {label: string; children: ReactNode}) => (
  <div className='d-flex justify-content-between align-items-center py-2'>
    <span className='text-muted fs-7'>{label}</span>
    <span className='text-gray-900 fw-bold fs-7 text-end'>{children}</span>
  </div>
)

const SectionCard = ({
  icon,
  title,
  children,
  accent = 'primary',
}: {
  icon: string
  title: string
  children: ReactNode
  accent?: 'primary' | 'success' | 'info' | 'warning'
}) => (
  <div className='card border border-gray-200 shadow-sm mb-4'>
    <div
      className={`card-header bg-light-${accent} border-0 py-3 px-5 d-flex align-items-center`}
      style={{minHeight: 48}}
    >
      <span className='fs-3 me-3'>{icon}</span>
      <h4 className={`fw-bolder text-${accent} mb-0 fs-6`}>{title}</h4>
    </div>
    <div className='card-body py-4 px-5'>{children}</div>
  </div>
)

const HistoryDetailModalForm: FC<Props> = ({booking, isLoading}) => {
  const {setItemIdForUpdate} = useListView()
  const [showSlip, setShowSlip] = useState(false)
  const [currentRole, setCurrentRole] = useState<string>('')

  useEffect(() => {
    setCurrentRole(readCurrentRole())
  }, [])

  if (!booking) {
    return (
      <div className='py-15 text-center text-muted'>
        ບໍ່ພົບຂໍ້ມູນການຈອງ
        {isLoading && <EmployeesListLoading />}
      </div>
    )
  }

  const totalHours = booking.num_hours ?? 0
  const isStaffView = currentRole === 'employee' || currentRole === 'owner'
  const bookedBy = booking.booked_by_name?.trim() || ''
  const bookedByRole = booking.booked_by_role?.trim() || ''
  const bookedByEmail = booking.booked_by_email?.trim() || ''
  const isStaffBooking = Boolean(bookedBy)
  const customerName =
    booking.customer_name?.trim() || (!isStaffBooking ? booking.user_name : '') || '-'
  const customerPhone = booking.customer_phone?.trim() || ''
  const customerEmail = !isStaffBooking ? booking.user_email ?? '-' : ''
  const statusKey = normalizeStatus(booking.status)
  const heroAccent =
    statusKey === 'rejected' || statusKey === 'cancelled'
      ? 'danger'
      : statusKey === 'approved' || statusKey === 'completed' || statusKey === 'confirmed'
      ? 'success'
      : 'primary'

  return (
    <>
      <div className='d-flex flex-column gap-4'>
        {/* ── Hero / Receipt summary ── */}
        <div
          className={`card border-0 shadow-sm`}
          style={{
            background: `linear-gradient(135deg, var(--bs-light-${heroAccent}), #ffffff)`,
            borderLeft: `6px solid var(--bs-${heroAccent})`,
          }}
        >
          <div className='card-body p-5'>
            <div className='d-flex justify-content-between align-items-start flex-wrap gap-3'>
              <div>
                <div className='text-muted fs-8 text-uppercase mb-1' style={{letterSpacing: '0.12em'}}>
                  Booking #{booking.id?.slice(0, 8).toUpperCase()}
                </div>
                <h2 className='fw-bolder text-gray-900 mb-1'>{booking.ship_name || '-'}</h2>
                <div className='text-muted fs-7'>
                  📅 {formatDateDMY(booking.booking_date)} · 🕒{' '}
                  {getBookingTimeRange(booking.booking_time, totalHours)}
                </div>
                {isStaffView && isStaffBooking && (
                  <div className='mt-2 fs-7'>
                    <span className='text-muted me-1'>ລູກຄ້າ:</span>
                    <span className='fw-bold text-gray-900'>{customerName}</span>
                    {customerPhone && (
                      <span className='ms-2 text-gray-700'>· 📞 {customerPhone}</span>
                    )}
                  </div>
                )}
              </div>
              <div className='text-end'>
                <Badge value={booking.status} />
                <div className='mt-2'>
                  <div className='text-muted fs-8'>ລວມທັງໝົດ</div>
                  <div className={`fw-bolder fs-2x text-${heroAccent}`}>{fmt(booking.grand_total)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className='row g-4'>
          {/* Customer + Booking */}
          <div className='col-12 col-lg-6'>
            <SectionCard icon='👤' title='ຂໍ້ມູນລູກຄ້າ' accent='primary'>
              <Field label='ຊື່ລູກຄ້າ'>{customerName}</Field>
              {customerPhone ? (
                <Field label='ເບີໂທລູກຄ້າ'>
                  <a href={`tel:${customerPhone}`} className='text-decoration-none'>
                    📞 {customerPhone}
                  </a>
                </Field>
              ) : isStaffBooking ? (
                <Field label='ເບີໂທລູກຄ້າ'>
                  <span className='text-muted'>ບໍ່ໄດ້ບັນທຶກ</span>
                </Field>
              ) : null}
              {customerEmail && <Field label='ອີເມວ'>{customerEmail}</Field>}
            </SectionCard>

            {/* Staff-only booked-by card */}
            {isStaffView && isStaffBooking && (
              <SectionCard icon='🧑‍💼' title='ຈອງໂດຍພະນັກງານ' accent='warning'>
                <Field label='ຊື່ພະນັກງານ'>{bookedBy || '-'}</Field>
                {bookedByRole && (
                  <Field label='ບົດບາດ'>
                    <span className='badge badge-light-warning fw-bold text-uppercase'>
                      {bookedByRole}
                    </span>
                  </Field>
                )}
                {bookedByEmail && <Field label='ອີເມວ'>{bookedByEmail}</Field>}
              </SectionCard>
            )}

            <SectionCard icon='⛵' title='ການຈອງ' accent='info'>
              <Field label='ເຮືອ'>{booking.ship_name || '-'}</Field>
              <Field label='ວັນທີ'>{formatDateDMY(booking.booking_date)}</Field>
              <Field label='ເວລາ'>{getBookingTimeRange(booking.booking_time, totalHours)}</Field>
              <Field label='ຈຳນວນຊົ່ວໂມງ'>{totalHours ? `${totalHours} ຊົ່ວໂມງ` : '-'}</Field>
              <Field label='ຈຳນວນຄົນ'>
                {booking.num_people != null ? `${booking.num_people} ຄົນ` : '-'}
              </Field>
              <Field label='ລາຄາ/ຊົ່ວໂມງ'>{fmt(booking.ship_price_per_hour)}</Field>
            </SectionCard>
          </div>

          {/* Payment */}
          <div className='col-12 col-lg-6'>
            <SectionCard icon='💳' title='ການຊຳລະ' accent='success'>
              <Field label='ວິທີ'>
                <span className='me-2'>{methodIcon[booking.payment_method] ?? '💳'}</span>
                {paymentMethodLabels[booking.payment_method] ?? booking.payment_method ?? '-'}
              </Field>
              <Field label='ສະຖານະການຊຳລະ'>
                <Badge value={booking.payment_status} />
              </Field>

              <div className='separator separator-dashed my-3' />

              <Field label='ຄ່າເຮືອ'>{fmt(booking.total_ship_price)}</Field>
              <Field label='ຄ່າອາຫານ'>{fmt(booking.total_food_price)}</Field>

              <div
                className='d-flex justify-content-between align-items-center rounded mt-3 px-4 py-3'
                style={{background: 'var(--bs-light-success)'}}
              >
                <span className='text-success fw-bolder fs-6'>ລວມທັງໝົດ</span>
                <span className='text-success fw-bolder fs-3'>{fmt(booking.grand_total)}</span>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* ── Food list ── */}
        {booking.foods && booking.foods.length > 0 && (
          <SectionCard icon='🍽️' title={`ອາຫານ ແລະ ເຄື່ອງດື່ມ (${booking.foods.length})`} accent='warning'>
            <div className='d-flex flex-column gap-2'>
              {booking.foods.map((food, i) => (
                <div
                  key={i}
                  className='d-flex align-items-center gap-3 rounded px-3 py-2'
                  style={{background: 'var(--bs-gray-100)'}}
                >
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.name}
                      className='rounded flex-shrink-0'
                      style={{width: 44, height: 44, objectFit: 'cover'}}
                    />
                  ) : (
                    <div
                      className='rounded d-flex align-items-center justify-content-center flex-shrink-0'
                      style={{width: 44, height: 44, background: 'var(--bs-gray-200)'}}
                    >
                      🍽️
                    </div>
                  )}
                  <div className='flex-grow-1'>
                    <div className='fw-bold text-gray-900 fs-7'>{food.name}</div>
                    <div className='text-muted fs-8'>{fmt(food.price)} × {food.quantity}</div>
                  </div>
                  <span className='fw-bolder text-primary fs-7'>
                    {fmt(food.price * food.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Reject reason ── */}
        {statusKey === 'rejected' && booking.reject_reason && (
          <div
            className='card border-0 shadow-sm'
            style={{borderLeft: '6px solid var(--bs-danger)', background: 'var(--bs-light-danger)'}}
          >
            <div className='card-body p-4'>
              <div className='d-flex align-items-center gap-2 mb-2'>
                <span className='fs-3'>⚠️</span>
                <h5 className='fw-bolder text-danger mb-0'>ເຫດຜົນການປະຕິເສດ</h5>
              </div>
              <div className='text-danger fw-semibold fs-7'>{booking.reject_reason}</div>
            </div>
          </div>
        )}

        {/* ── Slip preview (read-only — only if exists) ── */}
        {booking.slip_url && (
          <SectionCard icon='🧾' title='ສະລິບການຊຳລະ' accent='info'>
            <div className='text-center'>
              <img
                src={booking.slip_url}
                alt='slip'
                className='rounded border'
                style={{maxWidth: 240, maxHeight: 320, objectFit: 'contain', cursor: 'zoom-in'}}
                onClick={() => setShowSlip(true)}
              />
              <div className='text-muted fs-8 mt-2'>ກົດທີ່ຮູບເພື່ອຂະຫຍາຍ</div>
            </div>
          </SectionCard>
        )}

        {/* ── Footer actions ── */}
        <div className='d-flex justify-content-end pt-2'>
          <button
            type='button'
            className='btn btn-primary fw-bold px-8'
            onClick={() => setItemIdForUpdate(undefined)}
          >
            ປິດ
          </button>
        </div>
      </div>

      {isLoading && <EmployeesListLoading />}

      {showSlip && booking.slip_url && (
        <div
          className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center'
          style={{zIndex: 9999, background: 'rgba(0,0,0,0.8)'}}
          onClick={() => setShowSlip(false)}
        >
          <img
            src={booking.slip_url}
            alt='slip-full'
            className='rounded shadow-lg'
            style={{maxWidth: '90%', maxHeight: '90%', objectFit: 'contain'}}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

export {HistoryDetailModalForm}
