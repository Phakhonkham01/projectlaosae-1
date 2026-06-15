import { FC, useState, useEffect, useRef } from 'react'
import { useListView } from '../core/ListViewProvider'
import { useQueryResponse } from '../core/QueryResponseProvider'
import { ShipData } from '../core/ship_models'
import { KTIcon } from '../../../../../../_metronic/helpers'
import Swal from 'sweetalert2'
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, increment } from 'firebase/firestore'
import { db } from '../../../../../../../../firebase/useFirebase'
import { io } from 'socket.io-client'
import QRCode from 'qrcode'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CurrentUser {
  _id: string
  user_name: string
  user_email: string
  role: string
}

interface BookingShipEditModalFormProps {
  isUserLoading?: boolean
  user?: Partial<CurrentUser> & {
    id?: unknown
  }
}

interface Product {
  product_id: string
  name: string
  price: number
  image: string
  availability: boolean
  category_id: string
}

interface Category {
  category_id: string
  name: string
}

interface SelectedFood {
  product_id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface SavedBill {
  id: string
  ship_name: string
  booking_date: string
  booking_time: string
  num_people: number
  num_hours: number
  total_ship_price: number
  foods: SelectedFood[]
  total_food_price: number
  grand_total: number
  payment_method: 'cash' | 'cash+transfer' | 'bcel'
  payment_status: 'pending' | 'slip_submitted' | 'approved'
  user_name: string
  user_email: string
  customer_name?: string
  customer_phone?: string
  booked_by_name?: string
  booked_by_email?: string
  booked_by_role?: string
}

type BookingPaymentStatus = SavedBill['payment_status']

// ─── Step Labels ──────────────────────────────────────────────────────────────

const STEPS = ['ລາຍລະອຽດການຈອງ', 'ເລືອກອາຫານ', 'ສະຫຼຸບລາຍການ', 'ການຊຳລະ']

const formatLak = (amount: number) => `${amount.toLocaleString()} LAK`
const SHOP_OPEN_MINUTES = 8 * 60 + 30
const SHOP_CLOSE_MINUTES = 20 * 60
const TIME_PICKER_CLOSE_MINUTES = 19 * 60 + 30
const SAME_DAY_LAST_BOOKING_MINUTES = 17 * 60
const SAME_DAY_PREP_BUFFER_MINUTES = 30
const TIME_STEP_MINUTES = 30
const DURATION_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1)

// ─── BCEL Config ──────────────────────────────────────────────────────────────
const BCEL_SECRET_KEY = '$2a$10$3QS4pUfHGqrBXorKeL04AukzcKTdfwcvqTfDDQWyFTym86qnc1/3W'
const BCEL_API_URL = 'https://payment-gateway.phajay.co/v1/api/payment/generate-bcel-qr'
const BCEL_SOCKET_URL = 'https://payment-gateway.phajay.co/'
const LAK_PER_USD = 21000
const BCEL_MAX_USD = 999

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad2 = (value: number) => value.toString().padStart(2, '0')

const getLocalDateString = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

const formatDateDMY = (iso: string) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

const timeStringToMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return NaN
  return hours * 60 + minutes
}

const getTimeParts = (value: string) => {
  if (!value) return { hour: '', minute: '' }
  const [hour = '', minute = ''] = value.split(':')
  return { hour, minute }
}

const minutesToTimeString = (minutes: number) => {
  const safeMinutes = Math.max(0, minutes)
  const hours = Math.floor(safeMinutes / 60)
  const mins = safeMinutes % 60
  return `${pad2(hours)}:${pad2(mins)}`
}

const roundUpToStep = (minutes: number, stepMinutes: number) =>
  Math.ceil(minutes / stepMinutes) * stepMinutes

