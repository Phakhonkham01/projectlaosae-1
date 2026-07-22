import {useEffect, useMemo, useState} from 'react'
import Swal from 'sweetalert2'
import {KTIcon} from '../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {PAYMENT_STATUS_META, PAYMENT_STATUS_OPTIONS} from '../core/bill_models'
import {getBookingDetails, updateBillStatus} from '../core/bill_requests'
import {useQueryResponse, useQueryResponseData} from '../core/QueryResponseProvider'

const defaultPaymentStatus = PAYMENT_STATUS_OPTIONS[0]
const defaultPaymentStatusMeta =
  PAYMENT_STATUS_META[defaultPaymentStatus] ?? {label: '-', badgeClass: 'badge-light'}
const paymentMethodLabels: Record<string, string> = {
  cash: 'ເງິນສົດ',
  'cash+transfer': 'ເງິນສົດ + ໂອນ',
  bcel: 'BCEL QR',
}

const formatDateDMY = (value?: string) => {
  if (!value) return '-'
  const [y, m, d] = value.split('T')[0].split('-')
  return y && m && d ? `${d}/${m}/${y}` : value
}
const getPaymentMethodLabel = (method?: string) => paymentMethodLabels[method || ''] || method || '-'
const normalizePaymentStatus = (value?: string) => value?.toLowerCase().trim().replace(/[\s-]+/g, '_') ?? ''
const getDisplayPaymentStatus = (value?: string) => {
  const normalized = normalizePaymentStatus(value)
  if (normalized === 'slip_submitted') return 'pending'
  if (normalized === 're_submitted') return 'pending' // ສະຖານະ "ສົ່ງກວດອີກຄັ້ງ" ຖືກລົບອອກ
  if (normalized === 'payment_failed') return 'payment failed'
  return normalized
}

