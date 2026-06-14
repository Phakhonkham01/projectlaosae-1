import {useEffect, useState} from 'react'
import {MenuComponent} from '../../../../../../../_metronic/assets/ts/components'
import {initialQueryState} from '../../../../../../../_metronic/helpers'
import {PAYMENT_METHOD_OPTIONS} from '../../core/bill_models'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'

type DateMode = 'all' | 'day' | 'month' | 'year' | 'range'

const paymentMethodLabels: Record<string, string> = {
  cash: 'ເງິນສົດ',
  'cash+transfer': 'ເງິນສົດ + ໂອນ',
  bcel: 'BCEL QR',
}

const pad2 = (n: number) => n.toString().padStart(2, '0')
const toLocalDate = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
const toMonthInput = (date: Date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`

const UsersListFilter = () => {
  const {updateState} = useQueryRequest()
  const {isLoading} = useQueryResponse()
  const today = new Date()

  const [dateMode, setDateMode] = useState<DateMode>('month')
  const [dayDate, setDayDate] = useState(toLocalDate(today))
  const [monthDate, setMonthDate] = useState(toMonthInput(today))
  const [yearValue, setYearValue] = useState(today.getFullYear())
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    MenuComponent.reinitialization()
    const [yyyy, mm] = monthDate.split('-')
    updateState({
      filter: {
        dateRange: 'month',
        dateMonth: Number(mm),
        dateYear: Number(yyyy),
      },
      ...initialQueryState,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyFilter = (
    mode: DateMode,
    method: string,
    day: string,
    month: string,
    year: number,
    from: string,
    to: string
  ) => {
    if (mode === 'all') {
      updateState({
        filter: {paymentMethod: method || undefined},
        ...initialQueryState,
      })
      return
    }

    if (mode === 'range') {
      updateState({
        filter: {
          bookingDateFrom: from || undefined,
          bookingDateTo: to || undefined,
          paymentMethod: method || undefined,
        },
        ...initialQueryState,
      })
      return
    }

    if (mode === 'day') {
      const [yy, mm, dd] = day.split('-').map(Number)
      updateState({
        filter: {
          dateRange: 'day',
          dateDay: dd,
          dateMonth: mm,
          dateYear: yy,
          paymentMethod: method || undefined,
        },
        ...initialQueryState,
      })
      return
    }

    if (mode === 'month') {
      const [yy, mm] = month.split('-').map(Number)
      updateState({
        filter: {
          dateRange: 'month',
          dateMonth: mm,
          dateYear: yy,
          paymentMethod: method || undefined,
        },
        ...initialQueryState,
      })
      return
    }

    if (mode === 'year') {
      updateState({
        filter: {
          dateRange: 'year',
          dateYear: year,
          paymentMethod: method || undefined,
        },
        ...initialQueryState,
      })
    }
  }

  const apply = (overrides: Partial<{
    mode: DateMode
    method: string
    day: string
    month: string
    year: number
    from: string
    to: string
  }> = {}) => {
    applyFilter(
      overrides.mode ?? dateMode,
      overrides.method ?? paymentMethod,
      overrides.day ?? dayDate,
      overrides.month ?? monthDate,
      overrides.year ?? yearValue,
      overrides.from ?? rangeFrom,
      overrides.to ?? rangeTo
    )
  }

  const resetData = () => {
    const now = new Date()
    setDateMode('month')
    setDayDate(toLocalDate(now))
    setMonthDate(toMonthInput(now))
    setYearValue(now.getFullYear())
    setRangeFrom('')
    setRangeTo('')
    setPaymentMethod('')
    updateState({filter: undefined, ...initialQueryState})
  }

  const setQuickToday = () => {
    const t = toLocalDate(new Date())
    setDateMode('day')
    setDayDate(t)
    apply({mode: 'day', day: t})
  }

  const setQuickThisMonth = () => {
    const m = toMonthInput(new Date())
    setDateMode('month')
    setMonthDate(m)
    apply({mode: 'month', month: m})
  }

  const setQuickThisYear = () => {
    const y = new Date().getFullYear()
    setDateMode('year')
    setYearValue(y)
    apply({mode: 'year', year: y})
  }

  const setQuickAll = () => {
    setDateMode('all')
    apply({mode: 'all'})
  }

  const modeButton = (mode: DateMode, label: string) => (
    <button
      type='button'
      className={`btn btn-sm ${dateMode === mode ? 'btn-primary text-white' : 'btn-light'}`}
      onClick={() => {
        setDateMode(mode)
        apply({mode})
      }}
    >
      {label}
    </button>
  )

  return (
    <>
      <div className='d-flex align-items-center flex-wrap gap-2 mb-3'>
        {/* Mode tabs */}
        <div className='btn-group btn-group-sm' role='group'>
          {modeButton('day', 'ວັນ')}
          {modeButton('month', 'ເດືອນ')}
          {modeButton('year', 'ປີ')}
          {modeButton('range', 'ຊ່ວງ')}
          {modeButton('all', 'ທັງໝົດ')}
        </div>

        {/* Selected mode input */}
        {dateMode === 'day' && (
          <input
            type='date'
            className='form-control form-control-sm ms-2'
            style={{width: 170}}
            value={dayDate}
            onChange={(e) => {
              setDayDate(e.target.value)
              if (e.target.value) apply({mode: 'day', day: e.target.value})
            }}
          />
        )}
        {dateMode === 'month' && (
          <input
            type='month'
            className='form-control form-control-sm ms-2'
            style={{width: 160}}
            value={monthDate}
            onChange={(e) => {
              setMonthDate(e.target.value)
              if (e.target.value) apply({mode: 'month', month: e.target.value})
            }}
          />
        )}
        {dateMode === 'year' && (
          <input
            type='number'
            min={1900}
            max={2100}
            className='form-control form-control-sm ms-2 text-center'
            style={{width: 110}}
            value={yearValue}
            onChange={(e) => {
              const next = Number(e.target.value) || today.getFullYear()
              setYearValue(next)
              apply({mode: 'year', year: next})
            }}
          />
        )}
        {dateMode === 'range' && (
          <div className='d-flex align-items-center gap-1 ms-2'>
            <input
              type='date'
              className='form-control form-control-sm'
              style={{width: 165}}
              value={rangeFrom}
              onChange={(e) => {
                setRangeFrom(e.target.value)
                apply({mode: 'range', from: e.target.value})
              }}
            />
            <span className='text-muted px-1'>→</span>
            <input
              type='date'
              className='form-control form-control-sm'
              style={{width: 165}}
              value={rangeTo}
              onChange={(e) => {
                setRangeTo(e.target.value)
                apply({mode: 'range', to: e.target.value})
              }}
            />
          </div>
        )}

        {/* Quick actions */}
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
        <button type='button' className='btn btn-sm btn-light' onClick={setQuickAll}>
          ທັງໝົດ
        </button>
      </div>

      <div className='menu menu-sub menu-sub-dropdown w-325px' data-kt-menu='true'>
        <div className='px-7 py-5'>
          <div className='fs-5 text-gray-900 fw-bolder'>ຕົວກອງບິນ</div>
        </div>

        <div className='separator border-gray-200' />

        <div className='px-7 py-5' data-kt-user-table-filter='form'>
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>ວິທີຊຳລະ</label>
            <select
              className='form-select form-select-solid'
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value)
                apply({method: e.target.value})
              }}
            >
              <option value=''>ທຸກວິທີ</option>
              {PAYMENT_METHOD_OPTIONS.map((method) => (
                <option key={method} value={method}>
                  {paymentMethodLabels[method] ?? method}
                </option>
              ))}
            </select>
          </div>

          <div className='d-flex justify-content-end'>
            <button
              type='button'
              disabled={isLoading}
              onClick={resetData}
              className='btn btn-light btn-active-light-primary fw-bold me-2 px-6'
              data-kt-menu-dismiss='true'
            >
              ຣີເຊັດ
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export {UsersListFilter}
