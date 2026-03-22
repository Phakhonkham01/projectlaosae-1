import { FC, useState } from 'react'
import { useListView } from '../core/ListViewProvider'
import { HistoryBooking } from '../core/_models'
import { EmployeesListLoading } from '../components/loading/EmployeesListLoading'

type Props = {
  isLoading: boolean
  booking?: HistoryBooking
}

// ─── Badge ──────────────────────────────────────────────────────
const statusMap: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'badge-light-warning' },
  confirmed: { label: 'Confirmed', cls: 'badge-light-success' },
  cancelled: { label: 'Cancelled', cls: 'badge-light-danger'  },
  completed: { label: 'Completed', cls: 'badge-light-primary' },
  paid:      { label: 'Paid',      cls: 'badge-light-success' },
  failed:    { label: 'Failed',    cls: 'badge-light-danger'  },
  refunded:  { label: 'Refunded',  cls: 'badge-light-info'    },
}

const Badge = ({ value }: { value?: string }) => {
  if (!value) return <span className='text-muted'>—</span>
  const m = statusMap[value.toLowerCase()] ?? { label: value, cls: 'badge-light-secondary' }
  return (
    <span className={`badge ${m.cls} fw-bold fs-8 px-3 py-2 text-capitalize`}>
      {m.label}
    </span>
  )
}

// ─── Section Title ───────────────────────────────────────────────
const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
  <div className='d-flex align-items-center mb-5'>
    <span className='bullet bullet-vertical h-30px me-3' style={{ background: 'var(--bs-primary)' }} />
    <i className={`ki-duotone ${icon} fs-2 text-primary me-2`}>
      <span className='path1' /><span className='path2' />
    </i>
    <h6 className='fw-bolder text-gray-800 mb-0 fs-6'>{title}</h6>
  </div>
)

// ─── Info Row ────────────────────────────────────────────────────
const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className='row mb-4 align-items-center'>
    <div className='col-5'>
      <span className='text-muted fw-semibold fs-7'>{label}</span>
    </div>
    <div className='col-7 text-end'>
      <span className='text-gray-800 fw-bold fs-7'>{children}</span>
    </div>
  </div>
)

