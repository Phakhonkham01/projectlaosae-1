import React, {useEffect, useMemo, useState} from 'react'
import {collection, getDocs, orderBy, query} from 'firebase/firestore'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import {Bar, Bubble, Doughnut} from 'react-chartjs-2'
import {db} from '../../../../../firebase/useFirebase'
import {systemMode, useThemeMode} from '../../../_metronic/partials/layout/theme-mode/ThemeModeProvider'
import {useAuth} from '../../modules/auth'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Tooltip, Legend)

type DashboardRole = 'customer' | 'employee' | 'owner' | 'admin' | 'user'
type PaymentStatus = 'pending' | 'approved' | 'rejected'

interface AppUser {
  id: string
  _id?: string
  user_name?: string
  user_email?: string
  name?: string
  email?: string
  role?: DashboardRole | string
  status?: string
}

interface FoodItem {
  product_id?: string
  name?: string
  price?: number
  quantity?: number
  image?: string
}

interface BookingItem {
  id: string
  booking_date?: string
  booking_time?: string
  createdAt?: unknown
  foods?: FoodItem[]
  grand_total?: number
  num_hours?: number
  num_people?: number
  payment_method?: string
  payment_status?: PaymentStatus | string
  reject_reason?: string
  ship_id?: string
  ship_name?: string
  ship_price_per_hour?: number
  status?: string
  total_food_price?: number
  total_ship_price?: number
  user_email?: string
  user_id?: string
  user_name?: string
  customer_name?: string
  customer_phone?: string
  booked_by_name?: string
  booked_by_role?: string
}

interface CategoryItem {
  id: string
  category_id?: string
  name?: string
}

interface ProductItem {
  id: string
  product_id?: string
  name?: string
  price?: number
  availability?: boolean
  image?: string
  category_id?: string
}

interface ShipItem {
  id: string
  name?: string
  ship_name?: string
  capacity?: number
  price?: number
  quantity?: number
  status?: string
  image_url?: string
}

const TEAL = '#00b89f'
const TEAL_DARK = '#008f83'
const AMBER = '#f5a623'
const NAVY = 'var(--dashboard-text-main)'
const GRID = 'var(--dashboard-grid)'

const emptyChartLabel = 'ບໍ່ມີຂໍ້ມູນ'

const normalizeRole = (role?: string): DashboardRole => {
  const current = role?.toLowerCase()
  if (current === 'owner') return 'owner'
  if (current === 'admin') return 'admin'
  if (current === 'employee') return 'employee'
  if (current === 'customer') return 'customer'
  return 'user'
}

const parseDateValue = (value: unknown): Date | null => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof value === 'object' && value !== null) {
    const firestoreDate = value as {seconds?: number; toDate?: () => Date}
    if (typeof firestoreDate.toDate === 'function') return firestoreDate.toDate()
    if (typeof firestoreDate.seconds === 'number') return new Date(firestoreDate.seconds * 1000)
  }
  return null
}

const formatCurrency = (value?: number) => `${(value || 0).toLocaleString()} LAK`

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('lo-LA', {day: '2-digit', month: 'short', year: 'numeric'}).format(date)
}

const getBookingDate = (booking: BookingItem) => parseDateValue(booking.createdAt) || parseDateValue(booking.booking_date)

// bill + history_booking ໄດ້ຖືກລວມເປັນ collection `booking` ອັນດຽວແລ້ວ. bills ແລະ
// historyBookings ຈຶ່ງມາຈາກຊຸດຂໍ້ມູນດຽວກັນ — dedupe ດ້ວຍ content key ເພື່ອບໍ່ໃຫ້ນັບຊ້ຳ.
const getBookingKey = (booking: BookingItem) => {
  const createdAt = getBookingDate(booking)
  return [
    booking.user_id || booking.user_email || '',
    booking.ship_id || booking.ship_name || '',
    booking.booking_date || '',
    booking.booking_time || '',
    booking.grand_total ?? '',
    createdAt ? createdAt.getTime() : '',
  ].join('|')
}

// Keeps a single copy per logical booking. `bill` is processed last so its (live)
// payment_status wins when the same booking exists in both collections.
const dedupeBookings = (history: BookingItem[], bills: BookingItem[]) => {
  const map = new Map<string, BookingItem>()
  for (const booking of [...history, ...bills]) {
    map.set(getBookingKey(booking), booking)
  }
  return Array.from(map.values())
}

const isActive = (status?: string) => ['active', 'available', 'work day'].includes((status || '').toLowerCase())

// ສະຖານະ "ສົ່ງກວດອີກຄັ້ງ" (re_submitted) ຖືກລົບອອກ — ຂໍ້ມູນເກົ່າຖືກນັບເປັນ pending
const normalizeStatus = (status?: string) => {
  const s = (status || '').toLowerCase().trim().replace(/[\s-]+/g, '_')
  if (s === 're_submitted' || s === 'slip_submitted') return 'pending'
  return s
}
const isRejectedStatus = (status?: string) => normalizeStatus(status) === 'rejected'

const pendingStatuses = ['pending']
// 'used' = ລູກຄ້າເຂົ້າມາໃຊ້ງານແລ້ວ (ຕໍ່ຈາກ approved) — ຍັງນັບເປັນຊຳລະແລ້ວ/ລາຍຮັບ
const paidStatuses = ['approved', 'used']

const paymentStatusLabels: Record<string, string> = {
  pending: 'ລໍຖ້າຊຳລະ',
  approved: 'ຊຳລະແລ້ວ',
  used: 'ເຂົ້າມາໃຊ້ງານສຳເລັດ',
  rejected: 'ປະຕິເສດ',
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'ເງິນສົດ',
  'cash+transfer': 'ເງິນສົດ + ໂອນ (BCEL)',
  bcel: 'BCEL QR',
}

