import {useEffect, useState} from 'react'
import {MenuComponent} from '../../../../../../../_metronic/assets/ts/components'
import {initialQueryState, KTIcon} from '../../../../../../../_metronic/helpers'
import {PAYMENT_METHOD_OPTIONS} from '../../core/bill_models'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'

type DateTab = 'all' | 'today' | 'this_month' | 'this_year'

const dateTabs: { label: string; value: DateTab }[] = [
  { label: 'All',   value: 'all' },
  { label: 'Today', value: 'today' },
]

const UsersListFilter = () => {
  const {updateState} = useQueryRequest()
  const {isLoading} = useQueryResponse()
  const [activeTab, setActiveTab] = useState<DateTab>('all')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [rangeType, setRangeType] = useState<'this_month' | 'this_year'>('this_month')
  const [rangeValue, setRangeValue] = useState<number>(() => {
    const now = new Date()
    return now.getMonth() + 1
  })

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const now = new Date()
  const monthNow = now.getMonth() + 1
  const yearNow = now.getFullYear()

  const getOffset = (type: 'this_month' | 'this_year', value: number) =>
    type === 'this_month' ? value - monthNow : value - yearNow

  const applyFilter = (tab: DateTab, method: string, offset = 0) => {
    const filter: Record<string, string | number | undefined> = {
      dateRange: tab !== 'all' ? tab : undefined,
      paymentMethod: method || undefined,
      dateOffset: tab === 'this_month' || tab === 'this_year' ? offset : undefined,
    }

    updateState({
      filter: Object.values(filter).some(Boolean) ? filter : undefined,
      ...initialQueryState,
    })
  }

  const handleTabChange = (tab: DateTab) => {
    setActiveTab(tab)
    if (tab === 'all' || tab === 'today') {
      applyFilter(tab, paymentMethod, 0)
    }
  }

  const applyRange = (type: 'this_month' | 'this_year', value: number) => {
    const offset = getOffset(type, value)
    setRangeType(type)
    setRangeValue(value)
    setActiveTab(type)
    applyFilter(type, paymentMethod, offset)
  }

  const resetData = () => {
    const nowMonth = new Date().getMonth() + 1
    const nowYear = new Date().getFullYear()

    setActiveTab('all')
    setPaymentMethod('')
    setRangeType('this_month')
    setRangeValue(nowMonth)
    updateState({filter: undefined, ...initialQueryState})
  }

  const changeRangeValue = (delta: number) => {
    let next = rangeValue + delta
    if (rangeType === 'this_month') {
      next = Math.min(12, Math.max(1, next))
    }
    if (rangeType === 'this_year') {
      next = Math.max(1900, next)
    }

    applyRange(rangeType, next)
  }

  return (
    <>
      {/* Date Tabs */}
      <div className='d-flex align-items-center me-3'>
        <ul className='nav nav-tabs nav-line-tabs nav-stretch fs-6 border-0'>
          {dateTabs.map(tab => (
            <li key={tab.value} className='nav-item'>
              <a
                className={`nav-link fw-bold ${activeTab === tab.value ? 'active' : 'text-muted'}`}
                onClick={() => handleTabChange(tab.value)}
                style={{cursor: 'pointer'}}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Month/Year controls (no separate tabs for this_month/this_year) */}
      <div className='d-flex align-items-center mb-3'>
        <label className='form-label me-2 fw-bold'>Range</label>

        <button
          type='button'
          className={`btn btn-sm me-2 ${rangeType === 'this_month' ? 'btn-primary text-white' : 'btn-light'}`}
          onClick={() => applyRange('this_month', new Date().getMonth() + 1)}
        >
          Month
        </button>
        <button
          type='button'
          className={`btn btn-sm me-3 ${rangeType === 'this_year' ? 'btn-primary text-white' : 'btn-light'}`}
          onClick={() => applyRange('this_year', new Date().getFullYear())}
        >
          Year
        </button>

        <button
          type='button'
          className='btn btn-light btn-sm me-1'
          onClick={() => changeRangeValue(-1)}
        >
          -
        </button>

        <input
          type='number'
          min={rangeType === 'this_month' ? 1 : 1900}
          max={rangeType === 'this_month' ? 12 : undefined}
          className='form-control form-control-sm text-center mw-75px me-1'
          value={rangeValue}
          onChange={(e) => {
            let next = Number(e.target.value)
            if (Number.isNaN(next)) return
            if (rangeType === 'this_month') {
              next = Math.max(1, Math.min(12, next))
            }
            applyRange(rangeType, next)
          }}
        />

        <button
          type='button'
          className='btn btn-light btn-sm'
          onClick={() => changeRangeValue(1)}
        >
          +
        </button>

        {/* <span className='ms-2 text-muted'>default is {rangeType === 'this_month' ? `${monthNow} (this month)` : `${yearNow} (this year)`}</span> */}
      </div>

      {/* Payment Method Filter */}
      {/* <button
        disabled={isLoading}
        type='button'
        className='btn btn-light-primary me-3'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        <KTIcon iconName='filter' className='fs-2' />
        Filter Bills
      </button> */}

      <div className='menu menu-sub menu-sub-dropdown w-325px' data-kt-menu='true'>
        <div className='px-7 py-5'>
          <div className='fs-5 text-gray-900 fw-bolder'>Bill Filters</div>
        </div>

        <div className='separator border-gray-200' />

        <div className='px-7 py-5' data-kt-user-table-filter='form'>
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>Payment Method</label>
            <select
              className='form-select form-select-solid'
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value)
                applyFilter(activeTab, e.target.value)
              }}
            >
              <option value=''>All Methods</option>
              {PAYMENT_METHOD_OPTIONS.map((method) => (
                <option key={method} value={method}>
                  {method === 'cash' ? 'Cash' : 'Transfer'}
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
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export {UsersListFilter}