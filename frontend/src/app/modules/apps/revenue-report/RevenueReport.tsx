import {useEffect, useMemo, useState} from 'react'
import {collection, getDocs} from 'firebase/firestore'
import {db} from '../../../../../../firebase/useFirebase'
import {KTIcon} from '../../../../_metronic/helpers'

// ─── Types ────────────────────────────────────────────────────────────────────
interface FoodItem {
  product_id: string
  name: string
  price: number
  quantity: number
}

interface Bill {
  id: string
  ship_name?: string
  booking_date?: string
  booking_time?: string
  num_people?: number
  num_hours?: number
  total_ship_price?: number
  total_food_price?: number
  grand_total?: number
  payment_method?: string
  payment_status?: string
  user_name?: string
  user_email?: string
  customer_name?: string
  customer_phone?: string
  booked_by_name?: string
  booked_by_role?: string
  foods?: FoodItem[]
  createdAt?: string
}

type Granularity = 'day' | 'month' | 'year'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pad2 = (n: number) => n.toString().padStart(2, '0')
const fmtLak = (n: number) => `${n.toLocaleString()} LAK`

const formatDateDMY = (iso?: string) => {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

const paymentMethodLabel = (method?: string) => {
  switch (method) {
    case 'cash':
      return 'ເງິນສົດ'
    case 'cash+transfer':
      return 'ເງິນສົດ + ໂອນ'
    case 'bcel':
      return 'BCEL QR'
    default:
      return method || '-'
  }
}

const isPaidBill = (bill: Bill) => {
  const s = (bill.payment_status ?? '').toLowerCase().trim().replace(/[\s-]+/g, '_')
  return s === 'approved' || bill.payment_method === 'bcel' || bill.payment_method === 'cash+transfer'
}

// ─── Component ────────────────────────────────────────────────────────────────
const RevenueReport = () => {
  const today = new Date()
  const [allBills, setAllBills] = useState<Bill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [granularity, setGranularity] = useState<Granularity>('month')
  const [dayValue, setDayValue] = useState(
    `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`
  )
  const [monthValue, setMonthValue] = useState(
    `${today.getFullYear()}-${pad2(today.getMonth() + 1)}`
  )
  const [yearValue, setYearValue] = useState(today.getFullYear())
  const [paymentMethod, setPaymentMethod] = useState<string>('')

  // ─── Load bills ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'bill'))
        const data = snap.docs.map((d) => ({id: d.id, ...d.data()})) as Bill[]
        if (mounted) setAllBills(data)
      } catch (err) {
        console.error('Failed to load bills:', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  // ─── Apply filters ──────────────────────────────────────────────────────────
  const filteredBills = useMemo(() => {
    return allBills.filter((bill) => {
      if (!isPaidBill(bill)) return false
      if (paymentMethod && bill.payment_method !== paymentMethod) return false
      const date = bill.booking_date
      if (!date) return false
      if (granularity === 'day') {
        return date === dayValue
      }
      if (granularity === 'month') {
        return date.startsWith(monthValue)
      }
      return date.startsWith(String(yearValue))
    })
  }, [allBills, granularity, dayValue, monthValue, yearValue, paymentMethod])

  // ─── Aggregates ─────────────────────────────────────────────────────────────
  const totalRevenue = filteredBills.reduce((sum, b) => sum + (b.grand_total ?? 0), 0)
  const totalShipRevenue = filteredBills.reduce((sum, b) => sum + (b.total_ship_price ?? 0), 0)
  const totalFoodRevenue = filteredBills.reduce((sum, b) => sum + (b.total_food_price ?? 0), 0)
  const billCount = filteredBills.length

  const byMethod = useMemo(() => {
    const acc: Record<string, {count: number; total: number}> = {}
    filteredBills.forEach((b) => {
      const k = b.payment_method ?? 'unknown'
      acc[k] = acc[k] ?? {count: 0, total: 0}
      acc[k].count += 1
      acc[k].total += b.grand_total ?? 0
    })
    return acc
  }, [filteredBills])

  // Breakdown by period (for month → days, for year → months, for day → bills)
  const periodBreakdown = useMemo(() => {
    const acc: Record<string, {count: number; total: number}> = {}
    filteredBills.forEach((b) => {
      if (!b.booking_date) return
      let key = b.booking_date
      if (granularity === 'year') key = b.booking_date.slice(0, 7) // YYYY-MM
      if (granularity === 'day') key = b.booking_date
      acc[key] = acc[key] ?? {count: 0, total: 0}
      acc[key].count += 1
      acc[key].total += b.grand_total ?? 0
    })
    return Object.entries(acc).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredBills, granularity])

  // ─── Period label for header ───────────────────────────────────────────────
  const periodLabel = useMemo(() => {
    if (granularity === 'day') return `ວັນທີ ${formatDateDMY(dayValue)}`
    if (granularity === 'month') {
      const [y, m] = monthValue.split('-')
      return `ເດືອນ ${m}/${y}`
    }
    return `ປີ ${yearValue}`
  }, [granularity, dayValue, monthValue, yearValue])

  // ─── Export PDF (uses browser print → Save as PDF) ─────────────────────────
  const handleExportPdf = () => window.print()

  const setQuickToday = () => {
    const t = new Date()
    setGranularity('day')
    setDayValue(`${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`)
  }
  const setQuickThisMonth = () => {
    const t = new Date()
    setGranularity('month')
    setMonthValue(`${t.getFullYear()}-${pad2(t.getMonth() + 1)}`)
  }
  const setQuickThisYear = () => {
    const t = new Date()
    setGranularity('year')
    setYearValue(t.getFullYear())
  }

  return (
    <div className='card revenue-report'>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .revenue-report, .revenue-report * { visibility: visible; }
          .revenue-report { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; }
          .no-print { display: none !important; }
          .card { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className='card-header border-0 pt-6 pb-3'>
        <div className='card-title flex-column'>
          <h2 className='fw-bolder mb-1'>📊 ລາຍງານລາຍຮັບ</h2>
          <span className='text-muted fs-7'>{periodLabel}</span>
        </div>
        <div className='card-toolbar no-print'>
          <button type='button' className='btn btn-primary' onClick={handleExportPdf}>
            <KTIcon iconName='file-down' className='fs-3 me-2' />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='card-body pt-2 no-print'>
        <div className='d-flex flex-wrap align-items-center gap-2 mb-4'>
          <div className='btn-group btn-group-sm'>
            {(['day', 'month', 'year'] as const).map((g) => (
              <button
                key={g}
                type='button'
                className={`btn ${granularity === g ? 'btn-primary text-white' : 'btn-light'}`}
                onClick={() => setGranularity(g)}
              >
                {g === 'day' ? 'ວັນ' : g === 'month' ? 'ເດືອນ' : 'ປີ'}
              </button>
            ))}
          </div>

          {granularity === 'day' && (
            <input
              type='date'
              className='form-control form-control-sm ms-2'
              style={{width: 175}}
              value={dayValue}
              onChange={(e) => setDayValue(e.target.value)}
            />
          )}
          {granularity === 'month' && (
            <input
              type='month'
              className='form-control form-control-sm ms-2'
              style={{width: 165}}
              value={monthValue}
              onChange={(e) => setMonthValue(e.target.value)}
            />
          )}
          {granularity === 'year' && (
            <input
              type='number'
              min={2000}
              max={2100}
              className='form-control form-control-sm ms-2 text-center'
              style={{width: 110}}
              value={yearValue}
              onChange={(e) => setYearValue(Number(e.target.value) || today.getFullYear())}
            />
          )}

          <div className='vr mx-2 d-none d-md-block' />

          <button type='button' className='btn btn-sm btn-light-primary' onClick={setQuickToday}>
            ມື້ນີ້
          </button>
          <button type='button' className='btn btn-sm btn-light-primary' onClick={setQuickThisMonth}>
            ເດືອນນີ້
          </button>
          <button type='button' className='btn btn-sm btn-light-primary' onClick={setQuickThisYear}>
            ປີນີ້
          </button>

          <div className='vr mx-2 d-none d-md-block' />

          <select
            className='form-select form-select-sm'
            style={{width: 180}}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value=''>ທຸກວິທີຊຳລະ</option>
            <option value='cash'>ເງິນສົດ</option>
            <option value='cash+transfer'>ເງິນສົດ + ໂອນ</option>
            <option value='bcel'>BCEL QR</option>
          </select>
        </div>

        {/* Summary cards */}
        <div className='row g-4 mb-6'>
          <div className='col-md-3 col-6'>
            <div className='card bg-light-primary border-0 h-100'>
              <div className='card-body p-4'>
                <div className='text-muted fs-8 text-uppercase mb-1'>ລາຍຮັບລວມ</div>
                <div className='fw-bolder text-primary fs-3'>{fmtLak(totalRevenue)}</div>
              </div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div className='card bg-light-success border-0 h-100'>
              <div className='card-body p-4'>
                <div className='text-muted fs-8 text-uppercase mb-1'>ຈຳນວນບິນ</div>
                <div className='fw-bolder text-success fs-3'>{billCount}</div>
              </div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div className='card bg-light-info border-0 h-100'>
              <div className='card-body p-4'>
                <div className='text-muted fs-8 text-uppercase mb-1'>ຄ່າເຮືອ</div>
                <div className='fw-bolder text-info fs-4'>{fmtLak(totalShipRevenue)}</div>
              </div>
            </div>
          </div>
          <div className='col-md-3 col-6'>
            <div className='card bg-light-warning border-0 h-100'>
              <div className='card-body p-4'>
                <div className='text-muted fs-8 text-uppercase mb-1'>ຄ່າອາຫານ</div>
                <div className='fw-bolder text-warning fs-4'>{fmtLak(totalFoodRevenue)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className='card-body pt-0'>
        {/* Header for print only */}
        <div className='d-none d-print-block mb-4'>
          <h2 className='fw-bolder mb-1'>ລາຍງານລາຍຮັບ</h2>
          <div className='text-muted'>{periodLabel}</div>
        </div>

        {/* Summary table for print */}
        <div className='row mb-5'>
          <div className='col-md-6'>
            <h5 className='fw-bolder mb-3'>ສະຫຼຸບຕາມວິທີຊຳລະ</h5>
            <table className='table table-row-bordered table-row-gray-300 align-middle gs-0 gy-2'>
              <thead>
                <tr className='text-muted fw-bold fs-7 text-uppercase'>
                  <th>ວິທີ</th>
                  <th className='text-end'>ບິນ</th>
                  <th className='text-end'>ລາຍຮັບ</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(byMethod).length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-muted text-center py-3'>ບໍ່ມີຂໍ້ມູນ</td>
                  </tr>
                ) : (
                  Object.entries(byMethod).map(([m, v]) => (
                    <tr key={m}>
                      <td className='fw-semibold'>{paymentMethodLabel(m)}</td>
                      <td className='text-end'>{v.count}</td>
                      <td className='text-end fw-bold text-primary'>{fmtLak(v.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className='col-md-6'>
            <h5 className='fw-bolder mb-3'>
              ສະຫຼຸບຕາມ{granularity === 'year' ? 'ເດືອນ' : granularity === 'month' ? 'ວັນ' : 'ບິນ'}
            </h5>
            <table className='table table-row-bordered table-row-gray-300 align-middle gs-0 gy-2'>
              <thead>
                <tr className='text-muted fw-bold fs-7 text-uppercase'>
                  <th>{granularity === 'year' ? 'ເດືອນ' : 'ວັນທີ'}</th>
                  <th className='text-end'>ບິນ</th>
                  <th className='text-end'>ລາຍຮັບ</th>
                </tr>
              </thead>
              <tbody>
                {periodBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-muted text-center py-3'>ບໍ່ມີຂໍ້ມູນ</td>
                  </tr>
                ) : (
                  periodBreakdown.map(([key, v]) => (
                    <tr key={key}>
                      <td className='fw-semibold'>
                        {granularity === 'year' ? key : formatDateDMY(key)}
                      </td>
                      <td className='text-end'>{v.count}</td>
                      <td className='text-end fw-bold text-success'>{fmtLak(v.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed bills table */}
        <h5 className='fw-bolder mb-3'>ລາຍລະອຽດບິນ</h5>
        {isLoading ? (
          <div className='text-center py-10'>
            <span className='spinner-border text-primary' />
            <div className='text-muted mt-3'>ກຳລັງໂຫຼດ...</div>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className='text-center text-muted py-10'>ບໍ່ມີຂໍ້ມູນລາຍຮັບໃນຊ່ວງເວລານີ້</div>
        ) : (
          <div className='table-responsive'>
            <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-3'>
              <thead>
                <tr className='text-muted fw-bold fs-7 text-uppercase'>
                  <th>ບິນ</th>
                  <th>ລູກຄ້າ</th>
                  <th>ວັນທີ</th>
                  <th>ເຮືອ</th>
                  <th>ວິທີ</th>
                  <th className='text-end'>ລາຍຮັບ</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((b) => (
                  <tr key={b.id}>
                    <td className='fw-bold'>#{b.id.slice(0, 8).toUpperCase()}</td>
                    <td>
                      <div>{b.customer_name || b.user_name || '-'}</div>
                      {b.customer_phone && (
                        <div className='text-muted fs-8'>{b.customer_phone}</div>
                      )}
                    </td>
                    <td>
                      <div>{formatDateDMY(b.booking_date)}</div>
                      <div className='text-muted fs-8'>{b.booking_time}</div>
                    </td>
                    <td>{b.ship_name ?? '-'}</td>
                    <td>{paymentMethodLabel(b.payment_method)}</td>
                    <td className='text-end fw-bold text-primary'>
                      {fmtLak(b.grand_total ?? 0)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={5} className='fw-bolder text-end pt-4'>
                    ລວມທັງໝົດ
                  </td>
                  <td className='fw-bolder text-end fs-4 text-primary pt-4'>
                    {fmtLak(totalRevenue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export {RevenueReport}