const roleLabels: Record<DashboardRole, string> = {
  customer: 'ລູກຄ້າ',
  employee: 'ພະນັກງານ',
  owner: 'ເຈົ້າຂອງ',
  admin: 'ຜູ້ດູແລ',
  user: 'ຜູ້ໃຊ້',
}

const getPaymentStatusLabel = (status?: string) => {
  const key = normalizeStatus(status) || 'pending'
  return paymentStatusLabels[key] || status || paymentStatusLabels.pending
}

const getPaymentMethodLabel = (method?: string) => {
  if (!method) return '-'
  return paymentMethodLabels[method.toLowerCase()] || method
}

const getPaymentBadgeStyle = (status?: string): React.CSSProperties => {
  const current = normalizeStatus(status) || 'pending'
  if (current === 'approved') return {background: '#e6f9f4', color: '#00876b'}
  if (current === 'used') return {background: '#e7f0ff', color: '#2b57c9'}
  if (current === 'rejected') return {background: '#fdeaea', color: '#c0392b'}
  return {background: '#fef6e0', color: '#b56a00'}
}

const compactNumber = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${Math.round(value / 1000)}K`
  return `${value}`
}

const Sparkline = ({points, color = '#fff'}: {points: number[]; color?: string}) => {
  const width = 120
  const height = 46
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const step = width / Math.max(points.length - 1, 1)
  const coords = points
    .map((point, index) => `${index * step},${height - ((point - min) / range) * (height - 8) - 4}`)
    .join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={sparkStyle}>
      <polyline points={coords} fill='none' stroke={color} strokeWidth={2} strokeLinejoin='round' />
    </svg>
  )
}

const Gauge = ({value, max}: {value: number; max: number}) => {
  const radius = 70
  const cx = 80
  const cy = 90
  const start = Math.PI
  const end = 2 * Math.PI
  const fill = start + Math.min(value / Math.max(max, 1), 1) * (end - start)

  const point = (angle: number) => ({x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle)})
  const arc = (from: number, to: number) => {
    const a = point(from)
    const b = point(to)
    return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${to - from > Math.PI ? 1 : 0} 1 ${b.x} ${b.y}`
  }

  return (
    <svg viewBox='0 0 160 104' width='160' height='104'>
      <defs>
        <linearGradient id='dashboardGauge' x1='0%' y1='0%' x2='100%' y2='0%'>
          <stop offset='0%' stopColor={TEAL} />
          <stop offset='55%' stopColor={AMBER} />
          <stop offset='100%' stopColor='#e05252' />
        </linearGradient>
      </defs>
      <path d={arc(start, end)} fill='none' stroke={GRID} strokeWidth={14} strokeLinecap='round' />
      <path d={arc(start, fill)} fill='none' stroke='url(#dashboardGauge)' strokeWidth={14} strokeLinecap='round' />
      <text x={cx} y={84} textAnchor='middle' fontSize={26} fontWeight={700} fill={NAVY}>
        {value}
      </text>
      <text x={cx} y={101} textAnchor='middle' fontSize={10} fill='var(--dashboard-text-muted)'>
        ຈາກ {max}
      </text>
    </svg>
  )
}

interface KpiTileProps {
  label: string
  value: string | number
  sub: string
  variant: 'teal' | 'dark' | 'amber' | 'white' | 'gauge'
  sparkPoints?: number[]
  gaugeValue?: number
  gaugeMax?: number
  subLarge?: boolean
}

const KpiTile = ({label, value, sub, variant, sparkPoints, gaugeValue, gaugeMax = 100, subLarge}: KpiTileProps) => {
  const bg = {
    teal: TEAL,
    dark: TEAL_DARK,
    amber: AMBER,
    white: 'var(--dashboard-card-bg)',
    gauge: 'var(--dashboard-card-bg)',
  }[variant]
  const bright = variant !== 'white' && variant !== 'gauge'

  return (
    <div style={{...kpiStyle, background: bg, border: bright ? 'none' : '1px solid var(--dashboard-border)'}}>
      <div style={{fontSize: 11, fontWeight: 700, color: bright ? 'rgba(255,255,255,.78)' : 'var(--dashboard-text-muted)'}}>
        {label}
      </div>
      {variant === 'gauge' ? (
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 8}}>
          <Gauge value={gaugeValue || 0} max={gaugeMax} />
        </div>
      ) : (
        <>
          <div style={{fontSize: 30, fontWeight: 800, color: bright ? '#fff' : NAVY, lineHeight: 1.1}}>{value}</div>
          <div
            style={{
              fontSize: subLarge ? 16 : 12,
              fontWeight: subLarge ? 700 : 400,
              color: bright
                ? subLarge
                  ? '#fff'
                  : 'rgba(255,255,255,.78)'
                : subLarge
                ? 'var(--dashboard-text-soft)'
                : 'var(--dashboard-text-muted)',
            }}
          >
            {sub}
          </div>
        </>
      )}
      {sparkPoints && <Sparkline points={sparkPoints} color={bright ? '#fff' : TEAL} />}
    </div>
  )
}

const Card = ({children, style}: {children: React.ReactNode; style?: React.CSSProperties}) => (
  <div style={{...cardStyle, ...style}}>{children}</div>
)

const CardTitle = ({children}: {children: React.ReactNode}) => <div style={cardTitleStyle}>{children}</div>

const LegendDot = ({color, label}: {color: string; label: string}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--dashboard-text-muted)'}}>
    <span style={{width: 9, height: 9, borderRadius: 3, background: color, display: 'inline-block'}} />
    {label}
  </span>
)

const StatusBadge = ({status}: {status?: string}) => (
  <span style={{...badgeStyle, ...getPaymentBadgeStyle(status)}}>{getPaymentStatusLabel(status)}</span>
)

