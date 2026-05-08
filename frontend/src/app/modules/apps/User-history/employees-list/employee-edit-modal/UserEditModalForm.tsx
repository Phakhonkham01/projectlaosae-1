import {FC, useRef, useState, type ChangeEvent, type ReactNode} from 'react'
import Swal from 'sweetalert2'
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage'
import {useListView} from '../core/ListViewProvider'
import {useQueryResponse} from '../core/QueryResponseProvider'
import {HistoryBooking} from '../core/_models'
import {EmployeesListLoading} from '../components/loading/EmployeesListLoading'
import {updatePaymentStatus} from '../core/_requests'
import {storage} from '../../../../../../../../firebase/useFirebase'

type Props = {
  isLoading: boolean
  booking?: HistoryBooking
}

const statusMap: Record<string, {label: string; cls: string}> = {
  pending: {label: 'ລໍຖ້າ', cls: 'badge-light-warning'},
  confirmed: {label: 'ຢືນຢັນແລ້ວ', cls: 'badge-light-success'},
  cancelled: {label: 'ຍົກເລີກແລ້ວ', cls: 'badge-light-danger'},
  completed: {label: 'ສຳເລັດແລ້ວ', cls: 'badge-light-primary'},
  paid: {label: 'ຊຳລະແລ້ວ', cls: 'badge-light-success'},
  failed: {label: 'ບໍ່ສຳເລັດ', cls: 'badge-light-danger'},
  refunded: {label: 'ຄືນເງິນແລ້ວ', cls: 'badge-light-info'},
  'payment failed': {label: 'ຊຳລະບໍ່ສຳເລັດ', cls: 'badge-light-danger'},
  under_review_again: {label: 'ກວດສອບອີກຄັ້ງ', cls: 'badge-light-info'},
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'ເງິນສົດ',
  transfer: 'ໂອນເງິນ',
  credit_card: 'ບັດເຄຣດິດ',
  promptpay: 'ພຣອມເພ',
}

const Badge = ({value}: {value?: string}) => {
  if (!value) return <span className='text-muted'>-</span>
  const meta = statusMap[value.toLowerCase()] ?? {label: value, cls: 'badge-light-secondary'}
  return <span className={`badge ${meta.cls} fw-bold fs-8 px-3 py-2 text-capitalize`}>{meta.label}</span>
}

const SectionTitle = ({icon, title}: {icon: string; title: string}) => (
  <div className='d-flex align-items-center mb-5'>
    <span className='bullet bullet-vertical h-30px me-3' style={{background: 'var(--bs-primary)'}} />
    <i className={`ki-duotone ${icon} fs-2 text-primary me-2`}>
      <span className='path1' />
      <span className='path2' />
    </i>
    <h6 className='fw-bolder text-gray-800 mb-0 fs-6'>{title}</h6>
  </div>
)

const InfoRow = ({label, children}: {label: string; children: ReactNode}) => (
  <div className='row mb-4 align-items-center'>
    <div className='col-5'>
      <span className='text-muted fw-semibold fs-7'>{label}</span>
    </div>
    <div className='col-7 text-end'>
      <span className='text-gray-800 fw-bold fs-7'>{children}</span>
    </div>
  </div>
)