// ─── Slip Lightbox ───────────────────────────────────────────────
const SlipLightbox = ({ url, onClose }: { url: string; onClose: () => void }) => (
  <div
    onClick={onClose}
    className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center'
    style={{ zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
  >
    <div
      onClick={e => e.stopPropagation()}
      className='card shadow-lg'
      style={{ maxWidth: 440, width: '90%', borderRadius: 16, overflow: 'hidden' }}
    >
      <div className='card-header border-0 d-flex align-items-center justify-content-between py-4 px-6'>
        <span className='fw-bolder text-gray-800 fs-6'>
          <i className='ki-duotone ki-bill fs-3 text-primary me-2'>
            <span className='path1' /><span className='path2' />
          </i>
          Payment Slip
        </span>
        <button
          onClick={onClose}
          className='btn btn-sm btn-icon btn-light btn-active-light-primary'
        >
          <i className='ki-duotone ki-cross fs-4'>
            <span className='path1' /><span className='path2' />
          </i>
        </button>
      </div>
      <div className='card-body p-0'>
        <img src={url} alt='slip' className='w-100' style={{ maxHeight: 520, objectFit: 'contain' }} />
      </div>
    </div>
  </div>
)

// ─── Main Component ──────────────────────────────────────────────
const HistoryDetailModalForm: FC<Props> = ({ booking, isLoading }) => {
  const { setItemIdForUpdate } = useListView()
  const [showSlip, setShowSlip] = useState(false)

  const methodIcon: Record<string, string> = {
    cash: '💵', transfer: '🏦', credit_card: '💳', promptpay: '📱',
  }

  const fmt = (n?: number) => n != null ? `฿${n.toLocaleString()}` : '—'

  return (
    <>
      <div className='d-flex flex-column gap-7'>

        {/* ── Customer Card ── */}
        <div className='card card-flush border border-dashed border-gray-300'>
          <div className='card-body py-5 px-6'>
            <SectionTitle icon='ki-profile-circle' title='Customer' />
            <div className='d-flex align-items-center gap-4'>
              <div className='symbol symbol-50px symbol-circle'>
                <span
                  className='symbol-label fw-bolder text-white fs-4'
                  style={{ background: 'linear-gradient(135deg, #009ef7, #0095e8)' }}
                >
                  {booking?.user_name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <div className='fw-bolder text-gray-800 fs-6'>{booking?.user_name ?? '—'}</div>
                <div className='text-muted fs-7'>{booking?.user_email ?? '—'}</div>
              </div>
              <div className='ms-auto'>
                <span className='badge badge-light-primary fw-semibold fs-8 px-3 py-2' style={{ fontFamily: 'monospace' }}>
                  #{booking?.id?.slice(0, 10)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Booking + Payment (2 cols) ── */}
        <div className='row g-5'>

          {/* Booking Info */}
          <div className='col-12 col-md-6'>
            <div className='card card-flush border border-dashed border-gray-300 h-100'>
              <div className='card-body py-5 px-6'>
                <SectionTitle icon='ki-calendar' title='Booking Info' />
                <InfoRow label='Date'>{booking?.booking_date ?? '—'}</InfoRow>
                <InfoRow label='Time'>{booking?.booking_time ?? '—'}</InfoRow>
                <InfoRow label='Ship'>{booking?.ship_name ?? '—'}</InfoRow>
                <InfoRow label='Price / Hour'>{fmt(booking?.ship_price_per_hour)}</InfoRow>
                <InfoRow label='Hours'>{booking?.num_hours ?? '—'}</InfoRow>
                <InfoRow label='People'>{booking?.num_people ?? '—'}</InfoRow>
                <InfoRow label='Status'><Badge value={booking?.status} /></InfoRow>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className='col-12 col-md-6'>
            <div className='card card-flush border border-dashed border-gray-300 h-100'>
              <div className='card-body py-5 px-6'>
                <SectionTitle icon='ki-dollar' title='Payment' />
                <InfoRow label='Method'>
                  {booking?.payment_method
                    ? <>{methodIcon[booking.payment_method] ?? '💳'} <span className='text-capitalize'>{booking.payment_method.replace('_', ' ')}</span></>
                    : '—'}
                </InfoRow>
                <InfoRow label='Payment Status'><Badge value={booking?.payment_status} /></InfoRow>

                <div className='separator separator-dashed my-4' />

                <InfoRow label='Ship Total'>{fmt(booking?.total_ship_price)}</InfoRow>
                <InfoRow label='Food Total'>{fmt(booking?.total_food_price)}</InfoRow>

                <div className='d-flex align-items-center justify-content-between bg-light-primary rounded px-4 py-3 mt-3'>
                  <span className='text-primary fw-bolder fs-7'>Grand Total</span>
                  <span className='text-primary fw-bolder fs-5'>{fmt(booking?.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Foods ── */}
        {booking?.foods && booking.foods.length > 0 && (
          <div className='card card-flush border border-dashed border-gray-300'>
            <div className='card-body py-5 px-6'>
              <SectionTitle icon='ki-basket' title={`Foods (${booking.foods.length} items)`} />
              <div className='d-flex flex-column gap-3'>
                {booking.foods.map((food, i) => (
                  <div key={i} className='d-flex align-items-center gap-4 bg-light rounded px-4 py-3'>
                    {food.image && (
                      <img
                        src={food.image}
                        alt={food.name}
                        className='rounded'
                        style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0 }}
                      />
                    )}
                    <div className='flex-grow-1'>
                      <div className='fw-bold text-gray-800 fs-7'>{food.name}</div>
                      <div className='text-muted fs-8'>x{food.quantity}</div>
                    </div>
                    <span className='badge badge-light-primary fw-bold fs-8'>
                      {fmt(food.price * food.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Slip ── */}
        <div className='card card-flush border border-dashed border-gray-300'>
          <div className='card-body py-5 px-6'>
            <SectionTitle icon='ki-bill' title='Payment Slip' />
            {booking?.slip_url ? (
              <div
                className='rounded overflow-hidden cursor-pointer position-relative'
                style={{ height: 160, border: '2px solid var(--bs-gray-200)', transition: 'border-color .2s' }}
                onClick={() => setShowSlip(true)}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--bs-primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bs-gray-200)')}
              >
                <img src={booking.slip_url} alt='slip' className='w-100 h-100' style={{ objectFit: 'cover' }} />
                <div
                  className='position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center'
                  style={{ background: 'rgba(0,158,247,0)', transition: 'background .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,158,247,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,158,247,0)')}
                >
                  <span className='badge badge-primary fs-8 px-4 py-2'>
                    <i className='ki-duotone ki-eye fs-6 me-1'>
                      <span className='path1'/><span className='path2'/>
                    </i>
                    View Full Slip
                  </span>
                </div>
              </div>
            ) : (
              <div className='d-flex flex-column align-items-center justify-content-center bg-light rounded py-8 gap-2'>
                <i className='ki-duotone ki-bill fs-2x text-gray-400'>
                  <span className='path1' /><span className='path2' />
                </i>
                <span className='text-muted fs-7 fw-semibold'>No slip uploaded</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className='d-flex justify-content-end pt-2'>
          <button
            type='button'
            className='btn btn-light btn-active-light-primary fw-bold px-8'
            onClick={() => setItemIdForUpdate(undefined)}
          >
            Close
          </button>
        </div>

      </div>

      {isLoading && <EmployeesListLoading />}
      {showSlip && booking?.slip_url && (
        <SlipLightbox url={booking.slip_url} onClose={() => setShowSlip(false)} />
      )}
    </>
  )
}

export { HistoryDetailModalForm }