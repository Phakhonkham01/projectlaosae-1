import { FC, useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../../../../../../../firebase/useFirebase'
import { KTIcon } from '../../../../../../_metronic/helpers'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CurrentUser {
  _id: string
  user_name: string
  user_email: string
  role: string
}

interface FoodItem {
  product_id: string
  name: string
  price: number
  quantity: number
}

type PaymentStatus =
  | 'pending'           // cash, waiting arrival
  | 'slip_submitted'    // transfer slip uploaded, waiting employee review
  | 'approved'          // employee approved
  | 'rejected'          // employee rejected — user must re-pay
  | 're_submitted'      // user re-uploaded slip after rejection

interface Bill {
  id: string
  ship_id: string
  ship_name: string
  booking_date: string
  booking_time: string
  num_people: number
  num_hours: number
  ship_price_per_hour: number
  total_ship_price: number
  foods: FoodItem[]
  total_food_price: number
  grand_total: number
  payment_method: 'cash' | 'transfer'
  slip_url: string
  payment_status: PaymentStatus
  user_id: string
  user_name: string
  user_email: string
  reject_reason?: string
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<
  PaymentStatus,
  { label: string; badge: string; icon: string }
> = {
  pending:        { label: 'ລໍຖ້າ',           badge: 'badge-light-warning', icon: 'time'         },
  slip_submitted: { label: 'ສົ່ງສະລິບແລ້ວ',    badge: 'badge-light-info',    icon: 'document'     },
  approved:       { label: 'ອະນຸມັດແລ້ວ',      badge: 'badge-light-success', icon: 'check-circle' },
  rejected:       { label: 'ປະຕິເສດ',         badge: 'badge-light-danger',  icon: 'cross-circle' },
  re_submitted:   { label: 'ສົ່ງໃໝ່ແລ້ວ',      badge: 'badge-light-primary', icon: 'arrows-circle'},
}

const fmt = (n: number) => n.toLocaleString() + ' LAK'

const downloadBillAsPng = (bill: Bill) => {
  const canvas = document.createElement('canvas')
  const width = 1080
  const lineHeight = 34
  const foodsCount = bill.foods?.length ?? 0
  const foodsHeight = foodsCount > 0 ? foodsCount * lineHeight + 90 : 50
  const height = 980 + foodsHeight

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas not supported')
  }

  ctx.fillStyle = '#f1e7d0'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#fffaf0'
  ctx.fillRect(50, 40, width - 100, height - 80)

  ctx.strokeStyle = '#d5c2a1'
  ctx.lineWidth = 3
  ctx.strokeRect(50, 40, width - 100, height - 80)

  ctx.fillStyle = '#3f2e1f'
  ctx.font = 'bold 42px Georgia'
  ctx.fillText('Booking Bill', 90, 100)

  ctx.font = '20px Arial'
  ctx.fillStyle = '#8a6d46'
  ctx.fillText(`Bill ID: ${bill.id.slice(0, 8).toUpperCase()}`, 90, 142)
  ctx.fillText(`Status: ${STATUS_META[bill.payment_status]?.label || bill.payment_status}`, 730, 142)

  let y = 210

  const drawRow = (label: string, value: string, color = '#2b2b2b') => {
    ctx.font = 'bold 22px Arial'
    ctx.fillStyle = '#8a6d46'
    ctx.fillText(label, 90, y)
    ctx.font = '22px Arial'
    ctx.fillStyle = color
    ctx.fillText(value, 330, y)
    y += lineHeight
  }

  drawRow('Customer', bill.user_name || '-')
  drawRow('Email', bill.user_email || '-')
  drawRow('Ship', bill.ship_name || '-')
  drawRow('Booking Date', `${bill.booking_date || '-'} ${bill.booking_time || ''}`.trim())
  drawRow('People', `${bill.num_people} people`)
  drawRow('Hours', `${bill.num_hours} hour(s)`)
  drawRow('Payment Method', bill.payment_method === 'transfer' ? 'Transfer' : 'Cash')

  y += 12
  ctx.beginPath()
  ctx.moveTo(90, y)
  ctx.lineTo(width - 90, y)
  ctx.stroke()
  y += 50

  ctx.font = 'bold 28px Georgia'
  ctx.fillStyle = '#3f2e1f'
  ctx.fillText('Charges', 90, y)
  y += 46

  drawRow('Ship Total', fmt(bill.total_ship_price), '#0d6efd')

  if (foodsCount > 0) {
    ctx.font = 'bold 24px Arial'
    ctx.fillStyle = '#3f2e1f'
    ctx.fillText('Foods', 90, y)
    y += 38

    bill.foods.forEach((food, index) => {
      ctx.font = '20px Arial'
      ctx.fillStyle = '#2b2b2b'
      ctx.fillText(`${index + 1}. ${food.name}`, 110, y)
      ctx.fillStyle = '#8a6d46'
      ctx.fillText(`x${food.quantity}`, 620, y)
      ctx.fillStyle = '#2b2b2b'
      ctx.fillText(fmt(food.price * food.quantity), 760, y)
      y += lineHeight
    })

    y += 8
    drawRow('Food Total', fmt(bill.total_food_price), '#0dcaf0')
  }

  y += 18
  ctx.beginPath()
  ctx.moveTo(90, y)
  ctx.lineTo(width - 90, y)
  ctx.stroke()
  y += 60

  ctx.font = 'bold 34px Georgia'
  ctx.fillStyle = '#3f2e1f'
  ctx.fillText('Grand Total', 90, y)
  ctx.fillStyle = '#0d6efd'
  ctx.fillText(fmt(bill.grand_total), 760, y)

  y += 72
  ctx.font = 'italic 20px Georgia'
  ctx.fillStyle = '#8a6d46'
  ctx.fillText('Thank you for your booking.', 90, y)

  const link = document.createElement('a')
  link.download = `bill-${bill.id.slice(0, 8).toUpperCase()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// ─── Bill Detail Modal ────────────────────────────────────────────────────────

const BillDetailModal: FC<{
  bill: Bill
  role: string
  onClose: () => void
  onRefresh: () => void
}> = ({ bill, role, onClose, onRefresh }) => {
  const isEmployee = role !== 'user'
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [reUploadLoading, setReUploadLoading] = useState(false)
  const reUploadRef = useRef<HTMLInputElement>(null)
  const canDownloadReceipt = bill.payment_status === 'approved'

  const meta = STATUS_META[bill.payment_status] ?? STATUS_META.pending

  // Employee: approve bill
  const handleApprove = async () => {
    setActionLoading(true)
    try {
      await updateDoc(doc(db, 'bill', bill.id), { payment_status: 'approved' })
      await updateDoc(doc(db, 'history_booking', bill.id), { payment_status: 'approved' }).catch(() => {})
      Swal.fire({ icon: 'success', title: 'ອະນຸມັດແລ້ວ', timer: 1500, showConfirmButton: false })
      onRefresh()
      onClose()
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'ບໍ່ສຳເລັດ', text: 'ບໍ່ສາມາດອະນຸມັດໄດ້' })
    } finally {
      setActionLoading(false)
    }
  }

  // Employee: reject bill
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({ icon: 'warning', title: 'ຈຳເປັນຕ້ອງລະບຸເຫດຜົນ', text: 'ກະລຸນາໃສ່ເຫດຜົນໃນການປະຕິເສດ' })
      return
    }
    setActionLoading(true)
    try {
      const update = { payment_status: 'rejected', reject_reason: rejectReason }
      await updateDoc(doc(db, 'bill', bill.id), update)
      await updateDoc(doc(db, 'history_booking', bill.id), update).catch(() => {})
      Swal.fire({ icon: 'info', title: 'ປະຕິເສດແລ້ວ', text: 'ຈະແຈ້ງໃຫ້ຜູ້ໃຊ້ຊຳລະໃໝ່', timer: 2000, showConfirmButton: false })
      onRefresh()
      onClose()
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'ບໍ່ສຳເລັດ', text: 'ບໍ່ສາມາດປະຕິເສດໄດ້' })
    } finally {
      setActionLoading(false)
    }
  }

  // User: re-upload slip after rejection
  const handleReUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'ຮັບສະເພາະຮູບພາບ', text: 'ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ' })
      return
    }
    setReUploadLoading(true)
    try {
      const storageRef = ref(storage, `slips/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      const update = { slip_url: url, payment_status: 're_submitted', reject_reason: '' }
      await updateDoc(doc(db, 'bill', bill.id), update)
      await updateDoc(doc(db, 'history_booking', bill.id), update).catch(() => {})
      Swal.fire({ icon: 'success', title: 'ສົ່ງສະລິບໃໝ່ແລ້ວ', text: 'ກຳລັງລໍຖ້າພະນັກງານກວດສອບ', timer: 2000, showConfirmButton: false })
      onRefresh()
      onClose()
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'ອັບໂຫຼດບໍ່ສຳເລັດ', text: 'ກະລຸນາລອງໃໝ່' })
    } finally {
      setReUploadLoading(false)
      if (reUploadRef.current) reUploadRef.current.value = ''
    }
  }

  const handleDownloadReceipt = () => {
    try {
      downloadBillAsPng(bill)
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Download failed',
        text: 'Could not generate the bill PNG.',
      })
    }
  }

  return (
    <div
      className='modal fade show d-block'
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
    >
      <div className='modal-dialog modal-lg modal-dialog-scrollable'>
        <div className='modal-content'>
          {/* Header */}
          <div className='modal-header'>
            <h4 className='modal-title fw-bold'>
              Bill #{bill.id.slice(0, 8).toUpperCase()}
            </h4>
            <div className='d-flex align-items-center gap-3'>
              <span className={`badge ${meta.badge} fs-7`}>{meta.label}</span>
              <button className='btn btn-icon btn-sm btn-active-icon-primary' onClick={onClose}>
                <KTIcon iconName='cross' className='fs-1' />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className='modal-body'>
            {/* Rejection alert for user */}
            {bill.payment_status === 'rejected' && (
              <div className='alert alert-danger d-flex align-items-start gap-3 mb-5'>
                <KTIcon iconName='cross-circle' className='fs-2 text-danger mt-1' />
                <div>
                  <div className='fw-bold'>ການຊຳລະຖືກປະຕິເສດ</div>
                  {bill.reject_reason && (
                    <div className='fs-7 mt-1'>{bill.reject_reason}</div>
                  )}
                  <div className='fs-7 text-muted mt-1'>
                    ກະລຸນາອັບໂຫຼດສະລິບໂອນເງິນທີ່ຖືກຕ້ອງອີກຄັ້ງ
                  </div>
                </div>
              </div>
            )}

            {/* Customer */}
            <div className='row g-4 mb-5'>
              <div className='col-12'>
                <div className='card bg-light'>
                  <div className='card-body py-4 px-5'>
                    <div className='fw-bold text-dark mb-3'>ລູກຄ້າ</div>
                    <div className='row'>
                      <div className='col-6'>
                        <span className='text-muted fs-7'>ຊື່</span>
                        <div className='fw-semibold'>{bill.user_name}</div>
                      </div>
                      <div className='col-6'>
                        <span className='text-muted fs-7'>ອີເມວ</span>
                        <div className='fw-semibold'>{bill.user_email}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className='card bg-light mb-4'>
              <div className='card-body py-4 px-5'>
                <div className='fw-bold text-primary mb-3'>ຂໍ້ມູນການຈອງ</div>
                <div className='row g-3'>
                  {[
                    ['ເຮືອ', bill.ship_name],
                    ['ວັນທີ', bill.booking_date],
                    ['ເວລາ', bill.booking_time],
                    ['ຈຳນວນຄົນ', `${bill.num_people} ຄົນ`],
                    ['ໄລຍະເວລາ', `${bill.num_hours} ຊົ່ວໂມງ`],
                    ['ອັດຕາ', fmt(bill.ship_price_per_hour) + '/ຊົ່ວໂມງ'],
                  ].map(([l, v]) => (
                    <div key={l} className='col-6'>
                      <span className='text-muted fs-7'>{l}</span>
                      <div className='fw-semibold'>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Food */}
            {bill.foods?.length > 0 && (
              <div className='card bg-light mb-4'>
                <div className='card-body py-4 px-5'>
                  <div className='fw-bold text-info mb-3'>ອາຫານ ແລະ ເຄື່ອງດື່ມ</div>
                  {bill.foods.map((f) => (
                    <div key={f.product_id} className='d-flex justify-content-between mb-1'>
                      <span>{f.name} × {f.quantity}</span>
                      <span>{fmt(f.price * f.quantity)}</span>
                    </div>
                  ))}
                  <div className='d-flex justify-content-between border-top pt-2 mt-2'>
                    <span className='text-muted'>ລວມຄ່າອາຫານ</span>
                    <span className='text-info fw-bold'>{fmt(bill.total_food_price)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Grand Total */}
            <div className='card border-primary mb-4'>
              <div className='card-body py-3 px-5 d-flex justify-content-between align-items-center'>
                <span className='fw-bolder fs-5'>ລວມທັງໝົດ</span>
                <span className='fw-bolder fs-3 text-primary'>{fmt(bill.grand_total)}</span>
              </div>
            </div>

            {canDownloadReceipt && (
              <div
                className='card mb-4 shadow-sm'
                style={{background: '#f6efdf', border: '1px solid #d8c3a5'}}
              >
                <div className='card-body p-0'>
                  <div
                    className='px-8 py-7'
                    style={{
                      background: 'linear-gradient(180deg, #fffaf0 0%, #fff7e8 100%)',
                      borderBottom: '1px dashed #d5c2a1',
                    }}
                  >
                    <div className='d-flex justify-content-between align-items-start flex-wrap gap-4'>
                      <div>
                        <div
                          className='text-uppercase fw-bold fs-7 mb-2'
                          style={{color: '#8a6d46', letterSpacing: '0.18em'}}
                        >
                          Official Bill
                        </div>
                        <h3 className='fw-bolder mb-1' style={{color: '#3f2e1f'}}>
                          Booking Receipt
                        </h3>
                        <div className='text-muted fs-7'>#{bill.id.slice(0, 8).toUpperCase()}</div>
                      </div>
                      <button
                        type='button'
                        className='btn btn-sm btn-dark'
                        onClick={handleDownloadReceipt}
                      >
                        <KTIcon iconName='file-down' className='fs-4 me-2' />
                        Download PNG
                      </button>
                    </div>
                  </div>

                  <div className='px-8 py-7' style={{background: '#fffaf0'}}>
                    <div className='row g-8 mb-7'>
                      <div className='col-md-6'>
                        <div className='text-muted fs-8 text-uppercase mb-2'>Customer</div>
                        <div className='fw-bold fs-5'>{bill.user_name}</div>
                        <div className='text-gray-600'>{bill.user_email}</div>
                      </div>
                      <div className='col-md-6'>
                        <div className='text-muted fs-8 text-uppercase mb-2'>Trip</div>
                        <div className='fw-bold fs-5'>{bill.ship_name}</div>
                        <div className='text-gray-600'>
                          {bill.booking_date} {bill.booking_time}
                        </div>
                      </div>
                    </div>

                    <div
                      className='separator separator-dashed mb-6'
                      style={{borderColor: '#d5c2a1'}}
                    ></div>

                    <div className='d-flex justify-content-between mb-3'>
                      <span className='text-muted'>Ship Charge</span>
                      <span className='fw-bold'>{fmt(bill.total_ship_price)}</span>
                    </div>

                    {bill.foods?.length > 0 && (
                      <>
                        {bill.foods.map((food) => (
                          <div
                            key={`${food.product_id}-${food.name}`}
                            className='d-flex justify-content-between align-items-center mb-3'
                          >
                            <div>
                              <div className='fw-semibold text-gray-900'>{food.name}</div>
                              <div className='text-muted fs-8'>Qty {food.quantity}</div>
                            </div>
                            <span className='fw-semibold'>{fmt(food.price * food.quantity)}</span>
                          </div>
                        ))}

                        <div className='d-flex justify-content-between mb-3'>
                          <span className='text-muted'>Food Total</span>
                          <span className='fw-bold text-info'>{fmt(bill.total_food_price)}</span>
                        </div>
                      </>
                    )}

                    <div
                      className='separator separator-dashed my-6'
                      style={{borderColor: '#d5c2a1'}}
                    ></div>

                    <div className='d-flex justify-content-between align-items-center'>
                      <div>
                        <div className='text-muted fs-8 text-uppercase mb-1'>Grand Total</div>
                        <div className='fw-bolder fs-2 text-primary'>{fmt(bill.grand_total)}</div>
                      </div>
                      <div className='text-end'>
                        <div className='text-muted fs-8 text-uppercase mb-1'>Payment</div>
                        <div className='fw-bold text-capitalize'>
                          {bill.payment_method === 'transfer' ? 'Transfer' : 'Cash'}
                        </div>
                        <span className={`badge ${meta.badge} mt-2`}>{meta.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className='card bg-light mb-4'>
              <div className='card-body py-4 px-5'>
                <div className='fw-bold mb-3'>ການຊຳລະ</div>
                <div className='d-flex justify-content-between mb-3'>
                  <span className='text-muted'>ວິທີ</span>
                  <span className='fw-semibold text-capitalize'>{bill.payment_method === 'transfer' ? 'ໂອນເງິນ' : 'ເງິນສົດ'}</span>
                </div>

                {/* Slip preview */}
                {bill.payment_method === 'transfer' && bill.slip_url && (
                  <div>
                    <div className='text-muted fs-7 mb-2'>ສະລິບໂອນເງິນ</div>
                    <a href={bill.slip_url} target='_blank' rel='noreferrer'>
                      <img
                        src={bill.slip_url}
                        alt='Slip'
                        className='rounded border'
                        style={{ maxWidth: 200, maxHeight: 280, objectFit: 'contain' }}
                      />
                    </a>
                  </div>
                )}

                {bill.payment_method === 'transfer' && !bill.slip_url && (
                  <div className='text-danger fs-7'>ຍັງບໍ່ໄດ້ອັບໂຫຼດສະລິບ</div>
                )}
              </div>
            </div>

            {/* ── Employee: reject reason + approve/reject ── */}
            {isEmployee &&
              (bill.payment_status === 'slip_submitted' ||
                bill.payment_status === 're_submitted') && (
              <div className='card border-warning mb-4'>
                <div className='card-body py-4 px-5'>
                  <div className='fw-bold mb-3'>ການຈັດການຂອງພະນັກງານ</div>
                  <div className='mb-3'>
                    <label className='fw-semibold fs-7 mb-1 d-block'>
                      ເຫດຜົນໃນການປະຕິເສດ <span className='text-muted'>(ຈຳເປັນເມື່ອປະຕິເສດ)</span>
                    </label>
                    <textarea
                      className='form-control form-control-solid'
                      rows={2}
                      placeholder='ຕົວຢ່າງ: ຈຳນວນເງິນບໍ່ຖືກ, ບັນຊີຜິດ...'
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                  <div className='d-flex gap-3'>
                    <button
                      className='btn btn-success flex-fill'
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <span className='spinner-border spinner-border-sm me-2' />
                      ) : (
                        <KTIcon iconName='check' className='fs-4 me-1' />
                      )}
                      ອະນຸມັດ
                    </button>
                    <button
                      className='btn btn-danger flex-fill'
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <span className='spinner-border spinner-border-sm me-2' />
                      ) : (
                        <KTIcon iconName='cross' className='fs-4 me-1' />
                      )}
                      ປະຕິເສດ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── User: re-upload slip after rejection ── */}
            {!isEmployee && bill.payment_status === 'rejected' && (
              <div className='card border-danger'>
                <div className='card-body py-4 px-5'>
                  <div className='fw-bold mb-3 text-danger'>
                    ອັບໂຫຼດສະລິບໂອນເງິນອີກຄັ້ງ
                  </div>
                  <input
                    type='file'
                    accept='image/*'
                    ref={reUploadRef}
                    className='d-none'
                    onChange={handleReUpload}
                    disabled={reUploadLoading}
                  />
                  <button
                    className='btn btn-light-danger w-100'
                    onClick={() => reUploadRef.current?.click()}
                    disabled={reUploadLoading}
                  >
                    {reUploadLoading ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2' />
                        ກຳລັງອັບໂຫຼດ...
                      </>
                    ) : (
                      <>
                        <KTIcon iconName='folder-up' className='fs-3 me-2' />
                        ອັບໂຫຼດສະລິບໃໝ່
                      </>
                    )}
                  </button>
                  <div className='text-muted fs-8 mt-2 text-center'>
                    JPG / PNG · max 5 MB
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='modal-footer'>
            <button className='btn btn-light' onClick={onClose}>
              ປິດ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main: BillManagement ─────────────────────────────────────────────────────

const BillManagement: FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  // ─── Load user ────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setCurrentUser(JSON.parse(raw) as CurrentUser)
    } catch {
      console.warn('Cannot parse user')
    }
  }, [])

  // ─── Fetch bills ──────────────────────────────────────────────────────────
  const fetchBills = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const isEmployee = currentUser.role !== 'user'
      const colRef = collection(db, 'bill')

      // User sees only their own bills; employee sees all
      const q = isEmployee
        ? query(colRef, orderBy('createdAt', 'desc'))
        : query(colRef, where('user_id', '==', currentUser._id), orderBy('createdAt', 'desc'))

      const snap = await getDocs(q)
      setBills(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bill)))
    } catch (e) {
      console.error(e)
      Swal.fire({ icon: 'error', title: 'ຜິດພາດ', text: 'ໂຫຼດບິນບໍ່ສຳເລັດ' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) fetchBills()
  }, [currentUser])

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filtered = bills.filter((b) => {
    const matchStatus = filterStatus === 'all' || b.payment_status === filterStatus
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      b.ship_name.toLowerCase().includes(q) ||
      b.user_name.toLowerCase().includes(q) ||
      b.user_email.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const isEmployee = currentUser?.role !== 'user'

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className='card'>
      {/* Header */}
      <div className='card-header border-0 pt-6'>
        <div className='card-title'>
          <h3 className='fw-bold'>
            {isEmployee ? 'ຈັດການບິນ' : 'ລາຍການຈອງຂອງຂ້ອຍ'}
          </h3>
        </div>

        {/* Filters */}
        <div className='card-toolbar d-flex gap-3 flex-wrap'>
          <input
            type='text'
            className='form-control form-control-solid w-200px'
            placeholder='ຄົ້ນຫາ...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className='form-select form-select-solid w-160px'
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'all')}
          >
            <option value='all'>ທຸກສະຖານະ</option>
            {(Object.keys(STATUS_META) as PaymentStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Body */}
      <div className='card-body py-4'>
        {loading ? (
          <div className='d-flex justify-content-center py-10'>
            <span className='spinner-border text-primary' />
          </div>
        ) : filtered.length === 0 ? (
          <div className='text-center text-muted py-12'>
            <KTIcon iconName='document' className='fs-2x mb-3' />
            <div>ບໍ່ພົບບິນ</div>
          </div>
        ) : (
          <div className='table-responsive'>
            <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
              <thead>
                <tr className='fw-bold text-muted fs-7 text-uppercase'>
                  <th>Bill ID</th>
                  {isEmployee && <th>ລູກຄ້າ</th>}
                  <th>ເຮືອ</th>
                  <th>ວັນທີ / ເວລາ</th>
                  <th>ລວມ</th>
                  <th>ວິທີ</th>
                  <th>ສະຖານະ</th>
                  <th className='text-end'>ຈັດການ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const meta = STATUS_META[b.payment_status] ?? STATUS_META.pending
                  return (
                    <tr key={b.id}>
                      <td>
                        <span className='text-muted fs-7'>
                          #{b.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      {isEmployee && (
                        <td>
                          <div className='fw-semibold'>{b.user_name}</div>
                          <div className='text-muted fs-8'>{b.user_email}</div>
                        </td>
                      )}
                      <td className='fw-semibold'>{b.ship_name}</td>
                      <td>
                        <div>{b.booking_date}</div>
                        <div className='text-muted fs-8'>{b.booking_time}</div>
                      </td>
                      <td className='fw-bold text-primary'>{fmt(b.grand_total)}</td>
                      <td>
                        <span className={`badge ${b.payment_method === 'transfer' ? 'badge-light-info' : 'badge-light-warning'}`}>
                          {b.payment_method}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${meta.badge}`}>
                          <KTIcon iconName={meta.icon} className='fs-8 me-1' />
                          {meta.label}
                        </span>
                        {/* Alert dot for items needing action */}
                        {isEmployee &&
                          (b.payment_status === 'slip_submitted' ||
                            b.payment_status === 're_submitted') && (
                          <span className='ms-2 badge badge-circle badge-warning w-10px h-10px' />
                        )}
                        {!isEmployee && b.payment_status === 'rejected' && (
                          <div className='text-danger fs-8 mt-1'>
                            ຕ້ອງດຳເນີນການ
                          </div>
                        )}
                      </td>
                      <td className='text-end'>
                        <button
                          className='btn btn-sm btn-light-primary'
                          onClick={() => setSelectedBill(b)}
                        >
                          ເບິ່ງ
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

      {/* Detail Modal */}
      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          role={currentUser?.role ?? 'user'}
          onClose={() => setSelectedBill(null)}
          onRefresh={fetchBills}
        />
      )}
    </div>
  )
}

export { BillManagement }