const SlipLightbox = ({url, onClose}: {url: string; onClose: () => void}) => (
  <div
    onClick={onClose}
    className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center'
    style={{zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)'}}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className='card shadow-lg'
      style={{maxWidth: 300, width: '90%', borderRadius: 16, overflow: 'hidden'}}
    >
      <div className='card-header border-0 d-flex align-items-center justify-content-between py-4 px-6'>
        <span className='fw-bolder text-gray-800 fs-6'>
          <i className='ki-duotone ki-bill fs-3 text-primary me-2'>
            <span className='path1' />
            <span className='path2' />
          </i>
          ສະລິບການຊຳລະ
        </span>
        <button onClick={onClose} className='btn btn-sm btn-icon btn-light btn-active-light-primary'>
          <i className='ki-duotone ki-cross fs-4'>
            <span className='path1' />
            <span className='path2' />
          </i>
        </button>
      </div>
      <div className='card-body p-0'>
        <img src={url} alt='slip' className='w-100' style={{maxHeight: 600, objectFit: 'contain'}} />
      </div>
    </div>
  </div>
)

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

const HistoryDetailModalForm: FC<Props> = ({booking, isLoading}) => {
  const {setItemIdForUpdate} = useListView()
  const {refetch} = useQueryResponse()
  const [showSlip, setShowSlip] = useState(false)
  const [isRepayLoading, setIsRepayLoading] = useState(false)
  const repayInputRef = useRef<HTMLInputElement>(null)

  const methodIcon: Record<string, string> = {
    cash: '💵',
    transfer: '🏦',
    credit_card: '💳',
    promptpay: '📱',
  }

  const fmt = (n?: number) => (n != null ? `${n.toLocaleString()} LAK` : '-')
  const normalizedPaymentStatus = booking?.payment_status?.toLowerCase?.().replace(/ /g, '_')

  const handleRepaySlipUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !booking) return

    if (!file.type.startsWith('image/')) {
      Swal.fire({icon: 'error', title: 'ໄຟລ໌ບໍ່ຖືກຕ້ອງ', text: 'ກະລຸນາເລືອກໄຟລ໌ຮູບພາບເທົ່ານັ້ນ.'})
      return
    }

    setIsRepayLoading(true)
    try {
      const storageRef = ref(storage, `slips/${booking.id}_${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const slipUrl = await getDownloadURL(storageRef)

      await updatePaymentStatus(booking.id, 'under_review_again', slipUrl)
      await refetch()

      Swal.fire({
        icon: 'success',
        title: 'ສົ່ງແລ້ວ',
        text: 'ບິນຂອງທ່ານຖືກສົ່ງໃຫ້ກວດສອບອີກຄັ້ງແລ້ວ.',
        timer: 1800,
        showConfirmButton: false,
      })
      setItemIdForUpdate(undefined)
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'ອັບໂຫຼດບໍ່ສຳເລັດ',
        text: 'ບໍ່ສາມາດສົ່ງສະລິບການຊຳລະໄດ້. ກະລຸນາລອງໃໝ່.',
      })
    } finally {
      setIsRepayLoading(false)
      if (repayInputRef.current) repayInputRef.current.value = ''
    }
  }

  return (
    <>
      <div className='d-flex flex-column gap-7'>
        <div className='card card-flush border border-dashed border-gray-300'>
          <div className='card-body py-5 px-6'>
            <SectionTitle icon='ki-profile-circle' title='ລູກຄ້າ' />
            <div className='d-flex align-items-center gap-4'>
              <div className='symbol symbol-50px symbol-circle'>
                <span
                  className='symbol-label fw-bolder text-white fs-4'
                  style={{background: 'linear-gradient(135deg, #009ef7, #0095e8)'}}
                >
                  {booking?.user_name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <div className='fw-bolder text-gray-800 fs-6'>{booking?.user_name ?? '-'}</div>
                <div className='text-muted fs-7'>{booking?.user_email ?? '-'}</div>
              </div>
              <div className='ms-auto'>
                <span className='badge badge-light-primary fw-semibold fs-8 px-3 py-2' style={{fontFamily: 'monospace'}}>
                  #{booking?.id?.slice(0, 10)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='row g-5'>
          <div className='col-12 col-md-6'>
            <div className='card card-flush border border-dashed border-gray-300 h-100'>
              <div className='card-body py-5 px-6'>
                <SectionTitle icon='ki-calendar' title='ຂໍ້ມູນການຈອງ' />
                <InfoRow label='ວັນທີ'>{booking?.booking_date ?? '-'}</InfoRow>
                <InfoRow label='ເວລາ'>{getBookingTimeRange(booking?.booking_time, booking?.num_hours)}</InfoRow>
                <InfoRow label='ເຮືອ'>{booking?.ship_name ?? '-'}</InfoRow>
                <InfoRow label='ລາຄາ / ຊົ່ວໂມງ'>{fmt(booking?.ship_price_per_hour)}</InfoRow>
                <InfoRow label='ຈຳນວນຊົ່ວໂມງ'>{booking?.num_hours ?? '-'}</InfoRow>
                <InfoRow label='ຈຳນວນຄົນ'>{booking?.num_people ?? '-'}</InfoRow>
                <InfoRow label='ສະຖານະ'>
                  <Badge value={booking?.status} />
                </InfoRow>
              </div>
            </div>
          </div>

          <div className='col-12 col-md-6'>
            <div className='card card-flush border border-dashed border-gray-300 h-100'>
              <div className='card-body py-5 px-6'>
                <SectionTitle icon='ki-dollar' title='ການຊຳລະ' />
                <InfoRow label='ວິທີ'>
                  {booking?.payment_method ? (
                    <>
                      {methodIcon[booking.payment_method] ?? '💳'}{' '}
                      <span className='text-capitalize'>
                        {paymentMethodLabels[booking.payment_method] ?? booking.payment_method.replace('_', ' ')}
                      </span>
                    </>
                  ) : (
                    '-'
                  )}
                </InfoRow>
                <InfoRow label='ສະຖານະການຊຳລະ'>
                  <Badge value={booking?.payment_status} />
                </InfoRow>

                <div className='separator separator-dashed my-4' />

                <InfoRow label='ລວມຄ່າເຮືອ'>{fmt(booking?.total_ship_price)}</InfoRow>
                <InfoRow label='ລວມຄ່າອາຫານ'>{fmt(booking?.total_food_price)}</InfoRow>

                <div className='d-flex align-items-center justify-content-between bg-light-primary rounded px-4 py-3 mt-3'>
                  <span className='text-primary fw-bolder fs-7'>ລວມທັງໝົດ</span>
                  <span className='text-primary fw-bolder fs-5'>{fmt(booking?.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {booking?.foods && booking.foods.length > 0 && (
          <div className='card card-flush border border-dashed border-gray-300'>
            <div className='card-body py-5 px-6'>
              <SectionTitle icon='ki-basket' title={`ອາຫານ (${booking.foods.length} ລາຍການ)`} />
              <div className='d-flex flex-column gap-3'>
                {booking.foods.map((food, i) => (
                  <div key={i} className='d-flex align-items-center gap-4 bg-light rounded px-4 py-3'>
                    {food.image && (
                      <img
                        src={food.image}
                        alt={food.name}
                        className='rounded'
                        style={{width: 40, height: 40, objectFit: 'cover', flexShrink: 0}}
                      />
                    )}
                    <div className='flex-grow-1'>
                      <div className='fw-bold text-gray-800 fs-7'>{food.name}</div>
                      <div className='text-muted fs-8'>x{food.quantity}</div>
                    </div>
                    <span className='badge badge-light-primary fw-bold fs-8'>{fmt(food.price * food.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className='card card-flush border border-dashed border-gray-300'>
          <div className='card-body py-5 px-6'>
            <SectionTitle icon='ki-bill' title='ສະລິບການຊຳລະ' />
            {booking?.slip_url ? (
              <div
                className='rounded overflow-hidden cursor-pointer position-relative mx-auto'
                style={{
                  width: 300,
                  maxWidth: '100%',
                  height: 300,
                  border: '2px solid var(--bs-gray-200)',
                  transition: 'border-color .2s',
                  background: 'var(--bs-gray-100)',
                }}
                onClick={() => setShowSlip(true)}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--bs-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--bs-gray-200)')}
              >
                <img src={booking.slip_url} alt='slip' className='w-100 h-100' style={{objectFit: 'contain'}} />
              </div>
            ) : (
              <div className='d-flex flex-column align-items-center justify-content-center bg-light rounded py-8 gap-2'>
                <i className='ki-duotone ki-bill fs-2x text-gray-400'>
                  <span className='path1' />
                  <span className='path2' />
                </i>
                <span className='text-muted fs-7 fw-semibold'>ບໍ່ມີການອັບໂຫລດສະລິບ</span>
              </div>
            )}
          </div>
        </div>


        {normalizedPaymentStatus === 'payment_failed' && (
          <div className='card card-flush border border-dashed border-danger'>
            <div className='card-body py-5 px-6'>
              <SectionTitle icon='ki-pencil' title='ຊຳລະອີກຄັ້ງ / ແກ້ໄຂບິນ' />
              <div className='text-muted fs-7 mb-4'>
                ການຊຳລະບໍ່ສຳເລັດ. ອັບໂຫຼດສະລິບໃໝ່ເພື່ອສົ່ງບິນນີ້ໃຫ້ກວດສອບອີກຄັ້ງ.
              </div>
              <input
                type='file'
                accept='image/*'
                className='d-none'
                ref={repayInputRef}
                onChange={handleRepaySlipUpload}
                disabled={isRepayLoading}
              />
              <button
                type='button'
                className='btn btn-light-danger'
                onClick={() => repayInputRef.current?.click()}
                disabled={isRepayLoading}
              >
                {isRepayLoading ? 'ກຳລັງອັບໂຫຼດ...' : 'ຊຳລະອີກຄັ້ງ'}
              </button>
            </div>
          </div>
        )}
        <div className='d-flex justify-content-end pt-2'>
          <button
            type='button'
            className='btn btn-light btn-active-light-primary fw-bold px-8'
            onClick={() => setItemIdForUpdate(undefined)}
          >
            ປິດ
          </button>
        </div>
      </div>

      {isLoading && <EmployeesListLoading />}
      {showSlip && booking?.slip_url && <SlipLightbox url={booking.slip_url} onClose={() => setShowSlip(false)} />}
    </>
  )
}

export {HistoryDetailModalForm}
