import {FC, useEffect, useRef, useState} from 'react'
import Swal from 'sweetalert2'
import {collection, doc, getDocs, orderBy, query, updateDoc, where} from 'firebase/firestore'
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage'
import {db, storage} from '../../../../../../../../firebase/useFirebase'
import {KTIcon} from '../../../../../../_metronic/helpers'

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
  | 'pending'
  | 'slip_submitted'
  | 'approved'
  | 'rejected'
  | 're_submitted'
  | 'payment failed'
  | 'under_review_again'

type DisplayPaymentStatus = Exclude<PaymentStatus, 'slip_submitted'>

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
  payment_method: 'cash' | 'cash+transfer' | 'bcel'
  slip_url: string
  payment_status: PaymentStatus
  user_id: string
  user_name: string
  user_email: string
  reject_reason?: string
  createdAt: string
}

const STATUS_META: Partial<
  Record<PaymentStatus, {label: string; badge: string; icon: string}>
> = {
  approved: {label: 'ອະນຸມັດແລ້ວ', badge: 'badge-light-success', icon: 'check-circle'},
  rejected: {label: 'ປະຕິເສດແລ້ວ', badge: 'badge-light-danger', icon: 'cross-circle'},
  re_submitted: {label: 'ສົ່ງກວດອີກຄັ້ງ', badge: 'badge-light-info', icon: 'time'},
}

const STATUS_META_FALLBACK = {label: '-', badge: 'badge-light', icon: 'minus'}

const DISPLAY_STATUS_OPTIONS: DisplayPaymentStatus[] = [
  'approved',
  'rejected',
  're_submitted',
]

const normalizePaymentStatus = (value?: string) => value?.toLowerCase().trim().replace(/[\s-]+/g, '_') ?? ''
const getDisplayPaymentStatus = (value?: string): DisplayPaymentStatus => {
  const normalized = normalizePaymentStatus(value)
  if (normalized === 'slip_submitted') return 'pending'
  if (normalized === 'payment_failed') return 'payment failed'
  return DISPLAY_STATUS_OPTIONS.includes(normalized as DisplayPaymentStatus)
    ? (normalized as DisplayPaymentStatus)
    : 'pending'
}

const fmt = (n: number) => n.toLocaleString() + ' LAK'
const formatDateDMY = (value?: string) => {
  if (!value) return '-'
  const [y, m, d] = value.split('T')[0].split('-')
  return y && m && d ? `${d}/${m}/${y}` : value
}
const paymentMethodLabels: Record<string, string> = {
  cash: 'ເງິນສົດ',
  transfer: 'ໂອນເງິນ',
  'cash+transfer': 'ເງິນສົດ + ໂອນ',
  bcel: 'BCEL QR',
}
const getPaymentMethodLabel = (method?: string) => paymentMethodLabels[method || ''] || method || '-'

