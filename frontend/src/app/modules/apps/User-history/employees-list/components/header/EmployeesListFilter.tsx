import { useEffect, useState } from 'react'
import { MenuComponent } from '../../../../../../../_metronic/assets/ts/components'
import { initialQueryState, KTIcon } from '../../../../../../../_metronic/helpers'
import { useQueryRequest } from '../../core/QueryRequestProvider'
import { useQueryResponse } from '../../core/QueryResponseProvider'

const EmployeesListFilter = () => {
  const { updateState } = useQueryRequest()
  const { isLoading } = useQueryResponse()

  const [role, setRole] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const resetData = () => {
    setRole('')
    setStatus('')
    updateState({ filter: undefined, ...initialQueryState })
  }

  const filterData = () => {
    const filter: Record<string, string> = {}
    if (role) filter.role = role
    if (status) filter.status = status

    updateState({
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      ...initialQueryState,
    })
  }

  return (
    <>
      {/* Filter button */}
      <button
        disabled={isLoading}
        type='button'
        className='btn btn-light-primary me-3'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        <KTIcon iconName='filter' className='fs-2' />
        Filter
      </button>

      {/* Dropdown menu */}
      <div className='menu menu-sub menu-sub-dropdown w-300px w-md-325px' data-kt-menu='true'>
        <div className='px-7 py-5'>
          <div className='fs-5 text-gray-900 fw-bolder'>Filter Options</div>
        </div>

        <div className='separator border-gray-200' />

        <div className='px-7 py-5' data-kt-user-table-filter='form'>

          {/* Role */}
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>Role:</label>
            <select
              className='form-select form-select-solid fw-bolder'
              onChange={(e) => setRole(e.target.value)}
              value={role}
            >
              <option value=''>All Roles</option>
              <option value='ownner'>OWNNER</option>
              <option value='employee'>EMPLOYEE</option>
            </select>
          </div>

          {/* Status */}
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>Status:</label>
            <select
              className='form-select form-select-solid fw-bolder'
              onChange={(e) => setStatus(e.target.value)}
              value={status}
            >
              <option value=''>All Status</option>
              <option value='Active'>Active</option>
              <option value='Inactive'>Inactive</option>
              <option value='On Leave'>On Leave</option>
            </select>
          </div>

          {/* Buttons */}
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
              type='button'
              disabled={isLoading}
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

export { EmployeesListFilter }