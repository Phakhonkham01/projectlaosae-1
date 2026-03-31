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
        ຕົວກອງ
      </button>

      {/* Dropdown menu */}
      <div className='menu menu-sub menu-sub-dropdown w-300px w-md-325px' data-kt-menu='true'>
        <div className='px-7 py-5'>
          <div className='fs-5 text-gray-900 fw-bolder'>ຕົວເລືອກຕົວກອງ</div>
        </div>

        <div className='separator border-gray-200' />

        <div className='px-7 py-5' data-kt-user-table-filter='form'>

          {/* Role */}
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>ບົດບາດ:</label>
            <select
              className='form-select form-select-solid fw-bolder'
              onChange={(e) => setRole(e.target.value)}
              value={role}
            >
              <option value=''>ທຸກບົດບາດ</option>
              <option value='ownner'>ເຈົ້າຂອງ</option>
              <option value='employee'>ພະນັກງານ</option>
            </select>
          </div>

          {/* Status */}
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>ສະຖານະ:</label>
            <select
              className='form-select form-select-solid fw-bolder'
              onChange={(e) => setStatus(e.target.value)}
              value={status}
            >
              <option value=''>ທຸກສະຖານະ</option>
              <option value='Active'>ໃຊ້ງານ</option>
              <option value='Inactive'>ບໍ່ໃຊ້ງານ</option>
              <option value='On Leave'>ພັກວຽກ</option>
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
              ຣີເຊັດ
            </button>
            <button
              type='button'
              disabled={isLoading}
              onClick={filterData}
              className='btn btn-primary fw-bold px-6'
              data-kt-menu-dismiss='true'
            >
              ນຳໃຊ້
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export { EmployeesListFilter }
