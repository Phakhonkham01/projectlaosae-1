import { FC, useState, useEffect, useRef } from 'react'
import { useListView } from '../core/ListViewProvider'
import { useQueryResponse } from '../core/QueryResponseProvider'
import { ShipData } from '../core/ship_models'
import { KTIcon } from '../../../../../../_metronic/helpers'
import Swal from 'sweetalert2'
import { collection, addDoc, doc, getDoc, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../../../../../../../firebase/useFirebase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CurrentUser {
  _id: string
  user_name: string
  user_email: string
  role: string
}

interface Product {
  product_id: string
  name: string
  price: number
  image: string
  availability: boolean
  category_id: string
}

interface SelectedFood {
  product_id: string
  name: string
  price: number
  quantity: number
  image: string
}

// ─── Step Labels ──────────────────────────────────────────────────────────────

const STEPS = ['Booking Details', 'Select Food', 'Summary', 'Payment']

// ─── Component ────────────────────────────────────────────────────────────────

const BookingShipEditModalForm: FC = () => {
  const { itemIdForUpdate, setItemIdForUpdate } = useListView()
  const { refetch } = useQueryResponse()

  const [currentStep, setCurrentStep] = useState(1)
  const [shipData, setShipData] = useState<ShipData | null>(null)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  // ─── Load user from localStorage ──────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setCurrentUser(JSON.parse(raw) as CurrentUser)
    } catch {
      console.warn('Could not parse user from localStorage')
    }
  }, [])

  // Step 1 state
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [numPeople, setNumPeople] = useState(1)
  const [numHours, setNumHours] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Step 2 state
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])

  // Step 4 state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')
  const [slipUrl, setSlipUrl] = useState('')
  const [slipUploading, setSlipUploading] = useState(false)
  const slipInputRef = useRef<HTMLInputElement>(null)

  // ─── Load ship data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!itemIdForUpdate) return
    setLoading(true)
    getDoc(doc(db, 'ship', itemIdForUpdate))
      .then((snap) => {
        if (snap.exists()) {
          const raw = snap.data() as Record<string, any>
          setShipData({
            ...(raw as ShipData),
            id: snap.id,
            // ຮອງຮັບທັງຊື່ field ໃໝ່ (create-ships) ແລະ ຊື່ເກົ່າ
            name: raw.name ?? raw.ship_name ?? '',
            ship_name: raw.ship_name ?? raw.name ?? '',
            price: raw.price ?? raw.pricePerHour ?? 0,
            image_url: raw.image_url ?? raw.imageUrl ?? '',
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [itemIdForUpdate])

  // ─── Load products ─────────────────────────────────────────────────────────
  useEffect(() => {
    getDocs(collection(db, 'products'))
      .then((snap) => {
        const data = snap.docs.map((d) => {
          const raw = d.data() as Record<string, any>
          return {
            product_id: d.id,
            name: raw.name,
            price: raw.price,
            // ຮອງຮັບທັງຊື່ field ໃໝ່ (addFood) ແລະ ຊື່ເກົ່າ
            image: raw.imageUrl ?? raw.image ?? '',
            availability: raw.available ?? raw.availability ?? false,
            category_id: raw.categoryId ?? raw.category_id ?? '',
          } as Product
        })
        setProducts(data.filter((p) => p.availability))
      })
      .catch(console.error)
  }, [])

  // ─── Computed totals ───────────────────────────────────────────────────────
  const shipPricePerHour = shipData?.price ?? 0
  const totalShipPrice = numHours * shipPricePerHour
  const totalFoodPrice = selectedFoods.reduce((sum, f) => sum + f.price * f.quantity, 0)
  const grandTotal = totalShipPrice + totalFoodPrice

  // ─── Upload transfer slip ──────────────────────────────────────────────────
  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'Error!', text: 'Please upload an image file' })
      return
    }
    setSlipUploading(true)
    try {
      const storageRef = ref(storage, `slips/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setSlipUrl(url)
      Swal.fire({ icon: 'success', title: 'Slip uploaded!', timer: 1200, showConfirmButton: false })
    } catch (err) {
      console.error(err)
      Swal.fire({ icon: 'error', title: 'Upload failed', text: 'Please try again' })
    } finally {
      setSlipUploading(false)
      if (slipInputRef.current) slipInputRef.current.value = ''
    }
  }

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {}
    if (!bookingDate) errs.date = 'Please select a date'
    if (!bookingTime) errs.time = 'Please select a time'
    if (numPeople < 1) errs.people = 'At least 1 person required'
    if (shipData && numPeople > shipData.capacity)
      errs.people = `Exceeds ship capacity (max ${shipData.capacity})`
    if (numHours < 1) errs.hours = 'At least 1 hour required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ─── Food handlers ─────────────────────────────────────────────────────────
  const getFoodQty = (product_id: string) =>
    selectedFoods.find((f) => f.product_id === product_id)?.quantity ?? 0

  const handleFoodQuantity = (product: Product, qty: number) => {
    if (qty === 0) {
      setSelectedFoods((prev) => prev.filter((f) => f.product_id !== product.product_id))
    } else {
      setSelectedFoods((prev) => {
        const exists = prev.find((f) => f.product_id === product.product_id)
        if (exists)
          return prev.map((f) =>
            f.product_id === product.product_id ? { ...f, quantity: qty } : f
          )
        return [
          ...prev,
          {
            product_id: product.product_id,
            name: product.name,
            price: product.price,
            quantity: qty,
            image: product.image,
          },
        ]
      })
    }
  }

  // ─── Navigation ───────────────────────────────────────────────────────────
  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 4 && paymentMethod === 'transfer' && !slipUrl) {
      Swal.fire({ icon: 'warning', title: 'No slip uploaded', text: 'Please upload your transfer slip before confirming.' })
      return
    }
    setCurrentStep((s) => s + 1)
  }

  const prevStep = () => setCurrentStep((s) => s - 1)

  // ─── Save booking ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true)
    try {
      const bookingPayload = {
        ship_id: itemIdForUpdate,
        ship_name: shipData?.ship_name ?? '',
        booking_date: bookingDate,
        booking_time: bookingTime,
        num_people: numPeople,
        num_hours: numHours,
        ship_price_per_hour: shipPricePerHour,
        total_ship_price: totalShipPrice,
        foods: selectedFoods,
        total_food_price: totalFoodPrice,
        grand_total: grandTotal,
        payment_method: paymentMethod,
        slip_url: paymentMethod === 'transfer' ? slipUrl : '',
        payment_status: paymentMethod === 'cash' ? 'pending' : 'slip_submitted',
        // ─── Customer info ───
        user_id: currentUser?._id ?? '',
        user_name: currentUser?.user_name ?? '',
        user_email: currentUser?.user_email ?? '',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      const bookingRef = await addDoc(collection(db, 'booking'), bookingPayload)

      // payment: ສ້າງ 1 doc ຕໍ່ 1 booking ຕອນສ້າງ booking
      await addDoc(collection(db, 'payment'), {
        bookingId: bookingRef.id,
        userId: bookingPayload.user_id,
        Amount: bookingPayload.grand_total,
        Date: bookingPayload.createdAt,
      })

      Swal.fire({
        icon: 'success',
        title: 'Booking Confirmed!',
        text: 'Your booking has been saved successfully.',
        timer: 2000,
        showConfirmButton: false,
      })
      refetch()
      setItemIdForUpdate(undefined)
    } catch (error) {
      console.error('Save error:', error)
      Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to save booking.' })
    } finally {
      setLoading(false)
    }
  }

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (loading && !shipData) {
    return (
      <div className='modal-content'>
        <div className='modal-body d-flex justify-content-center align-items-center py-15'>
          <span className='spinner-border text-primary' />
        </div>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className='modal-content'>
      {/* ── Header ── */}
      <div className='modal-header'>
        <h2 className='fw-bold'>
          Booking —{' '}
          <span className='text-primary'>{shipData?.ship_name}</span>
        </h2>
        <div
          className='btn btn-icon btn-sm btn-active-icon-primary'
          onClick={() => setItemIdForUpdate(undefined)}
          style={{ cursor: 'pointer' }}
        >
          <KTIcon iconName='cross' className='fs-1' />
        </div>
      </div>

      {/* ── Step Indicator ── */}
      <div className='px-10 pt-7 pb-2'>
        <div className='d-flex justify-content-between mb-2'>
          {STEPS.map((label, i) => {
            const stepNum = i + 1
            const done = currentStep > stepNum
            const active = currentStep === stepNum
            return (
              <div
                key={i}
                className='d-flex flex-column align-items-center'
                style={{ flex: 1 }}
              >
                <div
                  className={`w-35px h-35px rounded-circle d-flex align-items-center justify-content-center fw-bold fs-6 ${
                    done
                      ? 'bg-success text-white'
                      : active
                      ? 'bg-primary text-white'
                      : 'bg-light text-muted'
                  }`}
                >
                  {done ? '✓' : stepNum}
                </div>
                <span
                  className={`fs-8 mt-1 text-center ${
                    active ? 'text-primary fw-bold' : done ? 'text-success' : 'text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
        {/* Progress bar */}
        <div className='h-4px bg-light rounded overflow-hidden mb-2'>
          <div
            className='h-100 bg-primary rounded'
            style={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              transition: 'width 0.35s ease',
            }}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className='modal-body scroll-y mx-5 mx-xl-12 my-4' style={{ maxHeight: '60vh' }}>

        {/* ────────── STEP 1: Booking Details ────────── */}
        {currentStep === 1 && (
          <div>
            {/* Customer info banner */}
            <div className='d-flex align-items-center p-3 rounded bg-light mb-4 border-start border-4 border-primary'>
              <div
                className='w-40px h-40px rounded-circle bg-primary d-flex align-items-center
                  justify-content-center text-white fw-bolder fs-5 me-3 flex-shrink-0'
              >
                {currentUser?.user_name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div className='flex-grow-1'>
                <div className='fw-bold fs-6 lh-1 mb-1'>
                  {currentUser?.user_name ?? <span className='text-muted'>Unknown</span>}
                </div>
                <div className='text-muted fs-8'>{currentUser?.user_email ?? '-'}</div>
              </div>
              <span className='badge badge-light-primary fs-9'>
                {currentUser?.role ?? '-'}
              </span>
            </div>

            {/* Ship info banner */}
            <div className='d-flex align-items-center p-4 rounded bg-light-primary mb-6'>
              {shipData?.image_url && (
                <img
                  src={shipData.image_url}
                  alt={shipData.ship_name}
                  className='rounded me-4'
                  style={{ width: 60, height: 60, objectFit: 'cover' }}
                />
              )}
              <div>
                <div className='fw-bolder fs-5'>{shipData?.ship_name}</div>
                <div className='text-muted fs-7'>
                  Capacity: <strong>{shipData?.capacity}</strong> people &nbsp;·&nbsp;{' '}
                  <strong>{shipData?.price?.toLocaleString()} LAK</strong> / hr
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className='row mb-5'>
              <div className='col-6'>
                <label className='required fw-bold fs-6 mb-2'>Date</label>
                <input
                  type='date'
                  className={`form-control form-control-solid ${errors.date ? 'is-invalid' : ''}`}
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setBookingDate(e.target.value)
                    setErrors((p) => {
                      const n = { ...p }
                      delete n.date
                      return n
                    })
                  }}
                />
                {errors.date && (
                  <div className='invalid-feedback d-block'>{errors.date}</div>
                )}
              </div>
              <div className='col-6'>
                <label className='required fw-bold fs-6 mb-2'>Time</label>
                <input
                  type='time'
                  className={`form-control form-control-solid ${errors.time ? 'is-invalid' : ''}`}
                  value={bookingTime}
                  onChange={(e) => {
                    setBookingTime(e.target.value)
                    setErrors((p) => {
                      const n = { ...p }
                      delete n.time
                      return n
                    })
                  }}
                />
                {errors.time && (
                  <div className='invalid-feedback d-block'>{errors.time}</div>
                )}
              </div>
            </div>

            {/* Number of People */}
            <div className='mb-5'>
              <label className='required fw-bold fs-6 mb-2'>
                Number of People{' '}
                <span className='text-muted fw-normal'>(max {shipData?.capacity})</span>
              </label>
              <input
                type='number'
                className={`form-control form-control-solid ${errors.people ? 'is-invalid' : ''}`}
                value={numPeople}
                min={1}
                max={shipData?.capacity}
                onChange={(e) => {
                  setNumPeople(parseInt(e.target.value) || 1)
                  setErrors((p) => {
                    const n = { ...p }
                    delete n.people
                    return n
                  })
                }}
              />
              {errors.people && (
                <div className='invalid-feedback d-block'>{errors.people}</div>
              )}
            </div>

            {/* Duration */}
            <div className='mb-6'>
              <label className='required fw-bold fs-6 mb-3'>Duration (Hours)</label>
              <div className='d-flex flex-wrap gap-2'>
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((h) => (
                  <button
                    key={h}
                    type='button'
                    className={`btn btn-sm ${numHours === h ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setNumHours(h)}
                  >
                    {h} hr{h > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
              {errors.hours && (
                <div className='text-danger fs-7 mt-2'>{errors.hours}</div>
              )}
            </div>

            {/* Price preview */}
            <div className='p-4 rounded bg-light-success'>
              <div className='d-flex justify-content-between'>
                <span className='fw-semibold'>Ship Rental Cost</span>
                <span className='fw-bolder text-success fs-5'>
                  {totalShipPrice.toLocaleString()} LAK
                </span>
              </div>
              <div className='text-muted fs-8 mt-1'>
                {numHours} hr{numHours > 1 ? 's' : ''} ×{' '}
                {shipPricePerHour.toLocaleString()} LAK/hr
              </div>
            </div>
          </div>
        )}

        {/* ────────── STEP 2: Select Food ────────── */}
        {currentStep === 2 && (
          <div>
            <div className='fw-bold fs-5 mb-4'>Select Food &amp; Beverages</div>

            {products.length === 0 ? (
              <div className='text-center text-muted py-12'>
                <i className='bi bi-basket2 fs-2x mb-3 d-block' />
                No products available
              </div>
            ) : (
              <div className='row g-3'>
                {products.map((product) => {
                  const qty = getFoodQty(product.product_id)
                  return (
                    <div key={product.product_id} className='col-6 col-xl-4'>
                      <div
                        className={`card h-100 ${
                          qty > 0 ? 'border border-primary' : ''
                        }`}
                      >
                        <div className='card-body p-3 d-flex flex-column'>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className='rounded mb-2 w-100'
                              style={{ height: 75, objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className='rounded mb-2 bg-light d-flex align-items-center justify-content-center'
                              style={{ height: 75 }}
                            >
                              <i className='bi bi-image text-muted fs-3' />
                            </div>
                          )}
                          <div className='fw-bold fs-7 mb-1 flex-grow-1'>
                            {product.name}
                          </div>
                          <div className='text-primary fw-semibold fs-8 mb-2'>
                            {product.price.toLocaleString()} LAK
                          </div>
                          {/* Qty counter */}
                          <div className='d-flex align-items-center justify-content-between'>
                            <button
                              type='button'
                              className='btn btn-sm btn-icon btn-light-danger w-25px h-25px'
                              onClick={() =>
                                handleFoodQuantity(product, Math.max(0, qty - 1))
                              }
                              disabled={qty === 0}
                            >
                              −
                            </button>
                            <span className='fw-bolder mx-2'>{qty}</span>
                            <button
                              type='button'
                              className='btn btn-sm btn-icon btn-light-primary w-25px h-25px'
                              onClick={() => handleFoodQuantity(product, qty + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Food sub-total */}
            {selectedFoods.length > 0 && (
              <div className='mt-5 p-4 rounded bg-light-info'>
                <div className='fw-bold mb-2'>
                  Selected:{' '}
                  <span className='text-info'>
                    {selectedFoods.reduce((s, f) => s + f.quantity, 0)} item(s)
                  </span>
                </div>
                <div className='d-flex justify-content-between'>
                  <span className='text-muted'>Food Total</span>
                  <span className='fw-bolder text-info'>
                    {totalFoodPrice.toLocaleString()} LAK
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ────────── STEP 3: Summary ────────── */}
        {currentStep === 3 && (
          <div>
            <div className='fw-bold fs-5 mb-5'>Booking Summary</div>

            {/* Customer info */}
            <div className='card bg-light mb-4'>
              <div className='card-body py-4 px-5'>
                <div className='fw-bold text-dark mb-3'>👤 Booked By</div>
                <div className='d-flex justify-content-between mb-2'>
                  <span className='text-muted'>Name</span>
                  <span className='fw-semibold'>{currentUser?.user_name ?? '-'}</span>
                </div>
                <div className='d-flex justify-content-between'>
                  <span className='text-muted'>Email</span>
                  <span className='fw-semibold'>{currentUser?.user_email ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* Ship details */}
            <div className='card bg-light mb-4'>
              <div className='card-body py-4 px-5'>
                <div className='fw-bold text-primary mb-3'>🚢 Ship Details</div>
                {(
                  [
                    ['Ship', shipData?.ship_name],
                    ['Date', bookingDate],
                    ['Time', bookingTime],
                    ['People', `${numPeople} person(s)`],
                    ['Duration', `${numHours} hr${numHours > 1 ? 's' : ''}`],
                  ] as [string, string | undefined][]
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className='d-flex justify-content-between mb-2'
                  >
                    <span className='text-muted'>{label}</span>
                    <span className='fw-semibold'>{value}</span>
                  </div>
                ))}
                <div className='d-flex justify-content-between border-top pt-2 mt-2'>
                  <span className='text-muted'>Ship Cost</span>
                  <span className='text-success fw-bolder'>
                    {totalShipPrice.toLocaleString()} LAK
                  </span>
                </div>
              </div>
            </div>

            {/* Food details */}
            {selectedFoods.length > 0 && (
              <div className='card bg-light mb-4'>
                <div className='card-body py-4 px-5'>
                  <div className='fw-bold text-info mb-3'>
                    🍽️ Food &amp; Beverages
                  </div>
                  {selectedFoods.map((f) => (
                    <div
                      key={f.product_id}
                      className='d-flex justify-content-between mb-2'
                    >
                      <span>
                        {f.name} × {f.quantity}
                      </span>
                      <span>{(f.price * f.quantity).toLocaleString()} LAK</span>
                    </div>
                  ))}
                  <div className='d-flex justify-content-between border-top pt-2 mt-2'>
                    <span className='text-muted'>Food Total</span>
                    <span className='text-info fw-bolder'>
                      {totalFoodPrice.toLocaleString()} LAK
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Grand total */}
            <div className='card border-primary'>
              <div className='card-body py-4 px-5'>
                <div className='d-flex justify-content-between align-items-center'>
                  <span className='fw-bolder fs-5'>Grand Total</span>
                  <span className='fw-bolder fs-3 text-primary'>
                    {grandTotal.toLocaleString()} LAK
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────── STEP 4: Payment ────────── */}
        {currentStep === 4 && (
          <div>
            <div className='fw-bold fs-5 mb-5'>Payment Method</div>

            {/* Method selector */}
            <div className='d-flex gap-3 mb-6'>
              {(['cash', 'transfer'] as const).map((method) => (
                <div
                  key={method}
                  className={`card flex-fill text-center p-5 border-2 ${
                    paymentMethod === method
                      ? 'border-primary bg-light-primary'
                      : 'border-light'
                  }`}
                  onClick={() => setPaymentMethod(method)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className='fs-1 mb-2'>
                    {method === 'cash' ? '💵' : '📱'}
                  </div>
                  <div className='fw-bold'>
                    {method === 'cash' ? 'Cash' : 'Transfer'}
                  </div>
                </div>
              ))}
            </div>

            {/* Cash */}
            {paymentMethod === 'cash' && (
              <div className='p-5 rounded bg-light-warning text-center'>
                <div className='fs-2 mb-2'>💵</div>
                <div className='fw-bold fs-5'>Pay at the counter</div>
                <div className='text-muted fs-7 mt-1'>
                  Amount due:{' '}
                  <strong className='text-warning'>
                    {grandTotal.toLocaleString()} LAK
                  </strong>
                </div>
              </div>
            )}

            {/* Transfer + QR + Slip Upload */}
            {paymentMethod === 'transfer' && (
              <div>
                {/* QR Code */}
                <div className='text-center mb-6'>
                  <div className='fw-bold fs-6 mb-3'>
                    Step 1 — Scan QR Code to Pay
                  </div>
                  {/* ── Replace src with your actual QR image path ── */}
                  <div
                    className='d-inline-flex align-items-center justify-content-center
                      border border-2 border-dashed border-primary rounded p-4'
                    style={{ minWidth: 200, minHeight: 200 }}
                  >
                    <img
                      src='/path/to/your/qr-code.png'
                      alt='QR Code'
                      style={{ maxWidth: 170, maxHeight: 170 }}
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        el.style.display = 'none'
                        el.parentElement!.innerHTML =
                          '<span class="text-muted fs-7">Place your QR<br/>image here</span>'
                      }}
                    />
                  </div>
                  <div className='text-muted fs-7 mt-2'>
                    Amount:{' '}
                    <strong className='text-primary'>
                      {grandTotal.toLocaleString()} LAK
                    </strong>
                  </div>
                </div>

                {/* Slip Upload */}
                <div className='separator separator-dashed mb-5' />
                <div className='fw-bold fs-6 mb-3 text-center'>
                  Step 2 — Upload Transfer Slip
                </div>

                <input
                  type='file'
                  ref={slipInputRef}
                  accept='image/*'
                  className='d-none'
                  onChange={handleSlipUpload}
                  disabled={slipUploading}
                />

                {slipUrl ? (
                  <div className='text-center'>
                    {/* Preview */}
                    <div className='position-relative d-inline-block mb-3'>
                      <img
                        src={slipUrl}
                        alt='Transfer slip'
                        className='rounded border border-success'
                        style={{ maxWidth: 200, maxHeight: 280, objectFit: 'contain' }}
                      />
                      <button
                        type='button'
                        className='btn btn-sm btn-icon btn-light-danger position-absolute top-0 end-0'
                        onClick={() => setSlipUrl('')}
                        title='Remove slip'
                      >
                        <KTIcon iconName='cross' className='fs-4' />
                      </button>
                    </div>
                    <div className='text-success fw-bold d-flex align-items-center justify-content-center gap-2'>
                      <KTIcon iconName='check-circle' className='fs-3 text-success' />
                      Slip uploaded — ready to confirm
                    </div>
                  </div>
                ) : (
                  <div className='text-center'>
                    <button
                      type='button'
                      className='btn btn-light-primary'
                      onClick={() => slipInputRef.current?.click()}
                      disabled={slipUploading}
                    >
                      {slipUploading ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-2' />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <KTIcon iconName='folder-up' className='fs-3 me-2' />
                          Upload Slip
                        </>
                      )}
                    </button>
                    <div className='text-muted fs-8 mt-2'>
                      JPG / PNG · max 5 MB
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className='modal-footer'>
        <button
          type='button'
          className='btn btn-light'
          disabled={loading}
          onClick={
            currentStep === 1 ? () => setItemIdForUpdate(undefined) : prevStep
          }
        >
          {currentStep === 1 ? (
            'Cancel'
          ) : (
            <>
              <KTIcon iconName='arrow-left' className='fs-4 me-1' /> Back
            </>
          )}
        </button>

        {currentStep < STEPS.length ? (
          <button type='button' className='btn btn-primary' onClick={nextStep}>
            Next <KTIcon iconName='arrow-right' className='fs-4 ms-1' />
          </button>
        ) : (
          <button
            type='button'
            className='btn btn-success'
            onClick={handleSave}
            disabled={loading || (paymentMethod === 'transfer' && !slipUrl)}
          >
            {loading ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' />
                Saving...
              </>
            ) : (
              <>
                <KTIcon iconName='check' className='fs-4 me-1' /> Confirm Booking
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export { BookingShipEditModalForm }