const BillDetailModal: FC<{
  bill: Bill
  role: string
  onClose: () => void
  onRefresh: () => void
}> = ({bill, role, onClose, onRefresh}) => {
  const isEmployee = role !== 'user'
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [reUploadLoading, setReUploadLoading] = useState(false)
  const reUploadRef = useRef<HTMLInputElement>(null)

  const meta = STATUS_META[getDisplayPaymentStatus(bill.payment_status)] ?? STATUS_META_FALLBACK

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      await updateDoc(doc(db, 'bill', bill.id), {payment_status: 'approved'})
      await updateDoc(doc(db, 'history_booking', bill.id), {payment_status: 'approved'}).catch(() => {})
      Swal.fire({icon: 'success', title: 'ອະນຸມັດແລ້ວ!', timer: 1500, showConfirmButton: false})
      onRefresh()
      onClose()
    } catch (e) {
      Swal.fire({icon: 'error', title: 'ບໍ່ສຳເລັດ', text: 'ບໍ່ສາມາດອະນຸມັດໄດ້'})
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({icon: 'warning', title: 'ຈຳເປັນຕ້ອງໃສ່ເຫດຜົນ', text: 'ກະລຸນາໃສ່ເຫດຜົນການປະຕິເສດ'})
      return
    }
    setActionLoading(true)
    try {
      const update = {payment_status: 'rejected', reject_reason: rejectReason}
      await updateDoc(doc(db, 'bill', bill.id), update)
      await updateDoc(doc(db, 'history_booking', bill.id), update).catch(() => {})
      Swal.fire({
        icon: 'info',
        title: 'ປະຕິເສດແລ້ວ',
        text: 'ລະບົບຈະແຈ້ງໃຫ້ຜູ້ໃຊ້ຊຳລະໃໝ່',
        timer: 2000,
        showConfirmButton: false,
      })
      onRefresh()
      onClose()
    } catch (e) {
      Swal.fire({icon: 'error', title: 'ບໍ່ສຳເລັດ', text: 'ບໍ່ສາມາດປະຕິເສດໄດ້'})
    } finally {
      setActionLoading(false)
    }
  }

  const handleReUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      Swal.fire({icon: 'error', title: 'ຮັບສະເພາະຮູບພາບ', text: 'ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ'})
      return
    }
    setReUploadLoading(true)
    try {
      const storageRef = ref(storage, `slips/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      const update = {slip_url: url, payment_status: 'under_review_again', reject_reason: ''}
      await updateDoc(doc(db, 'bill', bill.id), update)
      await updateDoc(doc(db, 'history_booking', bill.id), update).catch(() => {})
      Swal.fire({
        icon: 'success',
        title: 'ສົ່ງສະລິບໃໝ່ແລ້ວ!',
        text: 'ກຳລັງລໍຖ້າພະນັກງານກວດສອບ',
        timer: 2000,
        showConfirmButton: false,
      })
      onRefresh()
      onClose()
    } catch (err) {
      Swal.fire({icon: 'error', title: 'ອັບໂຫລດບໍ່ສຳເລັດ', text: 'ກະລຸນາລອງອີກຄັ້ງ'})
    } finally {
      setReUploadLoading(false)
      if (reUploadRef.current) reUploadRef.current.value = ''
    }
  }

  return (
    <div className='modal fade show d-block' style={{background: 'rgba(0,0,0,0.5)', zIndex: 1060}}>
      <div className='modal-dialog modal-lg modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h4 className='modal-title fw-bold'>ບິນ #{bill.id.slice(0, 8).toUpperCase()}</h4>
            <div className='d-flex align-items-center gap-3'>
              <span className={`badge ${meta.badge} fs-7`}>{meta.label}</span>
              <button className='btn btn-icon btn-sm btn-active-icon-primary' onClick={onClose}>
                <KTIcon iconName='cross' className='fs-1' />
              </button>
            </div>
          </div>

          <div className='modal-body'>
            {bill.payment_status === 'rejected' && (
              <div className='alert alert-danger d-flex align-items-start gap-3 mb-5'>
                <KTIcon iconName='cross-circle' className='fs-2 text-danger mt-1' />
                <div>
                  <div className='fw-bold'>ການຊຳລະຖືກປະຕິເສດ</div>
                  {bill.reject_reason && <div className='fs-7 mt-1'>{bill.reject_reason}</div>}
                  <div className='fs-7 text-muted mt-1'>ກະລຸນາອັບໂຫລດສະລິບໂອນເງິນທີ່ຖືກຕ້ອງອີກຄັ້ງ</div>
                </div>
              </div>
            )}

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

            <div className='card bg-light mb-4'>
              <div className='card-body py-4 px-5'>
                <div className='fw-bold text-primary mb-3'>ຂໍ້ມູນການຈອງ</div>
                <div className='row g-3'>
                  {[
                    ['ເຮືອ', bill.ship_name],
                    ['ວັນທີ', formatDateDMY(bill.booking_date)],
                    ['ເວລາ', bill.booking_time],
                    ['ຈຳນວນຄົນ', `${bill.num_people} ຄົນ`],
                    ['ໄລຍະເວລາ', `${bill.num_hours} ຊົ່ວໂມງ`],
                    ['ອັດຕາ', `${fmt(bill.ship_price_per_hour)}/ຊົ່ວໂມງ`],
                  ].map(([label, value]) => (
                    <div key={label} className='col-6'>
                      <span className='text-muted fs-7'>{label}</span>
                      <div className='fw-semibold'>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {bill.foods?.length > 0 && (
              <div className='card bg-light mb-4'>
                <div className='card-body py-4 px-5'>
                  <div className='fw-bold text-info mb-3'>ອາຫານ ແລະ ເຄື່ອງດື່ມ</div>
                  {bill.foods.map((f) => (
                    <div key={f.product_id} className='d-flex justify-content-between mb-1'>
                      <span>{f.name} x {f.quantity}</span>
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

            <div className='card border-primary mb-4'>
              <div className='card-body py-3 px-5 d-flex justify-content-between align-items-center'>
                <span className='fw-bolder fs-5'>ລວມທັງໝົດ</span>
                <span className='fw-bolder fs-3 text-primary'>{fmt(bill.grand_total)}</span>
              </div>
            </div>

            <div className='card bg-light mb-4'>
              <div className='card-body py-4 px-5'>
                <div className='fw-bold mb-3'>ການຊຳລະ</div>
                <div className='d-flex justify-content-between mb-3'>
                  <span className='text-muted'>ວິທີ</span>
                  <span className='fw-semibold text-capitalize'>
                    {getPaymentMethodLabel(bill.payment_method)}
                  </span>
                </div>

              </div>
            </div>

            {isEmployee &&
              ['payment failed', 'under_review_again'].includes(bill.payment_status) && (
                <div className='card border-warning mb-4'>
                  <div className='card-body py-4 px-5'>
                    <div className='fw-bold mb-3'>ການດຳເນີນການຂອງພະນັກງານ</div>
                    <div className='mb-3'>
                      <label className='fw-semibold fs-7 mb-1 d-block'>
                        ເຫດຜົນການປະຕິເສດ <span className='text-muted'>(ຈຳເປັນເມື່ອປະຕິເສດ)</span>
                      </label>
                      <textarea
                        className='form-control form-control-solid'
                        rows={2}
                        placeholder='ຕົວຢ່າງ: ຈຳນວນເງິນບໍ່ຖືກ, ບັນຊີບໍ່ຖືກ...'
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                    <div className='d-flex gap-3'>
                      <button className='btn btn-success flex-fill' onClick={handleApprove} disabled={actionLoading}>
                        {actionLoading ? (
                          <span className='spinner-border spinner-border-sm me-2' />
                        ) : (
                          <KTIcon iconName='check' className='fs-4 me-1' />
                        )}
                        ອະນຸມັດ
                      </button>
                      <button className='btn btn-danger flex-fill' onClick={handleReject} disabled={actionLoading}>
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

            {!isEmployee && ['payment failed', 'rejected'].includes(bill.payment_status) && (
              <div className='card border-danger'>
                <div className='card-body py-4 px-5'>
                  <div className='fw-bold mb-3 text-danger'>ອັບໂຫລດສະລິບໂອນເງິນໃໝ່</div>
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
                        ກຳລັງອັບໂຫລດ...
                      </>
                    ) : (
                      <>
                        <KTIcon iconName='folder-up' className='fs-3 me-2' />
                        ອັບໂຫລດສະລິບໃໝ່
                      </>
                    )}
                  </button>
                  <div className='text-muted fs-8 mt-2 text-center'>JPG / PNG · ສູງສຸດ 5 MB</div>
                </div>
              </div>
            )}
          </div>

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

const BillManagement: FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [filterStatus, setFilterStatus] = useState<DisplayPaymentStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setCurrentUser(JSON.parse(raw) as CurrentUser)
    } catch {
      console.warn('Cannot parse user')
    }
  }, [])

  const fetchBills = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const isEmployee = currentUser.role !== 'user'
      const colRef = collection(db, 'bill')

      const q = isEmployee
        ? query(colRef, orderBy('createdAt', 'desc'))
        : query(colRef, where('user_id', '==', currentUser._id), orderBy('createdAt', 'desc'))

      const snap = await getDocs(q)
      setBills(snap.docs.map((d) => ({id: d.id, ...d.data()} as Bill)))
    } catch (e) {
      console.error(e)
      Swal.fire({icon: 'error', title: 'ຂໍ້ຜິດພາດ', text: 'ໂຫລດຂໍ້ມູນບິນບໍ່ສຳເລັດ'})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) fetchBills()
  }, [currentUser])

  const filtered = bills.filter((b) => {
    const matchStatus = filterStatus === 'all' || getDisplayPaymentStatus(b.payment_status) === filterStatus
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

  return (
    <div className='card'>
      <div className='card-header border-0 pt-6'>
        <div className='card-title'>
          <h3 className='fw-bold'>{isEmployee ? 'ຈັດການບິນ' : 'ການຈອງຂອງຂ້ອຍ'}</h3>
        </div>

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
            onChange={(e) => setFilterStatus(e.target.value as DisplayPaymentStatus | 'all')}
          >
            <option value='all'>ທຸກສະຖານະ</option>
            {DISPLAY_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s]?.label ?? s}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                  <th>ລະຫັດບິນ</th>
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
                  const meta = STATUS_META[getDisplayPaymentStatus(b.payment_status)] ?? STATUS_META_FALLBACK
                  return (
                    <tr key={b.id}>
                      <td>
                        <span className='text-muted fs-7'>#{b.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      {isEmployee && (
                        <td>
                          <div className='fw-semibold'>{b.user_name}</div>
                          <div className='text-muted fs-8'>{b.user_email}</div>
                        </td>
                      )}
                      <td className='fw-semibold'>{b.ship_name}</td>
                      <td>
                        <div>{formatDateDMY(b.booking_date)}</div>
                        <div className='text-muted fs-8'>{b.booking_time}</div>
                      </td>
                      <td className='fw-bold text-primary'>{fmt(b.grand_total)}</td>
                      <td>
                        <span
                          className={`badge ${b.payment_method === 'bcel' ? 'badge-light-info' : 'badge-light-warning'}`}
                        >
                          {getPaymentMethodLabel(b.payment_method)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${meta.badge}`}>
                          <KTIcon iconName={meta.icon} className='fs-8 me-1' />
                          {meta.label}
                        </span>
                        {isEmployee &&
                          ['payment failed', 'under_review_again'].includes(b.payment_status) && (
                            <span className='ms-2 badge badge-circle badge-warning w-10px h-10px' />
                          )}
                        {!isEmployee && ['payment failed', 'rejected'].includes(b.payment_status) && (
                          <div className='text-danger fs-8 mt-1'>ຕ້ອງດຳເນີນການ</div>
                        )}
                      </td>
                      <td className='text-end'>
                        <button className='btn btn-sm btn-light-primary' onClick={() => setSelectedBill(b)}>
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

export {BillManagement}
