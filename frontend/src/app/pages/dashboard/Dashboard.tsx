import React, {useEffect, useState} from 'react'
import {collection, getDocs} from 'firebase/firestore'
import {db} from '../../../../../firebase/useFirebase'
import {KTIcon} from '../../../_metronic/helpers'
import {useAuth} from '../../modules/auth'

type DashboardRole = 'customer' | 'employee' | 'owner' | 'admin' | 'user'
type PaymentStatus = 'pending' | 'slip_submitted' | 'approved' | 'rejected' | 're_submitted'

interface AppUser {
  id: string
  name?: string
  lastname?: string
  email?: string
  phone_number?: string
  avatar_url?: string
  status?: string
  role?: DashboardRole | string
  createdAt?: unknown
  updatedAt?: unknown
}

interface FoodItem {
  name?: string
  price?: number
  quantity?: number
  image?: string
  product_id?: string
}

interface BillItem {
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
  ship_id?: string
  ship_name?: string
  ship_price_per_hour?: number
  slip_url?: string
  status?: string
  total_food_price?: number
  total_ship_price?: number
  user_email?: string
  user_id?: string
  user_name?: string
}

interface CategoryItem {
  id: string
  name?: string
}

interface ProductItem {
  id: string
  name?: string
  price?: number
  availability?: boolean
  image?: string
  category_id?: string
}

interface ShipItem {
  id: string
  ship_name?: string
  capacity?: number
  price?: number
  quantity?: number
  status?: string
  image_url?: string
  createdAt?: unknown
  updatedAt?: unknown
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  badgeClass: string
  hint: string
}

interface HeroMetric {
  label: string
  value: string | number
}

const heroImages = [
  {url: 'media/logos/s.jpg', title: 'ເຮືອທ່ອງທ່ຽວຫຼູຫຼາ', description: 'ປະສົບການທ່ອງທ່ຽວທີ່ສະດວກສະບາຍ'}

]