const downloadReceiptPng = (bill: SavedBill) => {
  // Thermal-receipt style: narrow white paper, monospace, dashed rules, barcode.
  const scale = 2 // render at 2x for crisp output
  const width = 460
  const LX = 36 // left padding
  const RX = width - 36 // right edge
  const CX = width / 2
  const rowH = 26

  const receiptNo = bill.id.slice(0, 8).toUpperCase()
  const paymentLabel =
    bill.payment_method === 'bcel'
      ? 'BCEL QR'
      : bill.payment_method === 'cash+transfer'
      ? 'Cash + BCEL'
      : 'Cash'

  // Pre-compute height from the number of variable rows.
  const metaRows = 6
  const itemRows = 1 + bill.foods.length
  const totalRows = bill.foods.length > 0 ? 3 : 2
  const height =
    330 + metaRows * rowH + itemRows * rowH + totalRows * rowH + 60 + 200

  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.scale(scale, scale)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#111111'

  const mono = (size: number, bold = false) => {
    ctx.font = `${bold ? 'bold ' : ''}${size}px 'Courier New', monospace`
  }
  const center = (text: string, y: number) => {
    ctx.textAlign = 'center'
    ctx.fillText(text, CX, y)
    ctx.textAlign = 'left'
  }
  const lr = (label: string, value: string, y: number) => {
    ctx.textAlign = 'left'
    ctx.fillText(label, LX, y)
    ctx.textAlign = 'right'
    ctx.fillText(value, RX, y)
    ctx.textAlign = 'left'
  }
  const dashed = (y: number) => {
    ctx.save()
    ctx.strokeStyle = '#999999'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(LX, y)
    ctx.lineTo(RX, y)
    ctx.stroke()
    ctx.restore()
  }

  // ── Store header ──
  let y = 50
  mono(26, true)
  center('BOOKING RECEIPT', y)
  y += 26
  mono(16)
  center('****', y)
  y += 30
  mono(22, true)
  center('LAOSAE BOAT', y)
  y += 24
  mono(14)
  center('ບໍລິການລ່ອງເຮືອ', y)
  y += 20
  center('+856 20 0000 0000', y)
  y += 26
  center('********************', y)

  // ── Meta ──
  y += 32
  mono(14)
  lr(`Date:${formatDateDMY(bill.booking_date)}`, `Time:${bill.booking_time}`, y)
  y += rowH
  ctx.fillText(`Receipt#:${receiptNo}`, LX, y)
  y += rowH
  ctx.fillText(`Customer:${bill.customer_name || bill.user_name || '-'}`, LX, y)
  y += rowH
  ctx.fillText(`Tel:${bill.customer_phone || bill.user_email || '-'}`, LX, y)
  y += rowH
  ctx.fillText(`Ship:${bill.ship_name || '-'}`, LX, y)
  y += rowH
  ctx.fillText(`Cashier:${bill.booked_by_name || bill.user_name || '-'}`, LX, y)

  // ── Items ──
  y += 18
  dashed(y)
  y += 26
  lr(`Ship x${bill.num_people}p ${bill.num_hours}h`, formatLak(bill.total_ship_price), y)
  bill.foods.forEach((food) => {
    y += rowH
    lr(`${food.name} x${food.quantity}`, formatLak(food.price * food.quantity), y)
  })

  // ── Totals ──
  y += 18
  dashed(y)
  y += 26
  if (bill.foods.length > 0) {
    lr('Food Total', formatLak(bill.total_food_price), y)
    y += rowH
  }
  lr('Ship Total', formatLak(bill.total_ship_price), y)
  y += rowH + 4
  mono(18, true)
  lr('TOTAL', formatLak(bill.grand_total), y)

  // ── Payment ──
  y += 16
  dashed(y)
  y += 26
  mono(14)
  ctx.fillText('Payment', LX, y)
  y += rowH
  ctx.fillText(`Method:${paymentLabel} — PAID`, LX, y)

  // ── Footer ──
  y += 44
  mono(15)
  center('THANK YOU FOR BOOKING', y)

  // ── Barcode ──
  y += 24
  const barTop = y
  const barH = 56
  let bx = LX
  for (let i = 0; bx < RX; i++) {
    const w = (receiptNo.charCodeAt(i % receiptNo.length) + i * 7) % 3 + 1
    if (i % 2 === 0) {
      ctx.fillStyle = '#111111'
      ctx.fillRect(bx, barTop, w, barH)
    }
    bx += w
  }
  ctx.fillStyle = '#111111'
  y = barTop + barH + 22
  mono(14)
  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillText(receiptNo.split('').join(' '), CX, y)
  ctx.restore()

  const link = document.createElement('a')
  link.download = `receipt-${receiptNo}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// ─── Component ────────────────────────────────────────────────────────────────

const BookingShipEditModalForm: FC<BookingShipEditModalFormProps> = ({
  isUserLoading = false,
  user,
}) => {
  const { itemIdForUpdate, setItemIdForUpdate } = useListView()
  const { refetch } = useQueryResponse()

  const [currentStep, setCurrentStep] = useState(1)
  const [shipData, setShipData] = useState<ShipData | null>(null)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [customerNameInput, setCustomerNameInput] = useState('')
  const [customerPhoneInput, setCustomerPhoneInput] = useState('')
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const customerName = currentUser?.user_name ?? user?.user_name
  const customerEmail = currentUser?.user_email ?? user?.user_email
  const customerRole = currentUser?.role ?? user?.role
  const customerInitial = customerName?.charAt(0)?.toUpperCase() ?? '?'

  // ─── Load user from localStorage ──────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setCurrentUser(JSON.parse(raw) as CurrentUser)
    } catch {
      console.warn('Could not parse user from localStorage')
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(new Date()), 60 * 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  // ─── Step 1 state ──────────────────────────────────────────────────────────
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [numPeople, setNumPeople] = useState(1)
  const [numHours, setNumHours] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ─── Step 2 state ──────────────────────────────────────────────────────────
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])
  const [activeFoodCategory, setActiveFoodCategory] = useState<string>('')

  // ─── Step 4 state ──────────────────────────────────────────────────────────
  const isStaff = customerRole === 'employee' || customerRole === 'owner'
  const [paymentMethod, setPaymentMethod] = useState<
    'cash' | 'cash+transfer' | 'bcel'
  >('bcel')
  const [cashAmount, setCashAmount] = useState<number>(0)
  const [transferAmount, setTransferAmount] = useState<number>(0)
  const [savedBill, setSavedBill] = useState<SavedBill | null>(null)

  // ─── BCEL state ────────────────────────────────────────────────────────────
  const [bcelQrDataUrl, setBcelQrDataUrl] = useState<string>('')
  const [bcelStatus, setBcelStatus] = useState<
    'idle' | 'loading' | 'waiting' | 'paid' | 'error'
  >('idle')
  const [bcelErrorMsg, setBcelErrorMsg] = useState('')
  const [bcelCountdown, setBcelCountdown] = useState(90)
  const bcelSocketRef = useRef<ReturnType<typeof io> | null>(null)
  const bcelCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bcelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref to always hold the latest handleSave (avoids stale closure in socket callback)
  const handleSaveRef = useRef<() => Promise<void>>(async () => {})

  // Cleanup BCEL socket + timers on unmount
  useEffect(() => {
    return () => {
      bcelSocketRef.current?.disconnect()
      if (bcelCountdownRef.current) clearInterval(bcelCountdownRef.current)
      if (bcelTimeoutRef.current) clearTimeout(bcelTimeoutRef.current)
    }
  }, [])

  // ─── Load ship data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!itemIdForUpdate) return
    setLoading(true)
    getDoc(doc(db, 'ships', itemIdForUpdate))
      .then((snap) => {
        if (snap.exists()) setShipData({ id: snap.id, ...snap.data() } as ShipData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [itemIdForUpdate])

  // ─── Load products ─────────────────────────────────────────────────────────
  useEffect(() => {
    getDocs(collection(db, 'products'))
      .then((snap) => {
        const data = snap.docs.map((d) => ({ product_id: d.id, ...d.data() } as Product))
        setProducts(data.filter((p) => p.availability))
      })
      .catch(console.error)
  }, [])

  // ─── Load categories ───────────────────────────────────────────────────────
  useEffect(() => {
    getDocs(collection(db, 'categories'))
      .then((snap) => {
        setCategories(snap.docs.map((d) => ({ category_id: d.id, ...d.data() } as Category)))
      })
      .catch(console.error)
  }, [])

  // ─── Computed totals ───────────────────────────────────────────────────────
  const shipPricePerHour = shipData?.price ?? 0
  const totalShipPrice = numHours * shipPricePerHour
  const totalFoodPrice = selectedFoods.reduce((sum, f) => sum + f.price * f.quantity, 0)
  const grandTotal = totalShipPrice + totalFoodPrice
  const todayDateString = getLocalDateString(currentTime)
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
  const isTodaySelected = bookingDate === todayDateString
  const earliestTodayBookingMinutes = roundUpToStep(
    Math.max(SHOP_OPEN_MINUTES, currentMinutes + SAME_DAY_PREP_BUFFER_MINUTES),
    TIME_STEP_MINUTES
  )
  const minimumBookingMinutes = isTodaySelected ? earliestTodayBookingMinutes : SHOP_OPEN_MINUTES
  const latestBookingMinutes = isTodaySelected
    ? Math.min(SAME_DAY_LAST_BOOKING_MINUTES, TIME_PICKER_CLOSE_MINUTES)
    : TIME_PICKER_CLOSE_MINUTES
  const bookingTimeMinutes = bookingTime ? timeStringToMinutes(bookingTime) : NaN
  const availableTimeOptions =
    minimumBookingMinutes <= latestBookingMinutes
      ? Array.from(
          {
            length:
              Math.floor((latestBookingMinutes - minimumBookingMinutes) / TIME_STEP_MINUTES) + 1,
          },
          (_, index) => minutesToTimeString(minimumBookingMinutes + index * TIME_STEP_MINUTES)
        )
      : []
  const { hour: selectedHour, minute: selectedMinute } = getTimeParts(bookingTime)
  const availableHourOptions = Array.from(
    new Set(availableTimeOptions.map((timeOption) => timeOption.split(':')[0]))
  )
  const availableMinuteOptions = selectedHour
    ? availableTimeOptions
        .filter((timeOption) => timeOption.startsWith(`${selectedHour}:`))
        .map((timeOption) => timeOption.split(':')[1])
    : []
  const maxBookableHours =
    !Number.isNaN(bookingTimeMinutes) && bookingTimeMinutes < SHOP_CLOSE_MINUTES
      ? Math.floor((SHOP_CLOSE_MINUTES - bookingTimeMinutes) / 60)
      : 0
  const availableDurationOptions = DURATION_OPTIONS.filter((hours) => hours <= maxBookableHours)
  const isSameDayBookingClosed =
    isTodaySelected &&
    (currentMinutes > SAME_DAY_LAST_BOOKING_MINUTES ||
      earliestTodayBookingMinutes > SAME_DAY_LAST_BOOKING_MINUTES)

  // ─── BCEL computed ─────────────────────────────────────────────────────────
  const bcelTargetLak = paymentMethod === 'cash+transfer' ? transferAmount : grandTotal
  const bcelAmountUsd = Math.min(Math.round(bcelTargetLak / LAK_PER_USD), BCEL_MAX_USD)
  const bcelAmountCapped = bcelTargetLak / LAK_PER_USD > BCEL_MAX_USD

  // ─── Download receipt ──────────────────────────────────────────────────────
  const handleDownloadSavedBill = () => {
    if (!savedBill) return
    try {
      downloadReceiptPng(savedBill)
    } catch (error) {
      console.error(error)
      Swal.fire({ icon: 'error', title: 'Download failed', text: 'Could not generate the bill PNG.' })
    }
  }

  // ─── Time helpers ──────────────────────────────────────────────────────────
  const updateBookingTime = (nextHour: string, nextMinute: string) => {
    setBookingTime(nextHour && nextMinute ? `${nextHour}:${nextMinute}` : '')
    setErrors((p) => {
      const n = { ...p }
      delete n.time
      delete n.hours
      return n
    })
  }

  useEffect(() => {
    if (!bookingDate || !bookingTime) return
    if (isSameDayBookingClosed) { setBookingTime(''); return }
    if (bookingTimeMinutes < minimumBookingMinutes || bookingTimeMinutes > latestBookingMinutes) {
      setBookingTime('')
    }
  }, [bookingDate, bookingTime, bookingTimeMinutes, isSameDayBookingClosed, latestBookingMinutes, minimumBookingMinutes])

  useEffect(() => {
    if (!bookingTime || maxBookableHours < 1) return
    if (numHours > maxBookableHours) setNumHours(maxBookableHours)
  }, [bookingTime, maxBookableHours, numHours])

  // ─── BCEL QR Pay ───────────────────────────────────────────────────────────
  const handleBcelPay = async () => {
    if (bcelAmountUsd < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'ຈຳນວນເງິນຕ່ຳເກີນໄປ',
        text: 'ຍອດຕໍ່າສຸດທີ່ສາມາດ QR ໄດ້ຄື 21,000 LAK',
      })
      return
    }

    setBcelStatus('loading')
    setBcelQrDataUrl('')
    setBcelErrorMsg('')
    bcelSocketRef.current?.disconnect()

    try {
      const resp = await fetch(BCEL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          secretKey: BCEL_SECRET_KEY,
        },
        body: JSON.stringify({
          amount: bcelAmountUsd,
          description: `Booking: ${shipData?.ship_name ?? ''}`,
        }),
      })
      const data = await resp.json()
      if (!data.qrCode) throw new Error(data.message ?? 'ບໍ່ໄດ້ຮັບ QR Code')

      const dataUrl = await QRCode.toDataURL(data.qrCode, { width: 240, margin: 2 })
      setBcelQrDataUrl(dataUrl)
      setBcelStatus('waiting')

      const socket = io(BCEL_SOCKET_URL, { transports: ['websocket', 'polling'] })
      bcelSocketRef.current = socket

      // ─── Start countdown 1:30 ───────────────────────────────────────────
      setBcelCountdown(90)
      bcelCountdownRef.current = setInterval(() => {
        setBcelCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(bcelCountdownRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // ─── Auto-expire after 90s ──────────────────────────────────────────
      bcelTimeoutRef.current = setTimeout(() => {
        socket.disconnect()
        clearInterval(bcelCountdownRef.current!)
        setBcelStatus('error')
        setBcelErrorMsg('QR ໝົດອາຍຸແລ້ວ — ກະລຸນາສ້າງໃໝ່')
        setBcelQrDataUrl('')
        setBcelCountdown(0)
      }, 90 * 1000)

      socket.on('join::' + BCEL_SECRET_KEY, () => {
        clearBcelTimers()
        setBcelStatus('paid')
        setBcelQrDataUrl('')
        socket.disconnect()
      })

      socket.on('connect_error', () => {
        clearBcelTimers()
        setBcelErrorMsg('ເຊື່ອມຕໍ່ socket ບໍ່ໄດ້ — ກະລຸນາລອງໃໝ່')
        setBcelStatus('error')
      })
    } catch (err: unknown) {
      setBcelErrorMsg(err instanceof Error ? err.message : 'ເກີດຂໍ້ຜິດພາດ')
      setBcelStatus('error')
    }
  }

  const clearBcelTimers = () => {
    if (bcelCountdownRef.current) clearInterval(bcelCountdownRef.current)
    if (bcelTimeoutRef.current) clearTimeout(bcelTimeoutRef.current)
    bcelCountdownRef.current = null
    bcelTimeoutRef.current = null
  }
  const clearBcelTimersRef = useRef(clearBcelTimers)
  clearBcelTimersRef.current = clearBcelTimers

  const resetBcel = () => {
    bcelSocketRef.current?.disconnect()
    clearBcelTimers()
    setBcelStatus('idle')
    setBcelQrDataUrl('')
    setBcelErrorMsg('')
    setBcelCountdown(90)
  }

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {}
    if (bookingDate && isSameDayBookingClosed) {
      errs.date = 'Today is no longer available. Please choose a later date.'
    }
    if (!bookingDate) errs.date = 'ກະລຸນາເລືອກວັນທີ'
    if (!bookingTime) errs.time = 'ກະລຸນາເລືອກເວລາ'
    if (bookingTime) {
      if (bookingTimeMinutes < SHOP_OPEN_MINUTES) {
        errs.time = `Shop opens at ${minutesToTimeString(SHOP_OPEN_MINUTES)}`
      } else if (bookingTimeMinutes > latestBookingMinutes) {
        errs.time = `Please choose a time no later than ${minutesToTimeString(latestBookingMinutes)}`
      } else if (isTodaySelected && bookingTimeMinutes < minimumBookingMinutes) {
        errs.time = `For today, please choose ${minutesToTimeString(minimumBookingMinutes)} or later`
      } else if (isTodaySelected && bookingTimeMinutes > SAME_DAY_LAST_BOOKING_MINUTES) {
        errs.time = `For today, booking time must be ${minutesToTimeString(SAME_DAY_LAST_BOOKING_MINUTES)} or earlier`
      }
    }
    if (isStaff) {
      if (!customerNameInput.trim()) errs.customer_name = 'ກະລຸນາໃສ່ຊື່ລູກຄ້າ'
      if (!customerPhoneInput.trim()) errs.customer_phone = 'ກະລຸນາໃສ່ເບີໂທລູກຄ້າ'
    }
    if (numPeople < 1) errs.people = 'ຕ້ອງມີຢ່າງໜ້ອຍ 1 ຄົນ'
    if (shipData && numPeople > shipData.capacity)
      errs.people = `ເກີນຄວາມຈຸຂອງເຮືອ (ສູງສຸດ ${shipData.capacity})`
    if (numHours < 1) errs.hours = 'ຕ້ອງຈອງຢ່າງໜ້ອຍ 1 ຊົ່ວໂມງ'
    if (bookingTime && maxBookableHours < 1) {
      errs.hours = 'This start time does not leave enough time for a 1 hour booking'
    } else if (bookingTime && numHours > maxBookableHours) {
      errs.hours = `From ${bookingTime}, you can book up to ${maxBookableHours} hour(s)`
    }
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

  // ─── Navigation ────────────────────────────────────────────────────────────
  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 4 && isStaff && paymentMethod === 'cash+transfer') {
      if (cashAmount < 0 || transferAmount < 0) {
        Swal.fire({ icon: 'warning', title: 'ຜິດພາດ', text: 'ຈຳນວນເງິນຕ້ອງບໍ່ຕ່ຳກວ່າ 0' })
        return
      }
      const total = cashAmount + transferAmount
      if (total !== grandTotal) {
        Swal.fire({
          icon: 'warning',
          title: 'ຈຳນວນເງິນບໍ່ຖືກ',
          text: `ລວມ ${total.toLocaleString()} LAK ຕ້ອງເທົ່າກັບ ${grandTotal.toLocaleString()} LAK`,
        })
        return
      }
    }
    setCurrentStep((s) => s + 1)
  }

  const prevStep = () => setCurrentStep((s) => s - 1)

  // ─── Save booking ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true)
    try {
      const paymentStatus: BookingPaymentStatus = isStaff
        ? 'approved'
        : paymentMethod === 'bcel'
        ? 'approved'
        : 'pending'

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
        payment_status: paymentStatus,
        cash_amount:
          paymentMethod === 'cash+transfer'
            ? cashAmount
            : paymentMethod === 'cash'
            ? grandTotal
            : 0,
        transfer_amount:
          paymentMethod === 'cash+transfer' ? transferAmount : 0,
        bcel_amount_usd:
          paymentMethod === 'bcel' || paymentMethod === 'cash+transfer'
            ? bcelAmountUsd
            : 0,
        // ─── Customer info ───
        user_id: currentUser?._id ?? '',
        user_name: isStaff ? customerNameInput.trim() : currentUser?.user_name ?? '',
        user_email: currentUser?.user_email ?? '',
        customer_name: isStaff ? customerNameInput.trim() : '',
        customer_phone: isStaff ? customerPhoneInput.trim() : '',
        booked_by_name: isStaff ? currentUser?.user_name ?? '' : '',
        booked_by_email: isStaff ? currentUser?.user_email ?? '' : '',
        booked_by_role: isStaff ? currentUser?.role ?? '' : '',
        status: isStaff || paymentMethod === 'bcel' ? 'approved' : 'pending',
        createdAt: new Date().toISOString(),
      }

      const billRef = await addDoc(collection(db, 'bill'), bookingPayload)
      await addDoc(collection(db, 'history_booking'), bookingPayload)

      // ─── Decrement ship quantity on successful payment ───
      const paymentSucceeded =
        paymentStatus === 'approved' || paymentMethod === 'bcel' || isStaff
      if (paymentSucceeded && itemIdForUpdate && (shipData?.quantity ?? 0) > 0) {
        try {
          await updateDoc(doc(db, 'ships', itemIdForUpdate), {
            quantity: increment(-1),
            updatedAt: new Date().toISOString(),
          })
        } catch (err) {
          console.error('Failed to decrement ship quantity:', err)
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'ຢືນຢັນການຈອງແລ້ວ',
        text: 'ບັນທຶກການຈອງສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false,
      })

      setSavedBill({
        id: billRef.id,
        ship_name: bookingPayload.ship_name,
        booking_date: bookingPayload.booking_date,
        booking_time: bookingPayload.booking_time,
        num_people: bookingPayload.num_people,
        num_hours: bookingPayload.num_hours,
        total_ship_price: bookingPayload.total_ship_price,
        foods: bookingPayload.foods,
        total_food_price: bookingPayload.total_food_price,
        grand_total: bookingPayload.grand_total,
        payment_method: bookingPayload.payment_method,
        payment_status: bookingPayload.payment_status,
        user_name: bookingPayload.user_name,
        user_email: bookingPayload.user_email,
        customer_name: bookingPayload.customer_name,
        customer_phone: bookingPayload.customer_phone,
        booked_by_name: bookingPayload.booked_by_name,
        booked_by_email: bookingPayload.booked_by_email,
        booked_by_role: bookingPayload.booked_by_role,
      })
      refetch()
    } catch (error) {
      console.error('Save error:', error)
      Swal.fire({ icon: 'error', title: 'ຜິດພາດ', text: 'ບັນທຶກການຈອງບໍ່ສຳເລັດ' })
    } finally {
      setLoading(false)
    }
  }

  // Keep ref always pointing to latest handleSave (fixes stale closure in socket)
  handleSaveRef.current = handleSave

  // ─── Auto-save when BCEL confirms payment (pure BCEL only) ─────────────────
  useEffect(() => {
    if (bcelStatus === 'paid' && paymentMethod === 'bcel') {
      handleSaveRef.current()
    }
  }, [bcelStatus, paymentMethod])

  // ─── Reset BCEL QR if target amount changes while QR is showing ─────────────
  useEffect(() => {
    if (bcelStatus === 'waiting') {
      bcelSocketRef.current?.disconnect()
      clearBcelTimersRef.current()
      setBcelStatus('idle')
      setBcelQrDataUrl('')
      setBcelErrorMsg('')
      setBcelCountdown(90)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bcelTargetLak])

  // ─── BCEL panel renderer (reused by 'bcel' and 'cash+transfer') ────────────
  const renderBcelPanel = (title: string) => (
    <div className='text-center'>
      <div className='p-4 rounded bg-light-primary mb-5'>
        <div className='fs-6 fw-bold mb-1'>🏦 {title}</div>
        <div className='text-muted fs-7 mt-1'>
          ຍອດ:{' '}
          <strong className='text-primary'>{bcelTargetLak.toLocaleString()} LAK</strong>{' '}
          ≈ <strong className='text-success'>{bcelAmountUsd} USD</strong>
          {bcelAmountCapped && (
            <span className='text-warning ms-1'>(ຈຳກັດ {BCEL_MAX_USD} USD test key)</span>
          )}
        </div>
        <div className='text-muted fs-8 mt-1'>
          ອັດຕາແລກປ່ຽນ: 1 USD = {LAK_PER_USD.toLocaleString()} LAK
        </div>
      </div>

      {bcelStatus === 'idle' && (
        <button
          type='button'
          className='btn btn-primary btn-lg'
          onClick={handleBcelPay}
          disabled={bcelTargetLak < LAK_PER_USD}
        >
          <KTIcon iconName='scan-barcode' className='fs-3 me-2' />
          ສ້າງ QR ເພື່ອຊຳລະ
        </button>
      )}

      {bcelStatus === 'loading' && (
        <div className='py-6'>
          <span className='spinner-border text-primary mb-3' />
          <div className='text-muted fs-7 mt-2'>ກຳລັງສ້າງ QR Code...</div>
        </div>
      )}

      {bcelStatus === 'waiting' && bcelQrDataUrl && (
        <div>
          <img
            src={bcelQrDataUrl}
            alt='BCEL QR Code'
            className='rounded border border-2 border-primary mb-3'
            style={{ width: 240, height: 240 }}
          />
          <div className='d-flex flex-column align-items-center mb-4'>
            <div
              className='position-relative d-flex align-items-center justify-content-center mb-2'
              style={{ width: 72, height: 72 }}
            >
              <svg
                width='72'
                height='72'
                style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
              >
                <circle cx='36' cy='36' r='30' fill='none' stroke='#e9ecef' strokeWidth='6' />
                <circle
                  cx='36'
                  cy='36'
                  r='30'
                  fill='none'
                  stroke={bcelCountdown > 30 ? '#0d6efd' : bcelCountdown > 10 ? '#ffc107' : '#dc3545'}
                  strokeWidth='6'
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - bcelCountdown / 90)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                />
              </svg>
              <span
                className='fw-bolder fs-5'
                style={{
                  color: bcelCountdown > 30 ? '#0d6efd' : bcelCountdown > 10 ? '#ffc107' : '#dc3545',
                }}
              >
                {`${Math.floor(bcelCountdown / 60)}:${String(bcelCountdown % 60).padStart(2, '0')}`}
              </span>
            </div>
            <div className='d-flex align-items-center gap-2 text-warning fw-bold fs-7'>
              <span className='spinner-border spinner-border-sm' />
              ລໍຖ້າການຊຳລະ...
            </div>
            <div className='text-muted fs-8 mt-1'>
              QR ໝົດອາຍຸໃນ {`${Math.floor(bcelCountdown / 60)}:${String(bcelCountdown % 60).padStart(2, '0')}`} ນາທີ
            </div>
          </div>
          <button type='button' className='btn btn-sm btn-light' onClick={resetBcel}>
            ສ້າງ QR ໃໝ່
          </button>
        </div>
      )}

      {bcelStatus === 'paid' && (
        <div className='py-4'>
          <div className='text-success fw-bolder fs-3 mb-3'>
            <KTIcon iconName='check-circle' className='fs-1 text-success me-2' />
            ຊຳລະສຳເລັດ!
          </div>
          <div className='badge badge-light-success fs-6 px-4 py-2 mb-3'>
            ✅ BCEL ຢືນຢັນການຊຳລະແລ້ວ
          </div>
          {paymentMethod === 'bcel' ? (
            <div className='d-flex align-items-center justify-content-center gap-2 text-muted fs-7 mt-2'>
              <span className='spinner-border spinner-border-sm text-primary' />
              ກຳລັງບັນທຶກການຈອງ...
            </div>
          ) : (
            <div className='text-muted fs-7 mt-2'>ກົດ ຢືນຢັນການຈອງ ເພື່ອບັນທຶກ.</div>
          )}
        </div>
      )}

      {bcelStatus === 'error' && (
        <div className='alert alert-danger py-3 text-start'>
          <div className='fw-bold mb-1'>ເກີດຂໍ້ຜິດພາດ</div>
          <div className='fs-7'>{bcelErrorMsg}</div>
          <button type='button' className='btn btn-sm btn-light-danger mt-2' onClick={resetBcel}>
            ລອງໃໝ່
          </button>
        </div>
      )}
    </div>
  )

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (loading && !shipData) {
    return (
      <div className='modal-content h-100 border-0' style={{ height: '100%' }}>
        <div className='modal-body d-flex justify-content-center align-items-center py-15'>
          <span className='spinner-border text-primary' />
        </div>
      </div>
    )
  }

  // ─── Bill view after save ──────────────────────────────────────────────────
  if (savedBill) {
    const paymentMethodLabel =
      savedBill.payment_method === 'bcel'
        ? 'BCEL QR'
        : savedBill.payment_method === 'cash+transfer'
        ? 'Cash + BCEL'
        : 'Cash'
    const receiptNo = savedBill.id.slice(0, 8).toUpperCase()

    // Monospaced thermal-receipt look-and-feel
    const paperFont = "'Courier New', Courier, monospace"
    const tornEdge = {
      height: 10,
      background:
        'linear-gradient(-45deg, transparent 16px, #ffffff 0) 0 0, ' +
        'linear-gradient(45deg, transparent 16px, #ffffff 0) 0 0',
      backgroundSize: '22px 22px',
      backgroundRepeat: 'repeat-x',
    }
    const dottedRule = {
      borderTop: '1px dashed #9a9a9a',
      margin: '10px 0',
    }
    // Deterministic barcode bars derived from the receipt number
    const barcodeBars = Array.from({ length: 56 }, (_, i) => {
      const code = receiptNo.charCodeAt(i % receiptNo.length) + i * 7
      return (code % 3) + 1
    })

    const ReceiptRow = ({ label, value }: { label: string; value: string }) => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          lineHeight: 1.7,
        }}
      >
        <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{label}</span>
        <span style={{ whiteSpace: 'nowrap' }}>{value}</span>
      </div>
    )

    return (
      <div
        className='modal-content h-100 border-0'
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <div className='modal-header'>
          <h2 className='fw-bold text-success mb-0'>ບິນການຈອງ</h2>
          <div
            className='btn btn-icon btn-sm btn-active-icon-primary'
            onClick={() => setItemIdForUpdate(undefined)}
            style={{ cursor: 'pointer' }}
          >
            <KTIcon iconName='cross' className='fs-1' />
          </div>
        </div>

        <div
          className='modal-body scroll-y px-4 py-8'
          style={{ background: '#e9e9ee' }}
        >
          <div className='mx-auto' style={{ maxWidth: 320 }}>
            {/* torn top edge */}
            <div style={tornEdge} />

            <div
              style={{
                background: '#ffffff',
                color: '#1a1a1a',
                fontFamily: paperFont,
                fontSize: 13,
                padding: '6px 24px 22px',
                boxShadow: '0 14px 30px rgba(0,0,0,0.18)',
              }}
            >
              {/* ── Store header ── */}
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.18em' }}>
                  BOOKING RECEIPT
                </div>
                <div style={{ letterSpacing: '0.3em', margin: '4px 0' }}>****</div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.1em' }}>
                  LAOSAE JOVA
                </div>
                <div style={{ fontSize: 12 }}>ບໍລິການລ່ອງເຮືອນຳທ່ຽວ</div>
                <div style={{ fontSize: 12 }}>+856 20 99600457</div>
              </div>

              <div style={{ textAlign: 'center', letterSpacing: '0.15em', margin: '10px 0' }}>
                ********************
              </div>

              {/* ── Meta ── */}
              <ReceiptRow
                label={`Date:${formatDateDMY(savedBill.booking_date)}`}
                value={`Time:${savedBill.booking_time}`}
              />
              <div>Receipt#:{receiptNo}</div>
              <div>
                Customer:{savedBill.customer_name || savedBill.user_name || '-'}
              </div>
              <div>Tel:{savedBill.customer_phone || savedBill.user_email || '-'}</div>
              <div>Ship:{savedBill.ship_name}</div>
              <div>
                Cashier:{savedBill.booked_by_name || savedBill.user_name || '-'}
              </div>

              <div style={dottedRule} />

              {/* ── Items ── */}
              <ReceiptRow
                label={`Ship x${savedBill.num_people}p ${savedBill.num_hours}h`}
                value={formatLak(savedBill.total_ship_price)}
              />
              {savedBill.foods.map((food) => (
                <ReceiptRow
                  key={`${food.product_id}-${food.name}`}
                  label={`${food.name} x${food.quantity}`}
                  value={formatLak(food.price * food.quantity)}
                />
              ))}

              <div style={dottedRule} />

              {/* ── Totals ── */}
              {savedBill.foods.length > 0 && (
                <ReceiptRow label='Food Total' value={formatLak(savedBill.total_food_price)} />
              )}
              <ReceiptRow label='Ship Total' value={formatLak(savedBill.total_ship_price)} />
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>
                <ReceiptRow label='TOTAL' value={formatLak(savedBill.grand_total)} />
              </div>

              <div style={dottedRule} />

              {/* ── Payment ── */}
              <div>Payment</div>
              <div>Method:{paymentMethodLabel} — PAID</div>

              {/* ── Footer ── */}
              <div style={{ textAlign: 'center', margin: '20px 0 8px' }}>
                THANK YOU FOR BOOKING
              </div>

              {/* ── Barcode ── */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  height: 56,
                  marginTop: 6,
                }}
              >
                {barcodeBars.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      width: w,
                      height: '100%',
                      background: i % 2 === 0 ? '#1a1a1a' : 'transparent',
                    }}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'center', letterSpacing: '0.25em', marginTop: 4 }}>
                {receiptNo}
              </div>
            </div>

            {/* torn bottom edge */}
            <div style={{ ...tornEdge, transform: 'scaleY(-1)' }} />
          </div>
        </div>

        <div className='modal-footer'>
          <button
            type='button'
            className='btn btn-light'
            onClick={() => setItemIdForUpdate(undefined)}
          >
            ປິດ
          </button>
          <button type='button' className='btn btn-dark' onClick={handleDownloadSavedBill}>
            <KTIcon iconName='file-down' className='fs-4 me-2' />
            ດາວໂຫລດ PNG
          </button>
        </div>
      </div>
    )
  }

  // ─── Main wizard render ────────────────────────────────────────────────────
  return (
    <div
      className='modal-content h-100 border-0'
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* ── Header ── */}
      <div className='modal-header'>
        <h2 className='fw-bold'>
          ຈອງເຮືອ: <span className='text-primary'>{shipData?.ship_name}</span>
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
              <div key={i} className='d-flex flex-column align-items-center' style={{ flex: 1 }}>
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
      <div
        className='modal-body scroll-y mx-5 mx-xl-12 my-4'
        style={{ flex: '1 1 auto', minHeight: 0 }}
      >

        {/* ────────── STEP 1: Booking Details ────────── */}
        {currentStep === 1 && (
          <div>
            {/* Customer info banner */}
            <div className='d-flex align-items-center p-3 rounded bg-light mb-4 border-start border-4 border-primary'>
              <div className='w-40px h-40px rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bolder fs-5 me-3 flex-shrink-0'>
                {customerInitial}
              </div>
              <div className='flex-grow-1'>
                <div className='fw-bold fs-6 lh-1 mb-1'>
                  {isUserLoading ? (
                    <span className='text-muted'>ກຳລັງໂຫຼດຜູ້ໃຊ້...</span>
                  ) : (
                    customerName ?? <span className='text-muted'>ບໍ່ຮູ້ຂໍ້ມູນ</span>
                  )}
                </div>
                <div className='text-muted fs-8'>
                  {isUserLoading ? 'ກຳລັງໂຫຼດ...' : customerEmail ?? '-'}
                </div>
              </div>
              <span className='badge badge-light-primary fs-9'>
                {isUserLoading ? 'ກຳລັງໂຫຼດ...' : customerRole ?? '-'}
              </span>
            </div>

            {/* Staff: enter customer info */}
            {isStaff && (
              <div className='p-4 rounded bg-light-warning mb-5 border-start border-4 border-warning'>
                <div className='fw-bold fs-6 mb-3 text-warning'>
                  ຂໍ້ມູນລູກຄ້າ (ພະນັກງານ/ເຈົ້າຂອງຈອງໃຫ້)
                </div>
                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='required fw-bold fs-7 mb-2'>ຊື່ລູກຄ້າ</label>
                    <input
                      type='text'
                      className={`form-control form-control-solid ${errors.customer_name ? 'is-invalid' : ''}`}
                      value={customerNameInput}
                      onChange={(e) => {
                        setCustomerNameInput(e.target.value)
                        setErrors((p) => { const n = { ...p }; delete n.customer_name; return n })
                      }}
                      placeholder='ຊື່ລູກຄ້າ'
                    />
                    {errors.customer_name && <div className='invalid-feedback d-block'>{errors.customer_name}</div>}
                  </div>
                  <div className='col-md-6'>
                    <label className='required fw-bold fs-7 mb-2'>ເບີໂທລູກຄ້າ</label>
                    <input
                      type='tel'
                      className={`form-control form-control-solid ${errors.customer_phone ? 'is-invalid' : ''}`}
                      value={customerPhoneInput}
                      onChange={(e) => {
                        setCustomerPhoneInput(e.target.value)
                        setErrors((p) => { const n = { ...p }; delete n.customer_phone; return n })
                      }}
                      placeholder='020 xxxxxxxx'
                    />
                    {errors.customer_phone && <div className='invalid-feedback d-block'>{errors.customer_phone}</div>}
                  </div>
                </div>
                <div className='text-muted fs-8 mt-2'>
                  ບິນຈະບັນທຶກຊື່/ເບີຂອງພະນັກງານທີ່ຈອງໃຫ້: <strong>{customerName ?? '-'}</strong>
                </div>
              </div>
            )}

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
                  ຄວາມຈຸ: <strong>{shipData?.capacity}</strong> ຄົນ &nbsp;·&nbsp;{' '}
                  <strong>{shipData?.price?.toLocaleString()} LAK</strong> / ຊົ່ວໂມງ
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className='row mb-5'>
              <div className='col-6'>
                <label className='required fw-bold fs-6 mb-2'>ວັນທີ</label>
                <input
                  type='date'
                  className={`form-control form-control-solid ${errors.date ? 'is-invalid' : ''}`}
                  value={bookingDate}
                  min={todayDateString}
                  onChange={(e) => {
                    setBookingDate(e.target.value)
                    setBookingTime('')
                    setErrors((p) => {
                      const n = { ...p }
                      delete n.date
                      delete n.time
                      delete n.hours
                      return n
                    })
                  }}
                />
                {errors.date && <div className='invalid-feedback d-block'>{errors.date}</div>}
              </div>
              <div className='col-6'>
                <label className='required fw-bold fs-6 mb-2'>ເວລາ</label>
                <div className='row g-2'>
                  <div className='col-6'>
                    <select
                      className={`form-select form-select-solid ${errors.time ? 'is-invalid' : ''}`}
                      value={selectedHour}
                      disabled={isSameDayBookingClosed}
                      onChange={(e) => {
                        const nextHour = e.target.value
                        if (!nextHour) { updateBookingTime('', ''); return }
                        const nextMinuteOptions = availableTimeOptions
                          .filter((t) => t.startsWith(`${nextHour}:`))
                          .map((t) => t.split(':')[1])
                        const nextMinute = nextMinuteOptions.includes(selectedMinute)
                          ? selectedMinute
                          : nextMinuteOptions[0] ?? ''
                        updateBookingTime(nextHour, nextMinute)
                      }}
                    >
                      <option value=''>Hour</option>
                      {availableHourOptions.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div className='col-6'>
                    <select
                      className={`form-select form-select-solid ${errors.time ? 'is-invalid' : ''}`}
                      value={selectedMinute}
                      disabled={isSameDayBookingClosed || !selectedHour}
                      onChange={(e) => updateBookingTime(selectedHour, e.target.value)}
                    >
                      <option value=''>Minute</option>
                      {availableMinuteOptions.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {errors.time && <div className='invalid-feedback d-block'>{errors.time}</div>}
              </div>
            </div>

            {bookingDate && (
              <div
                className={`mb-5 p-3 rounded ${
                  isSameDayBookingClosed
                    ? 'bg-light-danger text-danger'
                    : 'bg-light-info text-info'
                }`}
              >
                {isTodaySelected
                  ? isSameDayBookingClosed
                    ? 'Today can no longer be booked because same-day booking closes after 17:00.'
                    : `For today, booking starts from ${minutesToTimeString(minimumBookingMinutes)} and must be made by ${minutesToTimeString(SAME_DAY_LAST_BOOKING_MINUTES)}.`
                  : `Bookings start from ${minutesToTimeString(SHOP_OPEN_MINUTES)}. You can choose any later time, but the booking must still end by ${minutesToTimeString(SHOP_CLOSE_MINUTES)}.`}
              </div>
            )}

            {/* Number of People */}
            <div className='mb-5'>
              <label className='required fw-bold fs-6 mb-2'>
                ຈຳນວນຄົນ{' '}
                <span className='text-muted fw-normal'>(ສູງສຸດ {shipData?.capacity})</span>
              </label>
              <input
                type='number'
                className={`form-control form-control-solid ${errors.people ? 'is-invalid' : ''}`}
                value={numPeople}
                min={1}
                max={shipData?.capacity}
                onChange={(e) => {
                  setNumPeople(parseInt(e.target.value) || 1)
                  setErrors((p) => { const n = { ...p }; delete n.people; return n })
                }}
              />
              {errors.people && <div className='invalid-feedback d-block'>{errors.people}</div>}
            </div>

            {/* Duration */}
            <div className='mb-6'>
              <label className='required fw-bold fs-6 mb-3'>ໄລຍະເວລາ (ຊົ່ວໂມງ)</label>
              <div className='d-flex flex-wrap gap-2'>
                {(bookingTime ? availableDurationOptions : DURATION_OPTIONS).map((h) => (
                  <button
                    key={h}
                    type='button'
                    className={`btn btn-sm ${numHours === h ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setNumHours(h)}
                    disabled={Boolean(bookingTime) && h > maxBookableHours}
                  >
                    {h} ຊົ່ວໂມງ
                  </button>
                ))}
              </div>
              {bookingTime && maxBookableHours > 0 && (
                <div className='text-muted fs-8 mt-2'>
                  {`From ${bookingTime}, you can book up to ${maxBookableHours} hour(s) before ${minutesToTimeString(SHOP_CLOSE_MINUTES)}.`}
                </div>
              )}
              {bookingTime && maxBookableHours < 1 && (
                <div className='text-danger fs-8 mt-2'>
                  {`This time is too close to closing time at ${minutesToTimeString(SHOP_CLOSE_MINUTES)}.`}
                </div>
              )}
              {errors.hours && <div className='text-danger fs-7 mt-2'>{errors.hours}</div>}
            </div>

            {/* Price preview */}
            <div className='p-4 rounded bg-light-success'>
              <div className='d-flex justify-content-between'>
                <span className='fw-semibold'>ຄ່າເຊົ່າເຮືອ</span>
                <span className='fw-bolder text-success fs-5'>
                  {totalShipPrice.toLocaleString()} LAK
                </span>
              </div>
              <div className='text-muted fs-8 mt-1'>
                {numHours} ຊົ່ວໂມງ × {shipPricePerHour.toLocaleString()} LAK/ຊົ່ວໂມງ
              </div>
            </div>
          </div>
        )}

        {/* ────────── STEP 2: Select Food ────────── */}
        {currentStep === 2 && (
          <div>
            <div className='fw-bold fs-5 mb-4'>ເລືອກອາຫານ ແລະ ເຄື່ອງດື່ມ</div>

            {products.length === 0 ? (
              <div className='text-center text-muted py-12'>
                <i className='bi bi-basket2 fs-2x mb-3 d-block' />
                ບໍ່ມີສິນຄ້າ
              </div>
            ) : (
              (() => {
                const tabs = categories
                  .map((c) => ({
                    id: c.category_id,
                    name: c.name,
                    count: products.filter((p) => p.category_id === c.category_id).length,
                  }))
                  .filter((t) => t.count > 0)
                const usedIds = new Set(categories.map((c) => c.category_id))
                const uncatCount = products.filter((p) => !usedIds.has(p.category_id)).length
                if (uncatCount > 0) {
                  tabs.push({ id: '__uncat__', name: 'ອື່ນໆ', count: uncatCount })
                }
                const activeId =
                  activeFoodCategory && tabs.some((t) => t.id === activeFoodCategory)
                    ? activeFoodCategory
                    : tabs[0]?.id ?? ''
                const visibleProducts = products.filter((p) =>
                  activeId === '__uncat__' ? !usedIds.has(p.category_id) : p.category_id === activeId
                )
                return (
                  <div>
                    {/* Category Tabs */}
                    <ul className='nav nav-tabs nav-line-tabs nav-line-tabs-2x mb-5 flex-nowrap overflow-auto'>
                      {tabs.map((t) => (
                        <li key={t.id} className='nav-item'>
                          <button
                            type='button'
                            className={`nav-link fw-bold ${activeId === t.id ? 'active text-primary' : 'text-muted'}`}
                            onClick={() => setActiveFoodCategory(t.id)}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {t.name}
                            <span className='badge badge-light-primary ms-2'>{t.count}</span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Product Grid for active tab */}
                    {visibleProducts.length === 0 ? (
                      <div className='text-center text-muted py-8'>ບໍ່ມີສິນຄ້າໃນໝວດນີ້</div>
                    ) : (
                      <div className='row g-3'>
                        {visibleProducts.map((product) => {
                          const qty = getFoodQty(product.product_id)
                          return (
                            <div key={product.product_id} className='col-6 col-xl-4'>
                              <div className={`card h-100 ${qty > 0 ? 'border border-primary' : ''}`}>
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
                                  <div className='fw-bold fs-7 mb-1 flex-grow-1'>{product.name}</div>
                                  <div className='text-primary fw-semibold fs-8 mb-2'>
                                    {product.price.toLocaleString()} LAK
                                  </div>
                                  <div className='d-flex align-items-center justify-content-between'>
                                    <button
                                      type='button'
                                      className='btn btn-sm btn-icon btn-light-danger w-25px h-25px'
                                      onClick={() => handleFoodQuantity(product, Math.max(0, qty - 1))}
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
                  </div>
                )
              })()
            )}

            {selectedFoods.length > 0 && (
              <div className='mt-5 p-4 rounded bg-light-info'>
                <div className='fw-bold mb-2'>
                  ເລືອກແລ້ວ:{' '}
                  <span className='text-info'>
                    {selectedFoods.reduce((s, f) => s + f.quantity, 0)} ລາຍການ
                  </span>
                </div>
                <div className='d-flex justify-content-between'>
                  <span className='text-muted'>ລວມຄ່າອາຫານ</span>
                  <span className='fw-bolder text-info'>{totalFoodPrice.toLocaleString()} LAK</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ────────── STEP 3: Summary ────────── */}
        {currentStep === 3 && (
          <div>
            <div className='fw-bold fs-5 mb-5'>ສະຫຼຸບການຈອງ</div>

            <div className='card bg-light mb-4'>
              <div className='card-body py-4 px-5'>
                <div className='fw-bold text-dark mb-3'>ຜູ້ຈອງ</div>
                {isStaff ? (
                  <>
                    <div className='d-flex justify-content-between mb-2'>
                      <span className='text-muted'>ຊື່ລູກຄ້າ</span>
                      <span className='fw-semibold'>{customerNameInput || '-'}</span>
                    </div>
                    <div className='d-flex justify-content-between mb-2'>
                      <span className='text-muted'>ເບີໂທລູກຄ້າ</span>
                      <span className='fw-semibold'>{customerPhoneInput || '-'}</span>
                    </div>
                    <div className='d-flex justify-content-between mb-2 border-top pt-2 mt-2'>
                      <span className='text-muted'>ພະນັກງານທີ່ຈອງ</span>
                      <span className='fw-semibold'>{currentUser?.user_name ?? '-'}</span>
                    </div>
                    <div className='d-flex justify-content-between'>
                      <span className='text-muted'>ອີເມວພະນັກງານ</span>
                      <span className='fw-semibold'>{currentUser?.user_email ?? '-'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='d-flex justify-content-between mb-2'>
                      <span className='text-muted'>ຊື່</span>
                      <span className='fw-semibold'>{currentUser?.user_name ?? '-'}</span>
                    </div>
                    <div className='d-flex justify-content-between'>
                      <span className='text-muted'>ອີເມວ</span>
                      <span className='fw-semibold'>{currentUser?.user_email ?? '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className='card bg-light mb-4'>
              <div className='card-body py-4 px-5'>
                <div className='fw-bold text-primary mb-3'>ລາຍລະອຽດເຮືອ</div>
                {(
                  [
                    ['ເຮືອ', shipData?.ship_name],
                    ['ວັນທີ', formatDateDMY(bookingDate)],
                    ['ເວລາ', bookingTime],
                    ['ຈຳນວນຄົນ', `${numPeople} ຄົນ`],
                    ['ໄລຍະເວລາ', `${numHours} ຊົ່ວໂມງ`],
                  ] as [string, string | undefined][]
                ).map(([label, value]) => (
                  <div key={label} className='d-flex justify-content-between mb-2'>
                    <span className='text-muted'>{label}</span>
                    <span className='fw-semibold'>{value}</span>
                  </div>
                ))}
                <div className='d-flex justify-content-between border-top pt-2 mt-2'>
                  <span className='text-muted'>ຄ່າເຮືອ</span>
                  <span className='text-success fw-bolder'>
                    {totalShipPrice.toLocaleString()} LAK
                  </span>
                </div>
              </div>
            </div>

            {selectedFoods.length > 0 && (
              <div className='card bg-light mb-4'>
                <div className='card-body py-4 px-5'>
                  <div className='fw-bold text-info mb-3'>ອາຫານ ແລະ ເຄື່ອງດື່ມ</div>
                  {selectedFoods.map((f) => (
                    <div key={f.product_id} className='d-flex justify-content-between mb-2'>
                      <span>
                        {f.name} × {f.quantity}
                      </span>
                      <span>{(f.price * f.quantity).toLocaleString()} LAK</span>
                    </div>
                  ))}
                  <div className='d-flex justify-content-between border-top pt-2 mt-2'>
                    <span className='text-muted'>ລວມຄ່າອາຫານ</span>
                    <span className='text-info fw-bolder'>
                      {totalFoodPrice.toLocaleString()} LAK
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className='card border-primary'>
              <div className='card-body py-4 px-5'>
                <div className='d-flex justify-content-between align-items-center'>
                  <span className='fw-bolder fs-5'>ລວມທັງໝົດ</span>
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
            <div className='fw-bold fs-5 mb-5'>ວິທີການຊຳລະ</div>

            {/* Method selector */}
            <div className='d-flex gap-3 mb-6' style={{ flexWrap: 'wrap' }}>
              {(
                isStaff
                  ? (['cash', 'cash+transfer', 'bcel'] as const)
                  : (['bcel'] as const)
              ).map((method) => (
                <div
                  key={method}
                  className={`card flex-fill text-center p-4 border-2 ${
                    paymentMethod === method
                      ? 'border-primary bg-light-primary'
                      : 'border-light'
                  }`}
                  onClick={() => {
                    setPaymentMethod(method)
                    setCashAmount(0)
                    setTransferAmount(0)
                    // Do NOT reset BCEL here — keep QR alive while switching tabs
                  }}
                  style={{ cursor: 'pointer', minWidth: 100 }}
                >
                  <div className='fs-1 mb-2'>
                    {method === 'cash'
                      ? '💵'
                      : method === 'bcel'
                      ? '🏦'
                      : '💵🏦'}
                  </div>
                  <div className='fw-bold fs-7'>
                    {method === 'cash'
                      ? 'ເງິນສົດ'
                      : method === 'bcel'
                      ? 'BCEL QR'
                      : 'ເງິນສົດ + ໂອນ (BCEL)'}
                  </div>
                </div>
              ))}
            </div>

            {/* Staff badge */}
            {isStaff && (
              <div className='alert alert-info d-flex align-items-center gap-2 py-3 mb-5'>
                <KTIcon iconName='shield-tick' className='fs-3 text-info' />
                <span className='fw-semibold fs-7'>
                  ຈ່າຍໜ້າເຄົາເຕີ — ບິນຈະຖືກອະນຸມັດທັນທີ (status:{' '}
                  <strong>approved</strong>)
                </span>
              </div>
            )}

            {/* ── Cash ── */}
            {paymentMethod === 'cash' && (
              <div className='p-5 rounded bg-light-warning text-center'>
                <div className='fs-2 mb-2'>💵</div>
                <div className='fw-bold fs-5'>ຊຳລະທີ່ໜ້າເຄົາເຕີ</div>
                <div className='text-muted fs-7 mt-1'>
                  ຈຳນວນທີ່ຕ້ອງຊຳລະ:{' '}
                  <strong className='text-warning'>
                    {grandTotal.toLocaleString()} LAK
                  </strong>
                </div>
              </div>
            )}

            {/* ── Cash + Transfer (staff only, transfer via BCEL QR) ── */}
            {paymentMethod === 'cash+transfer' && isStaff && (
              <div>
                <div className='p-5 rounded border border-primary mb-4'>
                  <div className='fw-bold fs-6 mb-4 text-primary text-center'>
                    💵🏦 ຊຳລະແບບ (ເງິນສົດ + ໂອນຜ່ານ BCEL)
                  </div>
                  <div className='text-center mb-4'>
                    <span className='badge badge-light-primary fs-6 px-4 py-2'>
                      ຍອດລວມ: {grandTotal.toLocaleString()} LAK
                    </span>
                  </div>
                  <div className='row g-4 mb-3'>
                    <div className='col-6'>
                      <label className='fw-bold fs-7 mb-2 d-block'>💵 ເງິນສົດ (LAK)</label>
                      <input
                        type='number'
                        className='form-control form-control-solid'
                        min={0}
                        max={grandTotal}
                        value={cashAmount || ''}
                        placeholder='0'
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0)
                          setCashAmount(val)
                          setTransferAmount(Math.max(0, grandTotal - val))
                        }}
                      />
                    </div>
                    <div className='col-6'>
                      <label className='fw-bold fs-7 mb-2 d-block'>🏦 ໂອນຜ່ານ BCEL (LAK)</label>
                      <input
                        type='number'
                        className='form-control form-control-solid'
                        min={0}
                        max={grandTotal}
                        value={transferAmount || ''}
                        placeholder='0'
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0)
                          setTransferAmount(val)
                          setCashAmount(Math.max(0, grandTotal - val))
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded text-center fs-7 fw-bold ${
                      cashAmount + transferAmount === grandTotal
                        ? 'bg-light-success text-success'
                        : 'bg-light-danger text-danger'
                    }`}
                  >
                    {cashAmount + transferAmount === grandTotal ? (
                      <>
                        <KTIcon iconName='check-circle' className='fs-4 me-1' />
                        ຈຳນວນຖືກຕ້ອງ ✓
                      </>
                    ) : (
                      <>
                        ລວມ {(cashAmount + transferAmount).toLocaleString()} LAK — ຍັງຂາດ / ເກີນ{' '}
                        {Math.abs(grandTotal - cashAmount - transferAmount).toLocaleString()} LAK
                      </>
                    )}
                  </div>
                </div>

                {/* BCEL QR for the transfer portion */}
                {transferAmount > 0 && cashAmount + transferAmount === grandTotal && (
                  <div className='p-4 rounded border border-2 border-dashed border-primary'>
                    <div className='fw-bold fs-7 mb-3 text-center text-primary'>
                      ສ້າງ BCEL QR ສຳຫຼັບສ່ວນທີ່ໂອນ
                    </div>
                    {renderBcelPanel(`ໂອນຜ່ານ BCEL ສ່ວນທີ່ເຫຼືອ`)}
                  </div>
                )}
                {transferAmount > 0 && cashAmount + transferAmount !== grandTotal && (
                  <div className='alert alert-warning py-2 fs-7 text-center'>
                    ປ້ອນຈຳນວນເງິນສົດ + ໂອນໃຫ້ຄົບກ່ອນສ້າງ QR
                  </div>
                )}
              </div>
            )}

            {/* ── BCEL QR Pay ── */}
            {paymentMethod === 'bcel' && renderBcelPanel('ຊຳລະຜ່ານ BCEL QR (phajay)')}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className='modal-footer'>
        <button
          type='button'
          className='btn btn-light'
          disabled={loading}
          onClick={currentStep === 1 ? () => setItemIdForUpdate(undefined) : prevStep}
        >
          {currentStep === 1 ? (
            'ຍົກເລີກ'
          ) : (
            <>
              <KTIcon iconName='arrow-left' className='fs-4 me-1' /> ກັບຄືນ
            </>
          )}
        </button>

        {currentStep < STEPS.length ? (
          <button type='button' className='btn btn-primary' onClick={nextStep}>
            ຕໍ່ໄປ <KTIcon iconName='arrow-right' className='fs-4 ms-1' />
          </button>
        ) : (
          <button
            type='button'
            className='btn btn-success'
            onClick={handleSave}
            disabled={
              loading ||
              (isStaff &&
                paymentMethod === 'cash+transfer' &&
                cashAmount + transferAmount !== grandTotal) ||
              (isStaff &&
                paymentMethod === 'cash+transfer' &&
                transferAmount > 0 &&
                bcelStatus !== 'paid') ||
              (paymentMethod === 'bcel' && bcelStatus !== 'paid')
            }
          >
            {loading ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' />
                ກຳລັງບັນທຶກ...
              </>
            ) : (
              <>
                <KTIcon iconName='check' className='fs-4 me-1' /> ຢືນຢັນການຈອງ
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export { BookingShipEditModalForm }