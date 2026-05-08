import {useEffect, useState} from 'react'
import {MenuComponent} from '../../../../../../../_metronic/assets/ts/components'
import {initialQueryState} from '../../../../../../../_metronic/helpers'
import {PAYMENT_METHOD_OPTIONS} from '../../core/bill_models'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'

type DateRange = 'day' | 'month' | 'year'

const paymentMethodLabels: Record<string, string> = {
  cash: 'ເງິນສົດ',
  transfer: 'ໂອນເງິນ',
  'cash+transfer': 'ເງິນສົດ + ໂອນ',
  bcel: 'BCEL QR',
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const UsersListFilter = () => {
  const {updateState} = useQueryRequest()
  const {isLoading} = useQueryResponse()
  const today = new Date()
  const [activeRange, setActiveRange] = useState<DateRange>('month')
  const [dayValue, setDayValue] = useState(today.getDate())
  const [monthValue, setMonthValue] = useState(today.getMonth() + 1)
  const [yearValue, setYearValue] = useState(today.getFullYear())
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    MenuComponent.reinitialization()
    updateState({
      filter: {
        dateRange: 'month',
        dateMonth: monthValue,
        dateYear: yearValue,
      },
      ...initialQueryState,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyFilter = (
    range: DateRange = activeRange,
    method = paymentMethod,
    day = dayValue,
    month = monthValue,
    year = yearValue
  ) => {
    updateState({
      filter: {
        dateRange: range,
        dateDay: range === 'day' ? day : undefined,
        dateMonth: range === 'day' || range === 'month' ? month : undefined,
        dateYear: year,
        paymentMethod: method || undefined,
      },
      ...initialQueryState,
    })
  }

  const resetData = () => {
    const now = new Date()
    const nextDay = now.getDate()
    const nextMonth = now.getMonth() + 1
    const nextYear = now.getFullYear()

    setActiveRange('month')
    setDayValue(nextDay)
    setMonthValue(nextMonth)
    setYearValue(nextYear)
    setPaymentMethod('')
    updateState({filter: undefined, ...initialQueryState})
  }

  const selectRange = (range: DateRange) => {
    setActiveRange(range)
    applyFilter(range)
  }

  const updateDay = (value: number) => {
    const next = clamp(value, 1, 31)
    setDayValue(next)
    setActiveRange('day')
    applyFilter('day', paymentMethod, next, monthValue, yearValue)
  }

  const updateMonth = (value: number) => {
    const next = clamp(value, 1, 12)
    setMonthValue(next)
    setActiveRange('month')
    applyFilter('month', paymentMethod, dayValue, next, yearValue)
  }

  const updateYear = (value: number) => {
    const next = Math.max(1900, value)
    setYearValue(next)
    setActiveRange('year')
    applyFilter('year', paymentMethod, dayValue, monthValue, next)
  }

  const stepButtonClass = 'btn btn-light btn-sm px-3'
  const inputClass = 'form-control form-control-sm text-center mw-75px'

  return (
    <>
      <div className='d-flex align-items-center flex-wrap gap-2 mb-3'>
        <button
          type='button'
          className={`btn btn-sm ${activeRange === 'day' ? 'btn-primary text-white' : 'btn-light'}`}
          onClick={() => selectRange('day')}
        >
          ວັນ
        </button>
        <button type='button' className={stepButtonClass} onClick={() => updateDay(dayValue - 1)}>
          -
        </button>
        <input
          type='number'
          min={1}
          max={31}
          className={inputClass}
          value={dayValue}
          onChange={(e) => updateDay(Number(e.target.value) || 1)}
        />
        <button type='button' className={stepButtonClass} onClick={() => updateDay(dayValue + 1)}>
          +
        </button>

        <button
          type='button'
          className={`btn btn-sm ms-2 ${activeRange === 'month' ? 'btn-primary text-white' : 'btn-light'}`}
          onClick={() => selectRange('month')}
        >
          ເດືອນ
        </button>
        <button type='button' className={stepButtonClass} onClick={() => updateMonth(monthValue - 1)}>
          -
        </button>
        <input
          type='number'
          min={1}
          max={12}
          className={inputClass}
          value={monthValue}
          onChange={(e) => updateMonth(Number(e.target.value) || 1)}
        />
        <button type='button' className={stepButtonClass} onClick={() => updateMonth(monthValue + 1)}>
          +
        </button>

        <button
          type='button'
          className={`btn btn-sm ms-2 ${activeRange === 'year' ? 'btn-primary text-white' : 'btn-light'}`}
          onClick={() => selectRange('year')}
        >
          ປີ
        </button>
        <button type='button' className={stepButtonClass} onClick={() => updateYear(yearValue - 1)}>
          -
        </button>
        <input
          type='number'
          min={1900}
          className={inputClass}
          value={yearValue}
          onChange={(e) => updateYear(Number(e.target.value) || today.getFullYear())}
        />
        <button type='button' className={stepButtonClass} onClick={() => updateYear(yearValue + 1)}>
          +
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
                applyFilter(activeRange, e.target.value)
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