const BookingShipEditModal = () => {
  const {itemIdForUpdate, setItemIdForUpdate} = useListView()
  const {refetch} = useQueryResponse()
  const bills = useQueryResponseData()
  const bill = useMemo(
    () => bills.find((currentBill) => currentBill.id === itemIdForUpdate),
    [bills, itemIdForUpdate]
  )
  const [paymentStatus, setPaymentStatus] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [details, setDetails] = useState<{
    cash_amount?: number | null
    transfer_amount?: number | null
    bcel_amount_usd?: number | null
  }>({})

  // ດຶງ field ລະອຽດການຊຳລະຈາກ booking_details ຕອນເປີດ modal (booking ບໍ່ໄດ້ເກັບ field ພວກນີ້ແລ້ວ)
  useEffect(() => {
    if (!bill?.id) {
      setDetails({})
      return
    }
    let active = true
    getBookingDetails(bill.id).then((d) => {
      if (active) setDetails(d)
    })
    return () => {
      active = false
    }
  }, [bill?.id])

  // merge: doc ໃໝ່ໃຊ້ຄ່າຈາກ booking_details, doc ເກົ່າ fallback ໃຊ້ field ໃນ booking
  const cashAmount = details.cash_amount ?? bill?.cash_amount
  const transferAmount = details.transfer_amount ?? bill?.transfer_amount
  const bcelAmountUsd = details.bcel_amount_usd ?? bill?.bcel_amount_usd

  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  useEffect(() => {
    const currentStatus = getDisplayPaymentStatus(bill?.payment_status)
    const safeStatus =
      currentStatus && currentStatus in PAYMENT_STATUS_META ? currentStatus : defaultPaymentStatus
    setPaymentStatus(safeStatus)
    setRejectReason(bill?.reject_reason || '')
  }, [bill])

  const closeModal = () => setItemIdForUpdate(undefined)

  const handleSave = async () => {
    if (!bill || !paymentStatus) {
      return
    }

    if (paymentStatus === 'rejected' && !rejectReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'ຈຳເປັນຕ້ອງໃສ່ເຫດຜົນ',
        text: 'ກະລຸນາໃສ່ເຫດຜົນເມື່ອປະຕິເສດບິນ',
      })
      return
    }

    setIsSaving(true)
    try {
      await updateBillStatus(
        bill.id,
        paymentStatus as (typeof PAYMENT_STATUS_OPTIONS)[number],
        rejectReason.trim()
      )
      await refetch()
      Swal.fire({
        icon: 'success',
        title: 'ອັບເດດບິນແລ້ວ',
        timer: 1400,
        showConfirmButton: false,
      })
      closeModal()
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'ອັບເດດບໍ່ສຳເລັດ',
        text: 'ບໍ່ສາມາດອັບເດດສະຖານະບິນນີ້ໄດ້',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!bill) {
    return null
  }

  const paymentStatusMeta =
    PAYMENT_STATUS_META[getDisplayPaymentStatus(bill.payment_status) as keyof typeof PAYMENT_STATUS_META] ??
    defaultPaymentStatusMeta

  return (
    <>
      <div
        className='modal fade show d-block'
        id='kt_modal_bill'
        role='dialog'
        tabIndex={-1}
        aria-modal='true'
      >
        <div className='modal-dialog modal-dialog-centered mw-900px'>
          <div className='modal-content'>
            <div className='modal-header'>
              <div>
                <h2 className='fw-bold mb-1'>ແກ້ໄຂສະຖານະບິນ</h2>
                <div className='text-muted fs-7'>#{bill.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <button
                type='button'
                className='btn btn-icon btn-sm btn-active-icon-primary'
                onClick={closeModal}
              >
                <KTIcon iconName='cross' className='fs-1' />
              </button>
            </div>

            <div className='modal-body py-8 px-10'>
              {getDisplayPaymentStatus(bill.payment_status) === 'rejected' && (
                <div className='alert alert-danger d-flex align-items-start gap-3 mb-8' role='alert'>
                  <KTIcon iconName='cross-circle' className='fs-2x text-danger' />
                  <div>
                    <div className='fw-bold fs-5 mb-1'>ບິນນີ້ຖືກປະຕິເສດ</div>
                    <div className='fs-6'>
                      <span className='text-muted'>ເຫດຜົນ: </span>
                      <span className='fw-semibold'>{bill.reject_reason || 'ບໍ່ໄດ້ລະບຸເຫດຜົນ'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className='row g-5 mb-8'>
                <div className='col-xl-4 col-md-6'>
                  <div className='card bg-light-primary border-0 h-100'>
                    <div className='card-body'>
                      <div className='text-muted fs-7 mb-2'>ລູກຄ້າ</div>
                      <div className='fw-bold fs-4'>{bill.user_name || '-'}</div>
                      <div className='text-muted'>{bill.user_email || '-'}</div>
                    </div>
                  </div>
                </div>
                <div className='col-xl-4 col-md-6'>
                  <div className='card bg-light-success border-0 h-100'>
                    <div className='card-body'>
                      <div className='text-muted fs-7 mb-2'>ຍອດບິນລວມ</div>
                      <div className='fw-bold fs-2 text-success'>
                        {bill.grand_total.toLocaleString()} LAK
                      </div>
                      <div className='text-muted text-capitalize'>
                        ຊຳລະດ້ວຍ {getPaymentMethodLabel(bill.payment_method)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-xl-4 col-md-12'>
                  <div className='card bg-light-warning border-0 h-100'>
                    <div className='card-body'>
                      <div className='text-muted fs-7 mb-2'>ສະຖານະປັດຈຸບັນ</div>
                      <div className={`badge ${paymentStatusMeta.badgeClass} fw-bold fs-7 mb-3`}>
                        {paymentStatusMeta.label}
                      </div>
                      <div className='text-muted fs-7'>ອາຫານ</div>
                      <div className='fw-bold fs-3'>{bill.foods?.length || 0} ລາຍການ</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='card border-0 bg-light mb-8'>
                <div className='card-body py-6'>
                  <div className='row g-6'>
                    <div className='col-md-4 col-6'>
                      <div className='text-muted fs-7 mb-2'>ວັນທີຈອງ</div>
                      <div className='fw-bold fs-6'>
                        {formatDateDMY(bill.booking_date)} {bill.booking_time || ''}
                      </div>
                    </div>
                    <div className='col-md-4 col-6'>
                      <div className='text-muted fs-7 mb-2'>ເຮືອ</div>
                      <div className='fw-bold fs-6'>{bill.ship_name || '-'}</div>
                    </div>
                    <div className='col-md-4 col-6'>
                      <div className='text-muted fs-7 mb-2'>ຈຳນວນຄົນ</div>
                      <div className='fw-bold fs-6'>{bill.num_people || '-'} ຄົນ</div>
                    </div>
                    <div className='col-md-4 col-6'>
                      <div className='text-muted fs-7 mb-2'>ຈຳນວນຊົ່ວໂມງ</div>
                      <div className='fw-bold fs-6'>{bill.num_hours || '-'} ຊົ່ວໂມງ</div>
                    </div>
                    <div className='col-md-4 col-6'>
                      <div className='text-muted fs-7 mb-2'>ວິທີຊຳລະ</div>
                      <div className='fw-bold fs-6 text-capitalize'>
                        {getPaymentMethodLabel(bill.payment_method)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='row g-8'>
                <div className='col-lg-7'>
                  <div className='card border border-gray-200 h-100'>
                    <div className='card-header border-0 pt-6'>
                      <div className='card-title'>
                        <h3 className='fw-bold m-0'>ລາຍການອາຫານໃນບິນ</h3>
                      </div>
                    </div>
                    <div className='card-body pt-0'>
                      {bill.foods?.length ? (
                        <div className='table-responsive'>
                          <table className='table align-middle table-row-dashed gy-4'>
                            <thead>
                              <tr className='text-muted fw-bold fs-7 text-uppercase gs-0'>
                                <th>ອາຫານ</th>
                                <th className='text-center'>ຈຳນວນ</th>
                                <th className='text-end'>ລາຄາ</th>
                                <th className='text-end'>ລວມ</th>
                              </tr>
                            </thead>
                            <tbody className='fw-semibold text-gray-700'>
                              {bill.foods.map((food, index) => (
                                <tr key={`${food.product_id}-${index}`}>
                                  <td>
                                    <div className='d-flex flex-column'>
                                      <span className='fw-bold text-gray-900'>{food.name}</span>
                                      <span className='text-muted fs-7'>
                                        ລະຫັດ: {food.product_id || '-'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className='text-center'>{food.quantity}</td>
                                  <td className='text-end'>{food.price.toLocaleString()} LAK</td>
                                  <td className='text-end fw-bold'>
                                    {(food.price * food.quantity).toLocaleString()} LAK
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className='d-flex flex-column align-items-center justify-content-center py-10 text-center'>
                          <i className='bi bi-basket2 text-muted fs-1 mb-3'></i>
                          <div className='fw-bold fs-5 text-gray-800 mb-1'>ບິນນີ້ບໍ່ມີລາຍການອາຫານ</div>
                          <div className='text-muted fs-7'>ການຈອງນີ້ມີສະເພາະຄ່າເຮືອເທົ່ານັ້ນ</div>
                        </div>
                      )}

                      <div className='separator separator-dashed my-5'></div>
                      <div className='d-flex justify-content-between align-items-center'>
                        <span className='text-muted fw-semibold'>ລວມຄ່າອາຫານ</span>
                        <span className='fw-bold fs-4 text-primary'>
                          {bill.total_food_price.toLocaleString()} LAK
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-lg-5'>
                  <div className='card border border-gray-200 mb-8'>
                    <div className='card-header border-0 pt-6'>
                      <div className='card-title'>
                        <h3 className='fw-bold m-0'>ສະຫຼຸບລາຄາ</h3>
                      </div>
                    </div>
                    <div className='card-body pt-0'>
                      <div className='d-flex justify-content-between align-items-center mb-3'>
                        <span className='text-muted fw-semibold'>ຄ່າເຮືອ/ຊົ່ວໂມງ</span>
                        <span className='fw-bold'>{(bill.ship_price_per_hour || 0).toLocaleString()} LAK</span>
                      </div>
                      <div className='d-flex justify-content-between align-items-center mb-3'>
                        <span className='text-muted fw-semibold'>
                          ຄ່າຈອງເຮືອ ({bill.num_hours || 0} ຊົ່ວໂມງ)
                        </span>
                        <span className='fw-bold'>{(bill.total_ship_price || 0).toLocaleString()} LAK</span>
                      </div>
                      <div className='d-flex justify-content-between align-items-center mb-3'>
                        <span className='text-muted fw-semibold'>
                          ຄ່າອາຫານ ({bill.foods?.length || 0} ລາຍການ)
                        </span>
                        <span className='fw-bold'>{(bill.total_food_price || 0).toLocaleString()} LAK</span>
                      </div>
                      <div className='separator separator-dashed my-4'></div>
                      <div className='d-flex justify-content-between align-items-center'>
                        <span className='fw-bold fs-5'>ຍອດລວມທັງໝົດ</span>
                        <span className='fw-bold fs-3 text-success'>
                          {(bill.grand_total || 0).toLocaleString()} LAK
                        </span>
                      </div>

                      {(bill.payment_method === 'cash+transfer' ||
                        bill.payment_method === 'bcel' ||
                        cashAmount != null ||
                        transferAmount != null ||
                        bcelAmountUsd != null) && (
                        <>
                          <div className='separator separator-dashed my-4'></div>
                          <div className='text-muted fs-7 fw-bold text-uppercase mb-3'>
                            ລາຍລະອຽດການຊຳລະ
                          </div>
                          {cashAmount != null && (
                            <div className='d-flex justify-content-between align-items-center mb-2'>
                              <span className='text-muted fw-semibold'>ເງິນສົດ</span>
                              <span className='fw-bold'>{cashAmount.toLocaleString()} LAK</span>
                            </div>
                          )}
                          {transferAmount != null && (
                            <div className='d-flex justify-content-between align-items-center mb-2'>
                              <span className='text-muted fw-semibold'>ໂອນ</span>
                              <span className='fw-bold'>{transferAmount.toLocaleString()} LAK</span>
                            </div>
                          )}
                          {bcelAmountUsd != null && (
                            <div className='d-flex justify-content-between align-items-center mb-2'>
                              <span className='text-muted fw-semibold'>BCEL (USD)</span>
                              <span className='fw-bold'>${bcelAmountUsd.toLocaleString()}</span>
                            </div>
                          )}
                        </>
                      )}

                      {bill.slip_url && (
                        <>
                          <div className='separator separator-dashed my-4'></div>
                          <div className='text-muted fs-7 fw-bold text-uppercase mb-3'>ໃບໂອນ/ສະລິບ</div>
                          <a href={bill.slip_url} target='_blank' rel='noreferrer'>
                            <img
                              src={bill.slip_url}
                              alt='payment slip'
                              className='rounded w-100'
                              style={{maxHeight: 220, objectFit: 'cover'}}
                            />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className='card border border-gray-200 mb-8'>
                    <div className='card-header border-0 pt-6'>
                      <div className='card-title'>
                        <h3 className='fw-bold m-0'>ອັບເດດສະຖານະ</h3>
                      </div>
                    </div>
                    <div className='card-body pt-0'>
                      <div className='mb-7'>
                        <label className='form-label fw-bold'>ສະຖານະການຊຳລະ</label>
                        <select
                          className='form-select form-select-solid'
                          value={paymentStatus}
                          onChange={(event) => setPaymentStatus(event.target.value)}
                        >
                          {PAYMENT_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {PAYMENT_STATUS_META[status]?.label ?? status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {paymentStatus === 'rejected' && (
                        <div className='mb-0'>
                          <label className='form-label fw-bold'>ເຫດຜົນການປະຕິເສດ</label>
                          <textarea
                            className='form-control form-control-solid'
                            rows={4}
                            value={rejectReason}
                            onChange={(event) => setRejectReason(event.target.value)}
                            placeholder='ອະທິບາຍເຫດຜົນທີ່ປະຕິເສດບິນນີ້'
                          />
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className='modal-footer'>
              <button type='button' className='btn btn-light' onClick={closeModal}>
                ຍົກເລີກ
              </button>
              <button
                type='button'
                className='btn btn-primary'
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກສະຖານະ'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show'></div>
    </>
  )
}

export {BookingShipEditModal}