const Dashboard = () => {
  const {currentUser} = useAuth()
  const {mode} = useThemeMode()
  const calculatedMode = mode === 'system' ? systemMode : mode
  const isDarkMode = calculatedMode === 'dark'
  const currentRole = normalizeRole(currentUser?.role)

  const [users, setUsers] = useState<AppUser[]>([])
  const [bills, setBills] = useState<BookingItem[]>([])
  const [historyBookings, setHistoryBookings] = useState<BookingItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [ships, setShips] = useState<ShipItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [usersSnap, bookingSnap, categoriesSnap, productsSnap, shipsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(query(collection(db, 'booking'), orderBy('createdAt', 'desc'))),
          getDocs(collection(db, 'categories')),
          getDocs(collection(db, 'products')),
          getDocs(query(collection(db, 'ship'), orderBy('createdAt', 'desc'))),
        ])

        // bill + history_booking ຖືກລວມເປັນ collection ດຽວ `booking` ແລ້ວ —
        // ໃຊ້ຊຸດຂໍ້ມູນດຽວກັນທັງ bills ແລະ historyBookings (dedupe ດ້ານລຸ່ມຈະ collapse ໃຫ້ເຫຼືອອັນດຽວ)
        const bookingItems = bookingSnap.docs.map((doc) => ({id: doc.id, ...doc.data()}) as BookingItem)
        setUsers(usersSnap.docs.map((doc) => ({id: doc.id, _id: doc.id, ...doc.data()}) as AppUser))
        setBills(bookingItems)
        setHistoryBookings(bookingItems)
        setCategories(categoriesSnap.docs.map((doc) => ({id: doc.id, category_id: doc.id, ...doc.data()}) as CategoryItem))
        setProducts(productsSnap.docs.map((doc) => ({id: doc.id, product_id: doc.id, ...doc.data()}) as ProductItem))
        setShips(shipsSnap.docs.map((doc) => ({id: doc.id, ...doc.data()}) as ShipItem))
      } catch (fetchError) {
        console.error(fetchError)
        setError('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນ Dashboard ໄດ້. ກະລຸນາລອງໃໝ່.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const dashboardData = useMemo(() => {
    const allBookings = dedupeBookings(historyBookings, bills)
    // ໃບບິນທີ່ຖືກປະຕິເສດ ບໍ່ນັບລວມໃນສະຖິຕິ ແລະ ຖືກແຍກສະແດງຕ່າງຫາກ
    const activeBookings = allBookings.filter((booking) => !isRejectedStatus(booking.payment_status))
    const rejectedBookings = allBookings
      .filter((booking) => isRejectedStatus(booking.payment_status))
      .sort((a, b) => (getBookingDate(b)?.getTime() || 0) - (getBookingDate(a)?.getTime() || 0))
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const todayIso = now.toISOString().slice(0, 10)
    const currentUserId = currentUser?._id || ''
    const currentUserEmail = (currentUser?.user_email || '').toLowerCase()

    const sortedBills = [...bills].sort((a, b) => (getBookingDate(b)?.getTime() || 0) - (getBookingDate(a)?.getTime() || 0))
    const sortedHistory = [...historyBookings].sort(
      (a, b) => (getBookingDate(b)?.getTime() || 0) - (getBookingDate(a)?.getTime() || 0)
    )
    const approvedHistory = historyBookings.filter((booking) => paidStatuses.includes(normalizeStatus(booking.payment_status)))
    const monthlyApproved = approvedHistory.filter((booking) => {
      const date = getBookingDate(booking)
      return date ? date >= startOfMonth : false
    })

    const myBills = bills.filter(
      (booking) => booking.user_id === currentUserId || booking.user_email?.toLowerCase() === currentUserEmail
    )
    const myHistory = historyBookings.filter(
      (booking) => booking.user_id === currentUserId || booking.user_email?.toLowerCase() === currentUserEmail
    )
    const myBookingsAll = dedupeBookings(myHistory, myBills).sort(
      (a, b) => (getBookingDate(b)?.getTime() || 0) - (getBookingDate(a)?.getTime() || 0)
    )
    const myBookings = myBookingsAll.filter((booking) => !isRejectedStatus(booking.payment_status))
    const myRejectedBookings = myBookingsAll.filter((booking) => isRejectedStatus(booking.payment_status))

    const totalRevenue = approvedHistory.reduce((sum, booking) => sum + (booking.grand_total || 0), 0)
    const monthlyRevenue = monthlyApproved.reduce((sum, booking) => sum + (booking.grand_total || 0), 0)
    const todayRevenue = approvedHistory
      .filter((booking) => booking.booking_date === todayIso)
      .reduce((sum, booking) => sum + (booking.grand_total || 0), 0)

    // Revenue by payment method (approved only)
    const revenueByMethod = approvedHistory.reduce<Record<string, number>>((acc, booking) => {
      const k = (booking.payment_method || 'unknown').toLowerCase()
      acc[k] = (acc[k] || 0) + (booking.grand_total || 0)
      return acc
    }, {})

    const pendingPayments = bills.filter((booking) => pendingStatuses.includes(normalizeStatus(booking.payment_status)))
    const todayBookings = activeBookings.filter((booking) => booking.booking_date === todayIso)
    const totalCustomers = users.filter((user) => normalizeRole(user.role) === 'customer').length
    const activeUsers = users.filter((user) => isActive(user.status)).length
    const availableProducts = products.filter((product) => product.availability !== false).length
    const activeShips = ships.filter((ship) => isActive(ship.status)).length
    const soldOutShips = ships.filter((ship) => (ship.quantity ?? 0) <= 0).length
    const availableShips = ships.filter((ship) => (ship.status || '').toLowerCase() === 'active').length
    const shipCapacity = ships.reduce((sum, ship) => sum + (ship.capacity || 0) * Math.max(ship.quantity || 1, 1), 0)

    const categoryLookup = categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = category.name || '-'
      if (category.category_id) acc[category.category_id] = category.name || '-'
      return acc
    }, {})

    const productSales = activeBookings.flatMap((booking) => booking.foods || []).reduce<Record<string, {name: string; total: number; qty: number}>>(
      (acc, food) => {
        const key = food.product_id || food.name || 'unknown'
        if (!acc[key]) acc[key] = {name: food.name || 'ອາຫານ', total: 0, qty: 0}
        acc[key].qty += food.quantity || 0
        acc[key].total += (food.price || 0) * (food.quantity || 0)
        return acc
      },
      {}
    )

    const topFoods = Object.values(productSales).sort((a, b) => b.total - a.total).slice(0, 5)

    const categorySales = activeBookings
      .flatMap((booking) => booking.foods || [])
      .reduce<Record<string, number>>((acc, food) => {
        const product = products.find((item) => item.product_id === food.product_id || item.id === food.product_id)
        const category = product?.category_id ? categoryLookup[product.category_id] || 'ອື່ນໆ' : 'ອື່ນໆ'
        acc[category] = (acc[category] || 0) + (food.price || 0) * (food.quantity || 0)
        return acc
      }, {})

    const shipSales = activeBookings.reduce<Record<string, {total: number; count: number; people: number}>>((acc, booking) => {
      const key = booking.ship_name || 'ບໍ່ລະບຸເຮືອ'
      if (!acc[key]) acc[key] = {total: 0, count: 0, people: 0}
      acc[key].total += booking.grand_total || 0
      acc[key].count += 1
      acc[key].people += booking.num_people || 0
      return acc
    }, {})

    const topShips = Object.entries(shipSales)
      .map(([name, stats]) => ({name, ...stats}))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)

    const customerRanking = historyBookings.reduce<Record<string, number>>((acc, booking) => {
      const key = booking.customer_name || booking.user_name || booking.user_email || 'ລູກຄ້າ'
      acc[key] = (acc[key] || 0) + (booking.grand_total || 0)
      return acc
    }, {})

    const rankedCustomers = Object.entries(customerRanking).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const customerTotalSpent = myHistory.reduce((sum, booking) => sum + (booking.grand_total || 0), 0)
    const customerPendingBills = myBills.filter((booking) => pendingStatuses.includes(normalizeStatus(booking.payment_status)))
    const customerApprovedBookings = myHistory.filter((booking) => paidStatuses.includes(normalizeStatus(booking.payment_status))).length

    return {
      totalBookings: activeBookings.length,
      sortedBills,
      sortedHistory: sortedHistory.filter((booking) => !isRejectedStatus(booking.payment_status)),
      rejectedBookings,
      myBookings,
      myRejectedBookings,
      myHistory,
      myBills,
      totalRevenue,
      monthlyRevenue,
      todayRevenue,
      revenueByMethod,
      pendingPayments,
      todayBookings,
      totalCustomers,
      activeUsers,
      availableProducts,
      activeShips,
      availableShips,
      soldOutShips,
      shipCapacity,
      topFoods,
      categorySales,
      topShips,
      rankedCustomers,
      customerTotalSpent,
      customerPendingBills,
      customerApprovedBookings,
    }
  }, [bills, categories, currentUser?._id, currentUser?.user_email, historyBookings, products, ships, users])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {display: false},
      tooltip: {
        backgroundColor: isDarkMode ? '#0f172a' : '#1a2340',
        padding: 10,
        titleFont: {size: 12},
        bodyFont: {size: 12},
      },
    },
    scales: {
      x: {grid: {display: false}, ticks: {color: isDarkMode ? '#9aa3b6' : '#7a8499', font: {size: 11}}},
      y: {
        grid: {color: isDarkMode ? '#2a3144' : '#edf0f5'},
        ticks: {
          color: isDarkMode ? '#9aa3b6' : '#7a8499',
          font: {size: 11},
          callback: (value: unknown) => compactNumber(Number(value)),
        },
      },
    },
  }

  const shipChartData = {
    labels: dashboardData.topShips.length ? dashboardData.topShips.map((ship) => ship.name) : [emptyChartLabel],
    datasets: [
      {
        label: 'ລາຍຮັບ',
        data: dashboardData.topShips.length ? dashboardData.topShips.map((ship) => ship.total) : [0],
        backgroundColor: TEAL,
        borderRadius: 5,
      },
      {
        label: 'ຈຳນວນການຈອງ',
        data: dashboardData.topShips.length ? dashboardData.topShips.map((ship) => ship.count) : [0],
        backgroundColor: AMBER,
        borderRadius: 5,
      },
    ],
  }

  const categoryEntries = Object.entries(dashboardData.categorySales).sort((a, b) => b[1] - a[1]).slice(0, 4)
  const categoryTotal = categoryEntries.reduce((sum, [, value]) => sum + value, 0)
  const donutData = {
    labels: categoryEntries.length ? categoryEntries.map(([name]) => name) : [emptyChartLabel],
    datasets: [
      {
        data: categoryEntries.length ? categoryEntries.map(([, value]) => value) : [1],
        backgroundColor: [TEAL, TEAL_DARK, AMBER, '#e07b3a'],
        borderColor: isDarkMode ? '#1e1e2d' : '#fff',
        borderWidth: 2,
      },
    ],
  }

  const bubbleData = {
    datasets: [
      {
        label: 'ການຈອງ',
        data: dashboardData.topShips.length
          ? dashboardData.topShips.map((ship, index) => ({
              x: index + 1,
              y: Math.max(ship.people, 1),
              r: Math.max(6, Math.min(22, ship.count * 4)),
            }))
          : [{x: 1, y: 1, r: 6}],
        backgroundColor: `${AMBER}cc`,
      },
      {
        label: 'ລາຍຮັບ',
        data: dashboardData.topShips.length
          ? dashboardData.topShips.map((ship, index) => ({
              x: index + 1,
              y: Math.max(Math.round(ship.total / 100000), 1),
              r: Math.max(6, Math.min(24, ship.total / 100000)),
            }))
          : [{x: 1, y: 1, r: 6}],
        backgroundColor: `${TEAL}bb`,
      },
    ],
  }

  const foodChartData = {
    labels: dashboardData.topFoods.length ? dashboardData.topFoods.map((food) => food.name) : [emptyChartLabel],
    datasets: [
      {
        data: dashboardData.topFoods.length ? dashboardData.topFoods.map((food) => food.total) : [0],
        backgroundColor: [TEAL, AMBER, NAVY, TEAL_DARK, '#e07b3a'],
        borderRadius: 5,
      },
    ],
  }

  const renderCustomerDashboard = () => (
    <>
      <div style={kpiGridStyle}>
        <KpiTile label='ການຈອງທັງໝົດ' value={dashboardData.myBookings.length} sub='ລາຍການຂອງຂ້ອຍ' variant='teal' sparkPoints={[1, 2, 1, 3, 2, 4, 3]} />
        <KpiTile label='ລໍຖ້າຊຳລະ' value={dashboardData.customerPendingBills.length} sub='ລາຍການຕ້ອງກວດສອບ' variant='amber' sparkPoints={[3, 2, 4, 2, 5, 3, 4]} />
        <KpiTile label='ຍອດໃຊ້ຈ່າຍ' value={formatCurrency(dashboardData.customerTotalSpent)} sub='ການຈອງທີ່ອະນຸມັດ' variant='dark' sparkPoints={[1, 3, 2, 5, 4, 6, 5]} />
        <KpiTile label='ສຳເລັດແລ້ວ' value={dashboardData.customerApprovedBookings} sub='ການຈອງ' variant='white' sparkPoints={[2, 3, 4, 4, 5, 6, 7]} />
      </div>

      <div style={twoColumnStyle}>
        <Card>
          <CardTitle>ປະຫວັດການຈອງລ່າສຸດ</CardTitle>
          {dashboardData.myBookings.length === 0 ? (
            <EmptyState text='ຍັງບໍ່ມີການຈອງ' />
          ) : (
            <div style={stackStyle}>
              {dashboardData.myBookings.slice(0, 6).map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </Card>

        <div style={stackStyle}>
          <Card>
            <CardTitle>ສະຫຼຸບຂອງຂ້ອຍ</CardTitle>
            <MetricLine label='ການຈອງປັດຈຸບັນ' value={dashboardData.myBills.length} />
            <MetricLine label='ປະຫວັດທັງໝົດ' value={dashboardData.myHistory.length} />
            <MetricLine label='ອະນຸມັດແລ້ວ' value={dashboardData.customerApprovedBookings} />
            <MetricLine label='ຍອດເງິນລວມ' value={formatCurrency(dashboardData.customerTotalSpent)} />
          </Card>

          <Card>
            <CardTitle>ອາຫານທີ່ເຄີຍສັ່ງ</CardTitle>
            {dashboardData.myHistory.flatMap((booking) => booking.foods || []).length === 0 ? (
              <EmptyState text='ຍັງບໍ່ມີອາຫານໃນປະຫວັດ' compact />
            ) : (
              <div style={stackStyle}>
                {dashboardData.myHistory
                  .flatMap((booking) => booking.foods || [])
                  .slice(0, 5)
                  .map((food, index) => (
                    <FoodLine key={`${food.product_id || food.name}-${index}`} food={food} />
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {dashboardData.myRejectedBookings.length > 0 && (
        <Card>
          <CardTitle>ການຈອງທີ່ຖືກປະຕິເສດ ({dashboardData.myRejectedBookings.length})</CardTitle>
          <div style={stackStyle}>
            {dashboardData.myRejectedBookings.slice(0, 6).map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </Card>
      )}
    </>
  )

  const renderStaffDashboard = () => (
    <>
      <div style={kpiGridStyle}>
        <KpiTile
          label='ລາຍຮັບເດືອນນີ້'
          value={formatCurrency(dashboardData.monthlyRevenue)}
          sub={`ມື້ນີ້: ${formatCurrency(dashboardData.todayRevenue)}`}
          variant='teal'
          subLarge
          sparkPoints={[1, 4, 3, 6, 5, 8, 9]}
        />
        <KpiTile
          label='ລາຍຮັບລວມທັງໝົດ'
          value={formatCurrency(dashboardData.totalRevenue)}
          sub={`ບິນຊຳລະແລ້ວ ${historyBookings.filter((b) => paidStatuses.includes((b.payment_status || '').toLowerCase())).length} ບິນ`}
          variant='dark'
          sparkPoints={[1, 3, 2, 5, 4, 6, 5]}
        />
        <KpiTile
          label='ລູກຄ້າທັງໝົດ'
          value={dashboardData.totalCustomers}
          sub='ຈຳນວນລູກຄ້າທັງໝົດ'
          variant='amber'
          sparkPoints={[6, 4, 7, 5, 8, 4, 6]}
        />
        <KpiTile
          label='ເຮືອພ້ອມໃຫ້ບໍລິການ'
          value={`${dashboardData.availableShips}/${ships.length}`}
          sub={dashboardData.soldOutShips > 0 ? `🚫 ຈອງເຕັມ ${dashboardData.soldOutShips} ລຳ` : 'ທຸກເຮືອພ້ອມ'}
          variant='gauge'
          gaugeValue={dashboardData.availableShips}
          gaugeMax={Math.max(ships.length, 1)}
        />
      </div>

      <div style={chartRowStyle}>
        <Card>
          <div style={cardHeaderSplitStyle}>
            <div>
              <CardTitle>ລາຍຮັບຕາມເຮືອ</CardTitle>
              <div style={subtitleStyle}>
                ລວມ {dashboardData.totalBookings} ການຈອງ ຈາກ {dashboardData.topShips.length} ເຮືອ
              </div>
            </div>
            <div style={pillStyle}>{formatCurrency(dashboardData.totalRevenue)}</div>
          </div>
          <div style={legendRowStyle}>
            <LegendDot color={TEAL} label='ລາຍຮັບ' />
            <LegendDot color={AMBER} label='ຈຳນວນການຈອງ' />
          </div>
          <div style={{height: 240}}>
            <Bar data={shipChartData} options={chartOptions} />
          </div>
        </Card>

        <Card style={{padding: '18px 14px'}}>
          <CardTitle>ເຮືອຂາຍດີ</CardTitle>
          {dashboardData.topShips.length === 0 ? (
            <EmptyState text='ຍັງບໍ່ມີການຈອງ' compact />
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ເຮືອ</th>
                  <th style={{...thStyle, textAlign: 'center'}}>ຈອງ</th>
                  <th style={{...thStyle, textAlign: 'right'}}>ລາຍຮັບ</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.topShips.slice(0, 6).map((ship) => (
                  <tr key={ship.name} style={{borderBottom: '1px solid var(--dashboard-grid)'}}>
                    <td style={{...tdStyle, fontWeight: 700, color: NAVY}}>{ship.name}</td>
                    <td style={{...tdStyle, textAlign: 'center'}}>
                      <span style={{...badgeStyle, background: `${TEAL}18`, color: TEAL}}>{ship.count}</span>
                    </td>
                    <td style={{...tdStyle, textAlign: 'right', fontWeight: 700, color: TEAL_DARK}}>{compactNumber(ship.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div style={threeColumnStyle}>
        <Card>
          <CardTitle>ລາຍຮັບຕາມໝວດອາຫານ</CardTitle>
          <div style={legendRowStyle}>
            {categoryEntries.length === 0 ? (
              <LegendDot color={TEAL} label={emptyChartLabel} />
            ) : (
              categoryEntries.map(([name, value], index) => (
                <LegendDot
                  key={name}
                  color={[TEAL, TEAL_DARK, AMBER, '#e07b3a'][index]}
                  label={`${name} ${categoryTotal ? Math.round((value / categoryTotal) * 100) : 0}%`}
                />
              ))
            )}
          </div>
          <div style={{height: 190}}>
            <Doughnut data={donutData} options={{...chartOptions, cutout: '62%', scales: undefined}} />
          </div>
        </Card>

        <Card>
          <CardTitle>ກິດຈະກຳການຈອງ</CardTitle>
          <div style={legendRowStyle}>
            <LegendDot color={AMBER} label='ຈຳນວນຄົນ' />
            <LegendDot color={TEAL} label='ລາຍຮັບ' />
          </div>
          <div style={{height: 190}}>
            <Bubble
              data={bubbleData}
              options={{
                ...chartOptions,
                scales: {
                  x: {grid: {display: false}, ticks: {display: false}},
                  y: {grid: {color: isDarkMode ? '#2a3144' : '#edf0f5'}, ticks: {color: isDarkMode ? '#9aa3b6' : '#7a8499', font: {size: 11}}},
                },
              }}
            />
          </div>
        </Card>

        <Card>
          <CardTitle>ອາຫານຂາຍດີ</CardTitle>
          <div style={{height: 190}}>
            <Bar
              data={foodChartData}
              options={{
                ...chartOptions,
                indexAxis: 'y',
                scales: {
                  x: {
                    grid: {color: isDarkMode ? '#2a3144' : '#edf0f5'},
                    ticks: {
                      color: isDarkMode ? '#9aa3b6' : '#7a8499',
                      font: {size: 11},
                      callback: (value: unknown) => compactNumber(Number(value)),
                    },
                  },
                  y: {grid: {display: false}, ticks: {color: isDarkMode ? '#9aa3b6' : '#7a8499', font: {size: 11}}},
                },
              }}
            />
          </div>
        </Card>
      </div>

      <div style={bottomRowStyle}>
        <Card>
          <CardTitle>ການຈອງລ່າສຸດ</CardTitle>
          {dashboardData.sortedHistory.length === 0 ? (
            <EmptyState text='ຍັງບໍ່ມີປະຫວັດການຈອງ' />
          ) : (
            <div style={stackStyle}>
              {dashboardData.sortedHistory.slice(0, 5).map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </Card>

        <div style={stackStyle}>
          <Card>
            <CardTitle>ສະຫຼຸບຂໍ້ມູນລະບົບ</CardTitle>
            <MetricLine label='ລູກຄ້າທັງໝົດ' value={dashboardData.totalCustomers} color={TEAL} />
            <MetricLine label='ສິນຄ້າພ້ອມຂາຍ' value={`${dashboardData.availableProducts}/${products.length}`} color='#00876b' />
            <MetricLine label='ໝວດສິນຄ້າ' value={categories.length} color={TEAL_DARK} />
            <MetricLine label='ເຮືອພ້ອມໃຫ້ຈອງ' value={`${dashboardData.availableShips}/${ships.length}`} color={AMBER} />
            <MetricLine label='ເຮືອຖືກຈອງໝົດ' value={dashboardData.soldOutShips} color='#c0392b' />
            <MetricLine label='ການຈອງມື້ນີ້' value={dashboardData.todayBookings.length} color='#e07b3a' />
          </Card>

          <Card>
            <CardTitle>ລາຍຮັບຕາມວິທີຊຳລະ</CardTitle>
            {Object.keys(dashboardData.revenueByMethod).length === 0 ? (
              <EmptyState text='ຍັງບໍ່ມີຂໍ້ມູນ' compact />
            ) : (
              <>
                {Object.entries(dashboardData.revenueByMethod)
                  .sort((a, b) => b[1] - a[1])
                  .map(([method, total]) => (
                    <MetricLine
                      key={method}
                      label={getPaymentMethodLabel(method)}
                      value={formatCurrency(total)}
                      color={method === 'bcel' ? TEAL_DARK : method === 'cash' ? AMBER : TEAL}
                    />
                  ))}
                <div style={{marginTop: 10, fontSize: 12, color: 'var(--dashboard-text-muted)'}}>
                  💡 ເບິ່ງລາຍງານລະອຽດທີ່ <strong>ລາຍງານລາຍຮັບ</strong>
                </div>
              </>
            )}
          </Card>

          <Card>
            <CardTitle>ລູກຄ້າອັນດັບຕົ້ນ</CardTitle>
            {dashboardData.rankedCustomers.length === 0 ? (
              <EmptyState text='ຍັງບໍ່ມີຂໍ້ມູນ' compact />
            ) : (
              <div style={stackStyle}>
                {dashboardData.rankedCustomers.map(([name, total], index) => (
                  <div key={name} style={rankingRowStyle}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10, minWidth: 0}}>
                      <span style={{...rankStyle, background: index === 0 ? TEAL : 'var(--dashboard-grid)', color: index === 0 ? '#fff' : NAVY}}>
                        {index + 1}
                      </span>
                      <span style={{fontSize: 13, color: NAVY, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {name}
                      </span>
                    </div>
                    <span style={{fontWeight: 800, color: TEAL_DARK, fontSize: 13, whiteSpace: 'nowrap'}}>{formatCurrency(total)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {dashboardData.rejectedBookings.length > 0 && (
        <Card>
          <CardTitle>
            ໃບບິນທີ່ຖືກປະຕິເສດ ({dashboardData.rejectedBookings.length}) · ບໍ່ນັບລວມໃນລາຍຮັບ
          </CardTitle>
          <div style={stackStyle}>
            {dashboardData.rejectedBookings.slice(0, 8).map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </Card>
      )}
    </>
  )

  return (
    <div className='dashboard-shell' style={shellStyle}>
      <style>{dashboardThemeCss}</style>
      <div style={heroStyle}>
        <div style={heroBgStyle} />
        <div style={heroBodyStyle}>
          <div>
            <span style={kickerBadge}>Dashboard</span>
            <span style={roleTextStyle}>{roleLabels[currentRole]}</span>
          </div>
          <h1 style={heroTitleStyle}>
            {currentRole === 'customer'
              ? 'ພາບລວມການຈອງຂອງຂ້ອຍ'
              : currentRole === 'owner' || currentRole === 'admin'
              ? 'ພາບລວມການບໍລິຫານຮ້ານ'
              : 'ພາບລວມສຳລັບພະນັກງານ'}
          </h1>
          <p style={heroSubtitleStyle}>
            {currentRole === 'customer'
              ? 'ຕິດຕາມການຈອງ, ສະຖານະການຊຳລະ ແລະ ປະຫວັດການໃຊ້ບໍລິການ.'
              : 'ສະຫຼຸບການຈອງເຮືອ, ລາຍຮັບ, ອາຫານ, ລູກຄ້າ ແລະ ສະຖານະການຊຳລະ.'}
          </p>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {isLoading ? (
        <Card>
          <div style={loadingStyle}>ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
        </Card>
      ) : currentRole === 'customer' ? (
        renderCustomerDashboard()
      ) : (
        renderStaffDashboard()
      )}
    </div>
  )
}

const BookingRow = ({booking}: {booking: BookingItem}) => {
  const customer = booking.customer_name || booking.user_name || booking.user_email || 'ລູກຄ້າ'
  const customerSub = booking.customer_phone
    ? `📞 ${booking.customer_phone}`
    : booking.user_email && booking.user_email !== customer
    ? booking.user_email
    : ''

  return (
    <div style={listItemStyle}>
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 14}}>
        <div style={{minWidth: 0}}>
          <div style={{fontWeight: 800, color: NAVY, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {customer}
          </div>
          {customerSub && <div style={mutedTextStyle}>{customerSub}</div>}
          <div style={mutedTextStyle}>
            {booking.ship_name || '-'} · {formatDate(booking.booking_date)} · {booking.booking_time || '-'}
          </div>
          <div style={mutedTextStyle}>
            {booking.foods?.length || 0} ລາຍການອາຫານ · {booking.num_people || 0} ຄົນ · {booking.num_hours || 0} ຊົ່ວໂມງ ·{' '}
            {getPaymentMethodLabel(booking.payment_method)}
          </div>
          {booking.booked_by_name && (
            <div style={{...mutedTextStyle, fontStyle: 'italic'}}>
              ຈອງໂດຍ: {booking.booked_by_name}
              {booking.booked_by_role ? ` (${booking.booked_by_role})` : ''}
            </div>
          )}
          {isRejectedStatus(booking.payment_status) && (
            <div style={{marginTop: 6, color: '#c0392b', fontSize: 12, fontWeight: 700}}>
              ເຫດຜົນປະຕິເສດ: {booking.reject_reason || 'ບໍ່ໄດ້ລະບຸ'}
            </div>
          )}
        </div>
        <div style={{textAlign: 'right', flexShrink: 0}}>
          <div style={{fontWeight: 800, color: TEAL_DARK, fontSize: 16}}>{formatCurrency(booking.grand_total)}</div>
          <div style={{marginTop: 7}}>
            <StatusBadge status={booking.payment_status || booking.status} />
          </div>
        </div>
      </div>
    </div>
  )
}

const MetricLine = ({label, value, color = TEAL}: {label: string; value: React.ReactNode; color?: string}) => (
  <div style={metricLineStyle}>
      <span style={{fontSize: 13, color: 'var(--dashboard-text-soft)'}}>{label}</span>
    <span style={{fontWeight: 800, fontSize: 13, background: `${color}18`, color, borderRadius: 6, padding: '3px 12px'}}>{value}</span>
  </div>
)

const FoodLine = ({food}: {food: FoodItem}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10}}>
    <div style={{minWidth: 0}}>
      <div style={{fontWeight: 700, color: NAVY, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
        {food.name || 'ອາຫານ'}
      </div>
      <div style={{color: 'var(--dashboard-text-muted)', fontSize: 11}}>ຈຳນວນ {food.quantity || 0}</div>
    </div>
    <div style={{fontWeight: 800, color: TEAL_DARK, fontSize: 13, whiteSpace: 'nowrap'}}>{formatCurrency(food.price || 0)}</div>
  </div>
)

const EmptyState = ({text, compact}: {text: string; compact?: boolean}) => (
  <div style={{color: 'var(--dashboard-text-muted)', fontSize: 13, textAlign: 'center', padding: compact ? '14px 0' : '34px 0'}}>{text}</div>
)

const dashboardThemeCss = `
  .dashboard-shell {
    --dashboard-bg: #f0f2f5;
    --dashboard-card-bg: #ffffff;
    --dashboard-list-bg: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
    --dashboard-border: #e4e8ee;
    --dashboard-grid: #edf0f5;
    --dashboard-text-main: #1a2340;
    --dashboard-text-soft: #2c3a56;
    --dashboard-text-muted: #7a8499;
    --dashboard-error-bg: #fdeaea;
    --dashboard-error-border: #f9c8c8;
  }

  [data-bs-theme="dark"] .dashboard-shell {
    --dashboard-bg: #151521;
    --dashboard-card-bg: #1e1e2d;
    --dashboard-list-bg: linear-gradient(180deg, #1e1e2d 0%, #191927 100%);
    --dashboard-border: #2b2b40;
    --dashboard-grid: #2a3144;
    --dashboard-text-main: #f5f8fa;
    --dashboard-text-soft: #d5d9e2;
    --dashboard-text-muted: #9aa3b6;
    --dashboard-error-bg: rgba(224, 82, 82, 0.14);
    --dashboard-error-border: rgba(224, 82, 82, 0.35);
  }
`

const shellStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', 'Noto Sans Lao', -apple-system, BlinkMacSystemFont, sans-serif",
  background: 'var(--dashboard-bg)',
  padding: '16px 16px 32px',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

const heroStyle: React.CSSProperties = {
  borderRadius: 14,
  overflow: 'hidden',
  position: 'relative',
  background: `linear-gradient(120deg, #10233f 0%, ${TEAL} 100%)`,
}

const heroBgStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: "url('/media/logos/s.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.35,
}

const heroBodyStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  padding: '28px 32px',
}

const kickerBadge: React.CSSProperties = {
  background: 'rgba(255,255,255,.18)',
  color: '#fff',
  borderRadius: 6,
  padding: '3px 10px',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0,
}

const roleTextStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,.72)',
  fontSize: 12,
  fontWeight: 700,
  marginLeft: 12,
}

const heroTitleStyle: React.CSSProperties = {
  color: '#fff',
  fontWeight: 800,
  fontSize: 28,
  margin: '9px 0 5px',
  letterSpacing: 0,
}

const heroSubtitleStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,.78)',
  fontSize: 14,
  margin: 0,
}

const errorStyle: React.CSSProperties = {
  background: 'var(--dashboard-error-bg)',
  border: '1px solid var(--dashboard-error-border)',
  borderRadius: 10,
  padding: '12px 16px',
  color: '#c0392b',
  fontSize: 13,
}

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '42px 0',
  color: 'var(--dashboard-text-muted)',
  fontSize: 14,
}

const kpiGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: 12,
}

const kpiStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: '16px 18px 14px',
  position: 'relative',
  overflow: 'hidden',
  minHeight: 116,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}

const sparkStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  opacity: 0.55,
}

const cardStyle: React.CSSProperties = {
  background: 'var(--dashboard-card-bg)',
  borderRadius: 12,
  padding: '18px 20px',
  border: '1px solid var(--dashboard-border)',
  minWidth: 0,
}

const cardTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: NAVY,
  marginBottom: 14,
}

const subtitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--dashboard-text-muted)',
  marginTop: -8,
  marginBottom: 12,
}

const twoColumnStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
  gap: 14,
}

const chartRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
  gap: 14,
}

const threeColumnStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 14,
}

const bottomRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
  gap: 14,
}

const cardHeaderSplitStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
}

const pillStyle: React.CSSProperties = {
  background: `${TEAL}18`,
  color: TEAL_DARK,
  borderRadius: 8,
  padding: '5px 12px',
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: 'nowrap',
}

const legendRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 12,
}

const stackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const listItemStyle: React.CSSProperties = {
  background: 'var(--dashboard-list-bg)',
  border: '1px solid var(--dashboard-border)',
  borderRadius: 10,
  padding: '12px 16px',
}

const mutedTextStyle: React.CSSProperties = {
  color: 'var(--dashboard-text-muted)',
  fontSize: 12,
  marginTop: 3,
}

const badgeStyle: React.CSSProperties = {
  borderRadius: 6,
  padding: '3px 10px',
  fontSize: 11,
  fontWeight: 800,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
}

const thStyle: React.CSSProperties = {
  color: 'var(--dashboard-text-muted)',
  fontWeight: 800,
  textAlign: 'left',
  padding: '6px 8px',
  borderBottom: '1.5px solid var(--dashboard-grid)',
  fontSize: 11,
}

const tdStyle: React.CSSProperties = {
  padding: '9px 8px',
  color: 'var(--dashboard-text-soft)',
  fontSize: 12,
}

const metricLineStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  padding: '5px 0',
}

const rankingRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
}

const rankStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  fontWeight: 800,
  fontSize: 13,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

export default Dashboard
