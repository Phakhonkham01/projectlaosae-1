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
  pending:        { label: 'Pending',        badge: 'badge-light-warning', icon: 'time'         },
  slip_submitted: { label: 'Slip Submitted', badge: 'badge-light-info',    icon: 'document'     },
  approved:       { label: 'Approved',       badge: 'badge-light-success', icon: 'check-circle' },
  rejected:       { label: 'Rejected',       badge: 'badge-light-danger',  icon: 'cross-circle' },
  re_submitted:   { label: 'Re-Submitted',   badge: 'badge-light-primary', icon: 'arrows-circle'},
}

const fmt = (n: number) => n.toLocaleString() + ' LAK'

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

  const meta = STATUS_META[bill.payment_status] ?? STATUS_META.pending

  // Employee: approve bill
  const handleApprove = async () => {
    setActionLoading(true)
    try {
      await updateDoc(doc(db, 'bill', bill.id), { payment_status: 'approved' })
      await updateDoc(doc(db, 'history_booking', bill.id), { payment_status: 'approved' }).catch(() => {})
      Swal.fire({ icon: 'success', title: 'Approved!', timer: 1500, showConfirmButton: false })
      onRefresh()
      onClose()
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not approve.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Employee: reject bill
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({ icon: 'warning', title: 'Reason required', text: 'Please enter a rejection reason.' })
      return
    }
    setActionLoading(true)
    try {
      const update = { payment_status: 'rejected', reject_reason: rejectReason }
      await updateDoc(doc(db, 'bill', bill.id), update)
      await updateDoc(doc(db, 'history_booking', bill.id), update).catch(() => {})
      Swal.fire({ icon: 'info', title: 'Rejected', text: 'User will be notified to re-pay.', timer: 2000, showConfirmButton: false })
      onRefresh()
      onClose()
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not reject.' })
    } finally {
      setActionLoading(false)
    }
  }

  // User: re-upload slip after rejection
  const handleReUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'Image only', text: 'Please select an image file.' })
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
      Swal.fire({ icon: 'success', title: 'Slip Re-submitted!', text: 'Waiting for employee review.', timer: 2000, showConfirmButton: false })
      onRefresh()
      onClose()
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload failed', text: 'Please try again.' })
    } finally {
      setReUploadLoading(false)
      if (reUploadRef.current) reUploadRef.current.value = ''
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
                  <div className='fw-bold'>Payment Rejected</div>
                  {bill.reject_reason && (
                    <div className='fs-7 mt-1'>{bill.reject_reason}</div>
                  )}
                  <div className='fs-7 text-muted mt-1'>
                    Please re-upload a correct transfer slip below.
                  </div>
                </div>
              </div>
            )}

            {/* Customer */}
            <div className='row g-4 mb-5'>
              <div className='col-12'>
                <div className='card bg-light'>
                  <div className='card-body py-4 px-5'>
                    <div className='fw-bold text-dark mb-3'>👤 Customer</div>
                    <div className='row'>
                      <div className='col-6'>
                        <span className='text-muted fs-7'>Name</span>
                        <div className='fw-semibold'>{bill.user_name}</div>
                      </div>
                      <div className='col-6'>
                        <span className='text-muted fs-7'>Email</span>
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
                <div className='fw-bold text-primary mb-3'>🚢 Booking Info</div>
                <div className='row g-3'>
                  {[
                    ['Ship', bill.ship_name],
                    ['Date', bill.booking_date],
                    ['Time', bill.booking_time],
                    ['People', `${bill.num_people} person(s)`],
                    ['Duration', `${bill.num_hours} hr(s)`],
                    ['Rate', fmt(bill.ship_price_per_hour) + '/hr'],
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
                  <div className='fw-bold text-info mb-3'>🍽️ Food & Beverages</div>
                  {bill.foods.map((f) => (
                    <div key={f.product_id} className='d-flex justify-content-between mb-1'>
                      <span>{f.name} × {f.quantity}</span>
                      <span>{fmt(f.price * f.quantity)}</span>
                    </div>
                  ))}
                  <div className='d-flex justify-content-between border-top pt-2 mt-2'>
                    <span className='text-muted'>Food Total</span>
                    <span className='text-info fw-bold'>{fmt(bill.total_food_price)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Grand Total */}
            <div className='card border-primary mb-4'>
              <div className='card-body py-3 px-5 d-flex justify-content-between align-items-center'>
                <span className='fw-bolder fs-5'>Grand Total</span>
                <span className='fw-bolder fs-3 text-primary'>{fmt(bill.grand_total)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className='card bg-light mb-4'>
              <div className='card-body py-4 px-5'>
                <div className='fw-bold mb-3'>💳 Payment</div>
                <div className='d-flex justify-content-between mb-3'>
                  <span className='text-muted'>Method</span>
                  <span className='fw-semibold text-capitalize'>{bill.payment_method}</span>
                </div>

                {/* Slip preview */}
                {bill.payment_method === 'transfer' && bill.slip_url && (
                  <div>
                    <div className='text-muted fs-7 mb-2'>Transfer Slip</div>
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
                  <div className='text-danger fs-7'>No slip uploaded</div>
                )}
              </div>
            </div>

            {/* ── Employee: reject reason + approve/reject ── */}
            {isEmployee &&
              (bill.payment_status === 'slip_submitted' ||
                bill.payment_status === 're_submitted') && (
              <div className='card border-warning mb-4'>
                <div className='card-body py-4 px-5'>
                  <div className='fw-bold mb-3'>⚙️ Employee Action</div>
                  <div className='mb-3'>
                    <label className='fw-semibold fs-7 mb-1 d-block'>
                      Rejection Reason <span className='text-muted'>(required if rejecting)</span>
                    </label>
                    <textarea
                      className='form-control form-control-solid'
                      rows={2}
                      placeholder='e.g. Amount incorrect, wrong account...'
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
                      Approve
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
                      Reject
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
                    🔄 Re-upload Transfer Slip
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
                        Uploading...
                      </>
                    ) : (
                      <>
                        <KTIcon iconName='folder-up' className='fs-3 me-2' />
                        Upload New Slip
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
              Close
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
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load bills.' })
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
            {isEmployee ? '🗂 Bill Management' : '📋 My Bookings'}
          </h3>
        </div>

        {/* Filters */}
        <div className='card-toolbar d-flex gap-3 flex-wrap'>
          <input
            type='text'
            className='form-control form-control-solid w-200px'
            placeholder='Search...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className='form-select form-select-solid w-160px'
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'all')}
          >
            <option value='all'>All Statuses</option>
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
            <div>No bills found</div>
          </div>
        ) : (
          <div className='table-responsive'>
            <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
              <thead>
                <tr className='fw-bold text-muted fs-7 text-uppercase'>
                  <th>Bill ID</th>
                  {isEmployee && <th>Customer</th>}
                  <th>Ship</th>
                  <th>Date / Time</th>
                  <th>Total</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th className='text-end'>Action</th>
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
                            ⚠ Action needed
                          </div>
                        )}
                      </td>
                      <td className='text-end'>
                        <button
                          className='btn btn-sm btn-light-primary'
                          onClick={() => setSelectedBill(b)}
                        >
                          View
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