const parseDateValue = (value: unknown): Date | null => {
  if (!value) return null
  if (value instanceof Date) return value

  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (typeof value === 'object' && value !== null) {
    const candidate = value as {seconds?: number; toDate?: () => Date}
    if (typeof candidate.toDate === 'function') return candidate.toDate()
    if (typeof candidate.seconds === 'number') return new Date(candidate.seconds * 1000)
  }

  return null
}

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('lo-LA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

const formatCurrency = (amount: number) => `${amount.toLocaleString()} LAK`

const paymentStatusLabels: Record<string, string> = {
  pending: 'ລໍຖ້າ',
  slip_submitted: 'ສົ່ງສະລິບແລ້ວ',
  approved: 'ອະນຸມັດ',
  rejected: 'ປະຕິເສດ',
  re_submitted: 'ສົ່ງກວດສອບອີກຄັ້ງ',
  'payment failed': 'ຊຳລະບໍ່ສຳເລັດ',
  under_review_again: 'ກວດສອບອີກຄັ້ງ',
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'ເງິນສົດ',
  transfer: 'ໂອນເງິນ',
  credit_card: 'ບັດເຄຣດິດ',
  promptpay: 'PromptPay',
}

const roleLabels: Record<DashboardRole, string> = {
  customer: 'ລູກຄ້າ',
  employee: 'ພະນັກງານ',
  owner: 'ເຈົ້າຂອງ',
  admin: 'ຜູ້ດູແລ',
  user: 'ຜູ້ໃຊ້',
}

const getPaymentStatusLabel = (status?: string) => {
  const normalized = (status || 'pending').toLowerCase()
  return paymentStatusLabels[normalized] ?? status ?? 'ລໍຖ້າ'
}

const getPaymentMethodLabel = (method?: string) => {
  if (!method) return '-'
  const normalized = method.toLowerCase()
  return paymentMethodLabels[normalized] ?? method
}

const normalizeRole = (role?: string): DashboardRole => {
  const safeRole = role?.toLowerCase()
  if (safeRole === 'owner') return 'owner'
  if (safeRole === 'admin') return 'admin'
  if (safeRole === 'employee') return 'employee'
  if (safeRole === 'customer') return 'customer'
  return 'user'
}

const getPaymentBadgeClass = (status?: string) => {
  const normalizedStatus = (status || 'pending').toLowerCase()

  if (normalizedStatus === 'approved') return 'badge-light-success'
  if (normalizedStatus === 'rejected') return 'badge-light-danger'
  return 'badge-light-warning'
}

const Dashboard = () => {
  const {currentUser} = useAuth()
  const currentRole = normalizeRole(currentUser?.role)

  const [users, setUsers] = useState<AppUser[]>([])
  const [bills, setBills] = useState<BillItem[]>([])
  const [historyBookings, setHistoryBookings] = useState<BillItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [ships, setShips] = useState<ShipItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [usersSnap, billsSnap, historySnap, categoriesSnap, productsSnap, shipsSnap] =
          await Promise.all([
            getDocs(collection(db, 'Users')),
            getDocs(collection(db, 'bill')),
            getDocs(collection(db, 'history_booking')),
            getDocs(collection(db, 'categories')),
            getDocs(collection(db, 'products')),
            getDocs(collection(db, 'ships')),
          ])

        setUsers(usersSnap.docs.map((doc) => ({id: doc.id, ...doc.data()}) as AppUser))
        setBills(billsSnap.docs.map((doc) => ({id: doc.id, ...doc.data()}) as BillItem))
        setHistoryBookings(
          historySnap.docs.map((doc) => ({id: doc.id, ...doc.data()}) as BillItem)
        )
        setCategories(
          categoriesSnap.docs.map((doc) => ({id: doc.id, ...doc.data()}) as CategoryItem)
        )
        setProducts(productsSnap.docs.map((doc) => ({id: doc.id, ...doc.data()}) as ProductItem))
        setShips(shipsSnap.docs.map((doc) => ({id: doc.id, ...doc.data()}) as ShipItem))
      } catch (fetchError) {
        console.error('Error loading Firebase dashboard data:', fetchError)
        setError('ບໍ່ສາມາດໂຫລດຂໍ້ມູນ dashboard ຈາກ Firebase emulator ໄດ້')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

  const sortedBills = [...bills].sort((left, right) => {
    const leftDate = parseDateValue(left.createdAt)?.getTime() || 0
    const rightDate = parseDateValue(right.createdAt)?.getTime() || 0
    return rightDate - leftDate
  })

  const sortedHistory = [...historyBookings].sort((left, right) => {
    const leftDate = parseDateValue(left.createdAt)?.getTime() || 0
    const rightDate = parseDateValue(right.createdAt)?.getTime() || 0
    return rightDate - leftDate
  })

  const currentUserId = currentUser?._id || ''
  const currentUserEmail = currentUser?.user_email || ''
  const currentUserAvatar =
    (currentUser as unknown as {avatar?: string; image_url?: string} | undefined)?.avatar ||
    (currentUser as unknown as {avatar?: string; image_url?: string} | undefined)?.image_url ||
    ''

  const myBills = bills.filter(
    (item) =>
      item.user_id === currentUserId ||
      item.user_email?.toLowerCase() === currentUserEmail.toLowerCase()
  )

  const myHistory = historyBookings.filter(
    (item) =>
      item.user_id === currentUserId ||
      item.user_email?.toLowerCase() === currentUserEmail.toLowerCase()
  )

  const totalCustomers = users.filter((user) => normalizeRole(user.role) === 'customer').length
  const activeUsers = users.filter((user) => user.status?.toLowerCase() === 'active').length
  const availableProducts = products.filter((product) => product.availability).length
  const activeShips = ships.filter((ship) => ship.status?.toLowerCase() === 'active').length
  const pendingPayments = bills.filter((item) =>
    ['pending', 'slip_submitted', 're_submitted'].includes(
      (item.payment_status || '').toLowerCase()
    )
  )
  const approvedRevenue = historyBookings
    .filter((item) => (item.payment_status || '').toLowerCase() === 'approved')
    .reduce((sum, item) => sum + (item.grand_total || 0), 0)

  const customerTotalSpent = myHistory.reduce((sum, item) => sum + (item.grand_total || 0), 0)
  const customerPendingBills = myBills.filter((item) =>
    ['pending', 'slip_submitted', 're_submitted'].includes(
      (item.payment_status || '').toLowerCase()
    )
  )
  const customerApprovedBookings = myHistory.filter(
    (item) => (item.payment_status || '').toLowerCase() === 'approved'
  ).length

  const topCustomers = historyBookings.reduce<Record<string, number>>((accumulator, item) => {
    const key = item.user_name || item.user_email || 'ລູກຄ້າບໍ່ຮູ້ຊື່'
    accumulator[key] = (accumulator[key] || 0) + (item.grand_total || 0)
    return accumulator
  }, {})

  const rankedCustomers = Object.entries(topCustomers)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)

  const paymentSummary = bills.reduce<Record<string, number>>((accumulator, item) => {
    const status = (item.payment_status || 'pending').toLowerCase()
    accumulator[status] = (accumulator[status] || 0) + 1
    return accumulator
  }, {})

  const categoryLookup = categories.reduce<Record<string, string>>((accumulator, item) => {
    accumulator[item.id] = item.name || 'ບໍ່ມີໝວດໝູ່'
    return accumulator
  }, {})

  const roleTitle =
    currentRole === 'customer'
      ? 'ແດຊບອດລູກຄ້າ'
      : currentRole === 'owner' || currentRole === 'admin'
      ? 'ແດຊບອດເຈົ້າຂອງ'
      : 'ແດຊບອດພະນັກງານ  '

  const roleDescription =
    currentRole === 'customer'
      ? 'ຕິດຕາມການຈອງ, ການຊໍາລະເງິນ, ການອະນຸມັດການຈອງ, ແລະລາຍການອາຫານ'
      : currentRole === 'owner' || currentRole === 'admin'
      ? 'ເບິ່ງພາບລວມທຸລະກິດ, ການເຄື່ອນໄຫວລູກຄ້າ, ການຊໍາລະທີ່ຍັງຄ້າງ, ສິນຄ້າ, ແລະສະຖານະເຮືອ'
      : 'ຕິດຕາມວຽກຈອງປະຈໍາວັນ, ການຕິດຕາມການຊໍາລະ, ແລະຄວາມພ້ອມໃຫ້ບໍລິການ'

  const currentHero = heroImages[currentHeroIndex]
  const heroMetrics: HeroMetric[] =
    currentRole === 'customer'
      ? [
          {label: 'ການຈອງ', value: myHistory.length},
          {label: 'ບິນທີ່ຄ້າງ', value: customerPendingBills.length},
          {label: 'ຍອດໃຊ້ຈ່າຍລວມ', value: formatCurrency(customerTotalSpent)},
        ]
      : [
          {label: 'ລູກຄ້າ', value: totalCustomers},
          {label: 'ລໍຖ້າກວດສອບ', value: pendingPayments.length},
          {label: 'ລາຍຮັບທີ່ອະນຸມັດ', value: formatCurrency(approvedRevenue)},
        ]

  const StatCard = ({title, value, icon, badgeClass, hint}: StatCardProps) => (
    <div className='col-12 col-md-6 col-xl-3'>
      <div className='card h-100 border-0 dashboard-stat-card'>
        <div className='card-body d-flex align-items-start gap-4'>
          <div className={`symbol symbol-55px dashboard-stat-icon ${badgeClass}`}>
            <span className='symbol-label'>
              <KTIcon iconName={icon} className='fs-1' />
            </span>
          </div>
          <div className='flex-grow-1'>
            <div className='text-gray-600 fw-semibold fs-8 text-uppercase mb-2 dashboard-eyebrow'>
              {title}
            </div>
            <div className='fs-2hx fw-bold text-gray-900 lh-1 mb-2 dashboard-stat-value'>{value}</div>
            <div className='text-muted fs-7 dashboard-stat-hint'>{hint}</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCustomerDashboard = () => (
    <>
      <div className='row g-5 g-xl-8 mb-8'>
        <StatCard
          title='ການຈອງຂອງຂ້ອຍ'
          value={myHistory.length}
          icon='abstract-26'
          badgeClass='bg-light-primary text-primary'
          hint='ການຈອງທັງໝົດໃນປະຫວັດຂອງທ່ານ'
        />
        <StatCard
          title='ຍັງບໍ່ທັນຊໍາລະ'
          value={customerPendingBills.length}
          icon='time'
          badgeClass='bg-light-warning text-warning'
          hint='ບິນທີ່ກໍາລັງລໍຖ້າການຊໍາລະ ຫຼື ການກວດສອບ'
        />
        <StatCard
          title='ລາຍການອະນຸມັດແລ້ວ'
          value={customerApprovedBookings}
          icon='check-circle'
          badgeClass='bg-light-success text-success'
          hint='ລາຍການຊໍາລະທີ່ຢືນຢັນແລ້ວ'
        />
        <StatCard
          title='ຍອດໃຊ້ຈ່າຍລວມ'
          value={formatCurrency(customerTotalSpent)}
          icon='dollar'
          badgeClass='bg-light-info text-info'
          hint='ອີງຕາມປະຫວັດການຈອງຂອງທ່ານ'
        />
      </div>

      <div className='row g-5 g-xl-8'>
        <div className='col-12 col-xl-8'>
          <div className='card border-0 shadow-sm mb-8 dashboard-panel'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title flex-column'>
                <h3 className='card-label fw-bold text-gray-900'>ການຈອງຫຼ້າສຸດຂອງຂ້ອຍ</h3>
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  ລາຍການຫຼ້າສຸດຈາກ `history_booking`
                </span>
              </div>
            </div>
            <div className='card-body pt-2'>
              {myHistory.length === 0 ? (
                <div className='text-muted fw-semibold py-10'>ບໍ່ພົບປະຫວັດການຈອງສໍາລັບລູກຄ້ານີ້</div>
              ) : (
                <div className='d-flex flex-column gap-4'>
                  {myHistory.slice(0, 6).map((item) => (
                    <div key={item.id} className='dashboard-list-item'>
                      <div className='d-flex flex-column flex-md-row justify-content-between gap-3'>
                        <div>
                          <div className='fw-bold text-gray-900 fs-4'>{item.ship_name || 'ການຈອງເຮືອ'}</div>
                          <div className='text-muted fs-7 mt-1'>
                            {formatDate(item.booking_date)} at {item.booking_time || '-'}
                          </div>
                          <div className='text-muted fs-7 mt-1'>
                            {item.num_people || 0} ຄົນ, {item.num_hours || 0} ຊົ່ວໂມງ
                          </div>
                          <div className='text-muted fs-7 mt-1'>
                            ອາຫານ: {item.foods?.length || 0} ລາຍການ
                          </div>
                        </div>
                        <div className='text-md-end'>
                          <div className='fw-bolder text-primary fs-3'>
                            {formatCurrency(item.grand_total || 0)}
                          </div>
                          <div className={`badge mt-2 ${getPaymentBadgeClass(item.payment_status)}`}>
                            {getPaymentStatusLabel(item.payment_status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='card border-0 shadow-sm h-100 dashboard-panel'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title flex-column'>
                <h3 className='card-label fw-bold text-gray-900'>ບິນທີ່ຍັງຄ້າງ</h3>
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  ລາຍການຈາກ `bill` ທີ່ຍັງຕ້ອງການການດໍາເນີນການ
                </span>
              </div>
            </div>
            <div className='card-body pt-2'>
              {customerPendingBills.length === 0 ? (
                <div className='rounded-4 bg-light-success p-6 border border-success border-opacity-25'>
                  <div className='fw-bold text-gray-900 mb-1'>ບໍ່ມີບິນຄ້າງ</div>
                  <div className='text-muted fs-7'>ລາຍການຊໍາລະຂອງທ່ານຕອນນີ້ປົກກະຕິດີ</div>
                </div>
              ) : (
                <div className='table-responsive'>
                  <table className='table align-middle gs-0 gy-4 dashboard-table'>
                    <thead>
                      <tr className='fw-bold text-muted bg-light'>
                        <th className='ps-4 min-w-175px rounded-start'>ເຮືອ</th>
                        <th className='min-w-125px'>ວັນທີຈອງ</th>
                        <th className='min-w-125px'>ການຊໍາລະ</th>
                        <th className='min-w-125px'>ລວມ</th>
                        <th className='min-w-100px rounded-end'>ສະຖານະ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerPendingBills.map((item) => (
                        <tr key={item.id}>
                          <td className='ps-4 fw-bold text-gray-900'>{item.ship_name || '-'}</td>
                          <td>{formatDate(item.booking_date)}</td>
                          <td className='text-gray-700'>{getPaymentMethodLabel(item.payment_method)}</td>
                          <td className='fw-bold text-primary'>{formatCurrency(item.grand_total || 0)}</td>
                          <td>
                            <span className={`badge ${getPaymentBadgeClass(item.payment_status)}`}>
                              {getPaymentStatusLabel(item.payment_status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='col-12 col-xl-4'>
          <div className='card border-0 shadow-sm mb-8 dashboard-panel'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title flex-column'>
                <h3 className='card-label fw-bold text-gray-900'>ຂໍ້ມູນບັນຊີ</h3>
                <span className='text-muted mt-1 fw-semibold fs-7'>ຂໍ້ມູນພື້ນຖານຈາກ `Users`</span>
              </div>
            </div>
            <div className='card-body pt-2'>
              <div className='d-flex align-items-center gap-4 mb-5'>
                <div className='symbol symbol-60px symbol-circle overflow-hidden'>
                  {currentUserAvatar ? (
                    <img src={currentUserAvatar} alt='avatar' />
                  ) : (
                    <div className='symbol-label bg-light-primary text-primary fw-bold fs-2'>
                      {(currentUser?.user_name || 'U').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className='fw-bold text-gray-900 fs-3'>{currentUser?.user_name || 'ລູກຄ້າ'}</div>
                  <div className='text-muted'>{currentUser?.user_email || '-'}</div>
                  <div className='badge badge-light-primary mt-2'>{roleLabels[currentRole]}</div>
                </div>
              </div>
              <div className='separator separator-dashed my-5' />
              <div className='d-flex flex-column gap-4'>
                <div>
                  <div className='text-muted fs-8'>ID ຜູ້ໃຊ້ປັດຈຸບັນ</div>
                  <div className='fw-semibold text-gray-800'>{currentUserId || '-'}</div>
                </div>
                <div>
                  <div className='text-muted fs-8'>ລາຍການຊໍາລະ</div>
                  <div className='fw-semibold text-gray-800'>{myBills.length}</div>
                </div>
                <div>
                  <div className='text-muted fs-8'>ລາຍການປະຫວັດ</div>
                  <div className='fw-semibold text-gray-800'>{myHistory.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className='card border-0 shadow-sm h-100 dashboard-panel'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title flex-column'>
                <h3 className='card-label fw-bold text-gray-900'>ສະຫຼຸບອາຫານທີ່ຈອງ</h3>
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  ເບິ່ງລາຍການອາຫານໃນປະຫວັດຂອງທ່ານແບບໄວ
                </span>
              </div>
            </div>
            <div className='card-body pt-2'>
              {myHistory.flatMap((item) => item.foods || []).length === 0 ? (
                <div className='text-muted fw-semibold py-6'>ບໍ່ພົບລາຍການອາຫານ</div>
              ) : (
                <div className='d-flex flex-column gap-4'>
                  {myHistory
                    .flatMap((item) => item.foods || [])
                    .slice(0, 5)
                    .map((food, index) => (
                      <div key={`${food.product_id || food.name}-${index}`} className='d-flex align-items-center justify-content-between'>
                        <div>
                          <div className='fw-bold text-gray-900'>{food.name || 'ລາຍການອາຫານ'}</div>
                          <div className='text-muted fs-8'>ຈໍານວນ: {food.quantity || 0}</div>
                        </div>
                        <div className='fw-bold text-info'>{formatCurrency(food.price || 0)}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )

  const renderStaffDashboard = () => (
    <>
      <div className='row g-5 g-xl-8 mb-8'>
        <StatCard
          title='ລູກຄ້າທັງໝົດ'
          value={totalCustomers}
          icon='profile-user'
          badgeClass='bg-light-primary text-primary'
          hint='ບັນຊີລູກຄ້າໃນ collection Users'
        />
        <StatCard
          title='ການຊໍາລະທີ່ຍັງຄ້າງ'
          value={pendingPayments.length}
          icon='time'
          badgeClass='bg-light-warning text-warning'
          hint='ບິນທີ່ຕ້ອງຕິດຕາມ'
        />
        <StatCard
          title='ລາຍຮັບທີ່ອະນຸມັດແລ້ວ'
          value={formatCurrency(approvedRevenue)}
          icon='dollar'
          badgeClass='bg-light-success text-success'
          hint='ຜົນລວມຈາກປະຫວັດການຈອງທີ່ອະນຸມັດແລ້ວ'
        />
        <StatCard
          title='ເຮືອທີ່ພ້ອມໃຊ້'
          value={activeShips}
          icon='ship'
          badgeClass='bg-light-info text-info'
          hint='ເຮືອພ້ອມສໍາລັບໃຫ້ບໍລິການ'
        />
      </div>

      <div className='row g-5 g-xl-8'>
        <div className='col-12 col-xl-8'>
          <div className='card border-0 shadow-sm mb-8 dashboard-panel'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title flex-column'>
                <h3 className='card-label fw-bold text-gray-900'>ການຈອງຫຼ້າສຸດ</h3>
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  ລາຍການຈອງຫຼ້າສຸດຈາກ `history_booking`
                </span>
              </div>
            </div>
            <div className='card-body pt-2'>
              {sortedHistory.length === 0 ? (
                <div className='text-muted fw-semibold py-10'>ບໍ່ພົບປະຫວັດການຈອງໃນ Firebase</div>
              ) : (
                <div className='d-flex flex-column gap-4'>
                  {sortedHistory.slice(0, 6).map((item) => (
                    <div key={item.id} className='dashboard-list-item'>
                      <div className='d-flex flex-column flex-md-row justify-content-between gap-4'>
                        <div>
                          <div className='fw-bold text-gray-900 fs-4'>
                            {item.user_name || item.user_email || 'ລູກຄ້າ'}
                          </div>
                          <div className='text-muted fs-7 mt-1'>
                            ເຮືອ: {item.ship_name || '-'} | ວັນທີ: {formatDate(item.booking_date)} | ເວລາ:{' '}
                            {item.booking_time || '-'}
                          </div>
                          <div className='text-muted fs-7 mt-1'>
                            ອາຫານ: {item.foods?.length || 0} | ຈໍານວນຄົນ: {item.num_people || 0} | ຊົ່ວໂມງ:{' '}
                            {item.num_hours || 0}
                          </div>
                        </div>
                        <div className='text-md-end'>
                          <div className='fw-bolder text-primary fs-3'>
                            {formatCurrency(item.grand_total || 0)}
                          </div>
                          <span
                            className={`badge mt-2 ${getPaymentBadgeClass(
                              item.payment_status || item.status
                            )}`}
                          >
                            {getPaymentStatusLabel(item.payment_status || item.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='card border-0 shadow-sm h-100 dashboard-panel'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title flex-column'>
                <h3 className='card-label fw-bold text-gray-900'>ຄິວການຊໍາລະ</h3>
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  ລາຍການບິນປັດຈຸບັນຈາກ `bill`
                </span>
              </div>
            </div>
            <div className='card-body pt-2'>
              {sortedBills.length === 0 ? (
                <div className='text-muted fw-semibold py-10'>ບໍ່ພົບຂໍ້ມູນບິນໃນ Firebase</div>
              ) : (
                <div className='table-responsive'>
                  <table className='table align-middle gs-0 gy-4 dashboard-table'>
                    <thead>
                      <tr className='fw-bold text-muted bg-light'>
                        <th className='ps-4 min-w-175px rounded-start'>ລູກຄ້າ</th>
                        <th className='min-w-150px'>ເຮືອ</th>
                        <th className='min-w-125px'>ການຈອງ</th>
                        <th className='min-w-125px'>ຈໍານວນເງິນ</th>
                        <th className='min-w-125px rounded-end'>ສະຖານະການຊໍາລະ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBills.slice(0, 8).map((item) => (
                        <tr key={item.id}>
                          <td className='ps-4'>
                            <div className='fw-bold text-gray-900'>{item.user_name || 'ບໍ່ຮູ້ຊື່'}</div>
                            <div className='text-muted fs-8'>{item.user_email || '-'}</div>
                          </td>
                          <td>{item.ship_name || '-'}</td>
                          <td>{formatDate(item.booking_date)}</td>
                          <td className='fw-bold text-primary'>{formatCurrency(item.grand_total || 0)}</td>
                          <td>
                            <span className={`badge ${getPaymentBadgeClass(item.payment_status)}`}>
                              {getPaymentStatusLabel(item.payment_status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='col-12 col-xl-4'>
          <div className='card border-0 shadow-sm mb-8 dashboard-panel'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title flex-column'>
                <h3 className='card-label fw-bold text-gray-900'>ພາບລວມຄັງຂໍ້ມູນ</h3>
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  ສິນຄ້າ, ໝວດໝູ່, ແລະເຮືອຈາກ Firestore
                </span>
              </div>
            </div>
            <div className='card-body pt-2'>
              <div className='d-flex flex-column gap-4'>
                <div className='d-flex justify-content-between align-items-center'>
                  <span className='text-gray-700 fw-semibold'>ສິນຄ້າ</span>
                  <span className='badge badge-light-primary'>{products.length}</span>
                </div>
                <div className='d-flex justify-content-between align-items-center'>
                  <span className='text-gray-700 fw-semibold'>ສິນຄ້າພ້ອມຂາຍ</span>
                  <span className='badge badge-light-success'>{availableProducts}</span>
                </div>
                <div className='d-flex justify-content-between align-items-center'>
                  <span className='text-gray-700 fw-semibold'>ໝວດໝູ່</span>
                  <span className='badge badge-light-info'>{categories.length}</span>
                </div>
                <div className='d-flex justify-content-between align-items-center'>
                  <span className='text-gray-700 fw-semibold'>ເຮືອ</span>
                  <span className='badge badge-light-primary'>{ships.length}</span>
                </div>
                <div className='d-flex justify-content-between align-items-center'>
                  <span className='text-gray-700 fw-semibold'>ຜູ້ໃຊ້ທີ່ໃຊ້ງານຢູ່</span>
                  <span className='badge badge-light-success'>{activeUsers}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='card border-0 shadow-sm mb-8 dashboard-panel'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title flex-column'>
                <h3 className='card-label fw-bold text-gray-900'>ລູກຄ້າອັນດັບຕົ້ນ</h3>
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  ມູນຄ່າການຈອງສູງສຸດຈາກ `history_booking`
                </span>
              </div>
            </div>
            <div className='card-body pt-2'>
              {rankedCustomers.length === 0 ? (
                <div className='text-muted fw-semibold py-6'>ບໍ່ມີຂໍ້ມູນການໃຊ້ຈ່າຍຂອງລູກຄ້າ</div>
              ) : (
                <div className='d-flex flex-column gap-4'>
                  {rankedCustomers.map(([name, total], index) => (
                    <div key={name} className='d-flex align-items-center justify-content-between'>
                      <div className='d-flex align-items-center gap-3'>
                        <div className='symbol symbol-40px bg-light-primary'>
                          <span className='symbol-label text-primary fw-bold'>{index + 1}</span>
                        </div>
                        <div className='fw-bold text-gray-900'>{name}</div>
                      </div>
                      <div className='fw-bold text-info'>{formatCurrency(total)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='card border-0 shadow-sm h-100 dashboard-panel'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title flex-column'>
                
                <span className='text-muted mt-1 fw-semibold fs-7'>
                  ລາຍການຫຼ້າສຸດພ້ອມການຈັບຄູ່ໝວດໝູ່
                </span>
              </div>
            </div>
            <div className='card-body pt-2'>
              {products.length === 0 ? (
                <div className='text-muted fw-semibold py-6'>ບໍ່ພົບສິນຄ້າ</div>
              ) : (
                <div className='d-flex flex-column gap-4'>
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} className='d-flex align-items-center justify-content-between gap-3'>
                      <div>
                        <div className='fw-bold text-gray-900'>{product.name || 'ສິນຄ້າບໍ່ມີຊື່'}</div>
                        <div className='text-muted fs-8'>
                          {categoryLookup[product.category_id || ''] || 'ບໍ່ມີໝວດໝູ່'}
                        </div>
                      </div>
                      <div className='text-end'>
                        <div className='fw-bold text-primary'>{formatCurrency(product.price || 0)}</div>
                        <span
                          className={`badge ${
                            product.availability ? 'badge-light-success' : 'badge-light-danger'
                          } mt-1`}
                        >
                          {product.availability ? 'ພ້ອມຂາຍ' : 'ບໍ່ພ້ອມຂາຍ'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(currentRole === 'owner' || currentRole === 'admin') && (
        <div className='row g-5 g-xl-8 mt-1'>
          <div className='col-12'>
            <div className='card border-0 shadow-sm dashboard-panel'>
              <div className='card-header border-0 pt-6'>
                <div className='card-title flex-column'>
                  <h3 className='card-label fw-bold text-gray-900'>ການແຈກຢາຍສະຖານະການຊໍາລະ</h3>
                  {/* <span className='text-muted mt-1 fw-semibold fs-7'>
                    ມຸມມອງລະດັບສູງສໍາລັບເຈົ້າຂອງຈາກບິນທັງໝົດ
                  </span> */}
                </div>
              </div>
              <div className='card-body pt-2'>
                <div className='row g-4'>
                  {Object.entries(paymentSummary).map(([status, total]) => (
                    <div key={status} className='col-12 col-md-6 col-xl-3'>
                      <div className='rounded-3 border border-gray-200 p-5 h-100'>
                        <div className='text-muted fs-8 text-uppercase mb-2'>{status}</div>
                        <div className='fw-bolder text-gray-900 fs-1'>{total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className='container-fluid dashboard-shell'>
      <div className='card mb-7 border-0 overflow-hidden dashboard-hero'>
        <div
          className='dashboard-hero-image'
          style={{backgroundImage: `url('${currentHero.url}')`}}
        />
        <div className='card-body p-8 p-lg-12'>
          <div className='d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-8'>
            <div className='me-xl-8'>
              <div className='dashboard-hero-kicker'>
                <span className='badge badge-light-primary'>ຍິນດີຕ້ອນຮັບ</span>
                <span className='dashboard-hero-dot' />
                <span className='text-white opacity-75 fs-8 text-uppercase fw-semibold'>
                  {roleLabels[currentRole]}
                </span>
              </div>
              <h1 className='text-white fw-bolder mb-3'>{roleTitle}</h1>
              <div className='text-white opacity-75 fs-5 mw-lg-700px'>{roleDescription}</div>
              <div className='dashboard-hero-caption mt-6'>
                <div className='text-white fw-bold fs-3 mb-1'>{currentHero.title}</div>
                <div className='text-white opacity-75 fs-7'>{currentHero.description}</div>
              </div>
              <div className='row g-4 mt-2'>
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className='col-12 col-md-4'>
                    <div className='dashboard-hero-metric'>
                      <div className='dashboard-eyebrow text-white opacity-75 mb-2'>
                        {metric.label}
                      </div>
                      <div className='text-white fw-bolder fs-2 dashboard-hero-metric-value'>
                        {metric.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='min-w-xl-325px'>
              <div className='dashboard-profile-card mb-4'>
                <div className='d-flex align-items-center gap-4 mb-4'>
                  <div
                    className='dashboard-avatar'
                    style={
                      currentUserAvatar ? {backgroundImage: `url('${currentUserAvatar}')`} : undefined
                    }
                  >
                    {!currentUserAvatar ? (
                      <span>{(currentUser?.user_name || currentRole || 'U').toString().charAt(0)}</span>
                    ) : null}
                  </div>
                  <div>
                <div className='text-white opacity-75 fs-8 mb-1'>ເຂົ້າລະບົບເປັນ</div>
                <div className='text-white fw-bold fs-2'>{currentUser?.user_name || 'ບໍ່ຮູ້ຈັກຜູ້ໃຊ້'}</div>
                <div className='text-white opacity-75 fs-7'>{currentUser?.user_email || '-'}</div>
                  </div>
                </div>
                <div className='badge badge-light-primary'>{roleLabels[currentRole]}</div>
              </div>

              <div className='row g-3'>
                <div className='col-6'>
                  <div className='dashboard-summary-tile h-100'>
                    <div className='text-white opacity-75 fs-8 mb-1'>ລາຍການລວມ</div>
                    <div className='text-white fw-bold fs-2'>6</div>
                  </div>
                </div>
                <div className='col-6'>
                  <div className='dashboard-summary-tile h-100'>
                    <div className='text-white opacity-75 fs-8 mb-1'>ລາຍການຂໍ້ມູນ</div>
                    <div className='text-white fw-bold fs-2'>
                      {users.length + bills.length + historyBookings.length + products.length + ships.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className='alert alert-danger d-flex align-items-center mb-7'>
          <KTIcon iconName='information-5' className='fs-2hx text-danger me-4' />
          <div className='fw-semibold'>{error}</div>
        </div>
      ) : null}

      {isLoading ? (
        <div className='card border-0 shadow-sm dashboard-panel'>
          <div className='card-body py-20 text-center'>
            <div className='text-muted fw-semibold fs-4'>ກໍາລັງໂຫລດແດຊບອດ</div>
          </div>
        </div>
      ) : currentRole === 'customer' ? (
        renderCustomerDashboard()
      ) : (
        renderStaffDashboard()
      )}

      <style>{`
        .dashboard-shell {
          --dashboard-bg: #f4f7fb;
          --dashboard-surface: #ffffff;
          --dashboard-border: rgba(15, 23, 42, 0.08);
          --dashboard-shadow: 0 12px 36px rgba(15, 23, 42, 0.07);
          --dashboard-shadow-hover: 0 20px 46px rgba(15, 23, 42, 0.12);
          --dashboard-hero-gradient:
            linear-gradient(120deg, #10233f 0%, #1d4778 54%, #2f87bf 100%);
          --dashboard-text-main: #0f172a;
          --dashboard-text-muted: #6b7280;
          padding: 0.5rem 0.35rem 2rem;
          background:
            radial-gradient(circle at 0% -20%, rgba(98, 160, 255, 0.18), transparent 36%),
            radial-gradient(circle at 100% 0%, rgba(63, 205, 170, 0.13), transparent 28%),
            var(--dashboard-bg);
        }

        .dashboard-shell .card:not(.dashboard-hero) {
          border: 1px solid var(--dashboard-border) !important;
          background: var(--dashboard-surface);
          box-shadow: var(--dashboard-shadow) !important;
        }

        .dashboard-shell .card-header {
          padding-bottom: 1.25rem;
        }

        .dashboard-shell .card-title .card-label {
          font-size: 1.1rem;
          color: var(--dashboard-text-main);
          letter-spacing: -0.01em;
        }

        .dashboard-eyebrow {
          letter-spacing: 0.12em;
        }

        .dashboard-hero {
          position: relative;
          border-radius: 28px;
          background: var(--dashboard-hero-gradient);
          border: 1px solid rgba(255, 255, 255, 0.16) !important;
          box-shadow: 0 34px 72px rgba(4, 14, 31, 0.26);
        }

        .dashboard-hero-image {
          position: absolute;
          inset: 0;
          background-position: center;
          background-size: cover;
          opacity: 0.85;
          filter: brightness(1.08);
          transform: scale(1.04);
          transition: background-image 0.8s ease, opacity 0.8s ease, transform 0.8s ease;
        }

        .dashboard-hero .card-body {
          position: relative;
          z-index: 2;
        }

        .dashboard-hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .dashboard-hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.7);
        }

        .dashboard-hero-caption {
          display: inline-block;
          max-width: 420px;
          padding: 0.95rem 1.2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .dashboard-hero-metric,
        .dashboard-profile-card,
        .dashboard-summary-tile {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .dashboard-hero-metric {
          height: 100%;
          padding: 1rem 1.1rem;
          border-radius: 16px;
        }

        .dashboard-profile-card {
          border-radius: 18px;
          padding: 1.25rem;
        }

        .dashboard-avatar {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.16);
          color: #ffffff;
          font-size: 1.2rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-position: center;
          background-size: cover;
          flex: 0 0 auto;
        }

        .dashboard-summary-tile {
          padding: 1rem 1.1rem;
          border-radius: 16px;
        }

        .dashboard-panel {
          border-radius: 18px;
        }

        .dashboard-stat-card {
          border-radius: 16px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .dashboard-stat-card .card-body {
          overflow: hidden;
          padding: 1.35rem 1.35rem 1.25rem;
        }

        .dashboard-stat-card .flex-grow-1 {
          min-width: 0;
        }

        .dashboard-shell .table-responsive {
          border-radius: 14px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          overflow: hidden;
        }

        .dashboard-stat-card:hover {
          transform: translateY(-3px);
          border-color: rgba(58, 125, 196, 0.28) !important;
          box-shadow: var(--dashboard-shadow-hover) !important;
        }

        .dashboard-stat-icon {
          border-radius: 14px;
        }

        .dashboard-stat-hint {
          line-height: 1.55;
          color: var(--dashboard-text-muted) !important;
        }

        .dashboard-stat-value,
        .dashboard-hero-metric-value {
          overflow-wrap: anywhere;
          word-break: break-word;
          letter-spacing: -0.02em;
        }

        .dashboard-stat-value {
          font-size: clamp(1.7rem, 2.6vw, 2.45rem) !important;
          line-height: 1.15 !important;
        }

        .dashboard-hero-metric-value {
          font-size: clamp(1.55rem, 2.1vw, 2rem) !important;
          line-height: 1.2;
        }

        .dashboard-list-item {
          padding: 1.35rem 1.5rem;
          border-radius: 14px;
          background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
          border: 1px solid rgba(44, 93, 147, 0.1);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .dashboard-list-item:hover {
          border-color: rgba(44, 93, 147, 0.2);
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
        }

        .dashboard-table thead tr {
          background: #f6f9ff !important;
        }

        .dashboard-table th {
          padding-top: 1rem;
          padding-bottom: 1rem;
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #8491a7;
        }

        .dashboard-table td {
          padding-top: 1rem;
          padding-bottom: 1rem;
          border-bottom-color: #eef2f7;
        }

        .dashboard-table tbody tr {
          transition: background-color 0.18s ease;
        }

        .dashboard-table tbody tr:hover {
          background: #f8fbff;
        }

        @media (max-width: 991.98px) {
          .dashboard-hero {
            border-radius: 22px;
          }
        }

        @media (max-width: 767.98px) {
          .dashboard-shell {
            padding: 0 0.1rem 1.25rem;
          }

          .dashboard-hero-metric,
          .dashboard-profile-card,
          .dashboard-summary-tile,
          .dashboard-list-item,
          .dashboard-panel,
          .dashboard-stat-card {
            border-radius: 14px;
          }

          .dashboard-shell .card-body {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard
