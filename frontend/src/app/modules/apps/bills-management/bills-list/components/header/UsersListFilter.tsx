import {useEffect, useState} from 'react'
import {MenuComponent} from '../../../../../../../_metronic/assets/ts/components'
import {initialQueryState, KTIcon} from '../../../../../../../_metronic/helpers'
import {PAYMENT_METHOD_OPTIONS} from '../../core/bill_models'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'

const UsersListFilter = () => {
  const {updateState} = useQueryRequest()
  const {isLoading} = useQueryResponse()
  const [bookingDateFrom, setBookingDateFrom] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const resetData = () => {
    setBookingDateFrom('')
    setPaymentMethod('')
    updateState({filter: undefined, ...initialQueryState})
    MenuComponent.reinitialization()
  }

  const filterData = () => {
    const filter = {
      bookingDateFrom: bookingDateFrom || undefined,
      paymentMethod: paymentMethod || undefined,
    }

    updateState({
      filter: Object.values(filter).some(Boolean) ? filter : undefined,
      ...initialQueryState,
    })
  }

  return (
    <>
      <button
        disabled={isLoading}
        type='button'
        className='btn btn-light-primary me-3'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        <KTIcon iconName='filter' className='fs-2' />
        Filter Bills
      </button>

      <div className='menu menu-sub menu-sub-dropdown w-325px' data-kt-menu='true'>
        <div className='px-7 py-5'>
          <div className='fs-5 text-gray-900 fw-bolder'>Bill Filters</div>
        </div>

        <div className='separator border-gray-200'></div>

        <div className='px-7 py-5' data-kt-user-table-filter='form'>
          <div className='mb-7'>
            <label className='form-label fs-6 fw-bold'>Booking Date From</label>
            <input
              type='date'
              className='form-control form-control-solid'
              value={bookingDateFrom}
              onChange={(event) => setBookingDateFrom(event.target.value)}
            />
          </div>

          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>Payment Method</label>
            <select
              className='form-select form-select-solid'
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
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
            <button
              disabled={isLoading}
              type='button'
              onClick={filterData}
              className='btn btn-primary fw-bold px-6'
              data-kt-menu-dismiss='true'
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export {UsersListFilter}
