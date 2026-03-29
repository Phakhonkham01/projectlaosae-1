import {useEffect, useState} from 'react'
import {MenuComponent} from '../../../../../../../_metronic/assets/ts/components'
import {initialQueryState, KTIcon} from '../../../../../../../_metronic/helpers'
import {PAYMENT_METHOD_OPTIONS} from '../../core/bill_models'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'

type DateTab = 'all' | 'today' | 'this_month' | 'this_year'

const dateTabs: { label: string; value: DateTab }[] = [
  { label: 'All',        value: 'all'        },
  { label: 'Today',      value: 'today'      },
  { label: 'This Month', value: 'this_month' },
  { label: 'This Year',  value: 'this_year'  },
]

const UsersListFilter = () => {
  const {updateState} = useQueryRequest()
  const {isLoading} = useQueryResponse()
  const [activeTab, setActiveTab] = useState<DateTab>('all')
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const handleTabChange = (tab: DateTab) => {
    setActiveTab(tab)
    applyFilter(tab, paymentMethod)
  }

  const applyFilter = (tab: DateTab, method: string) => {
    const filter: Record<string, string | undefined> = {
      dateRange: tab !== 'all' ? tab : undefined,
      paymentMethod: method || undefined,
    }

    updateState({
      filter: Object.values(filter).some(Boolean) ? filter : undefined,
      ...initialQueryState,
    })
  }

  const resetData = () => {
    setActiveTab('all')
    setPaymentMethod('')
    updateState({filter: undefined, ...initialQueryState})
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