import { useEffect, useState } from 'react'
import { MenuComponent } from '../../../../../../../_metronic/assets/ts/components'
import { initialQueryState, KTIcon } from '../../../../../../../_metronic/helpers'
import { useQueryRequest } from '../../core/QueryRequestProvider'
import { useQueryResponse } from '../../core/QueryResponseProvider'

const UsersListFilter = () => {
  const { updateState } = useQueryRequest()
  const { isLoading } = useQueryResponse()
  const [role, setRole] = useState<string>('')
  const [status, setStatus] = useState<string | undefined>(undefined)

  // เรียก reinitialization ตอน mount
  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  // ฟังก์ชันรีเซ็ต
  const resetData = () => {
    setRole('')
    setStatus(undefined)
    updateState({ filter: undefined, ...initialQueryState })
    MenuComponent.reinitialization() // รีเซ็ต UI dropdown
  }

  // ฟังก์ชันกรองข้อมูล
  const filterData = () => {
    const filter: Record<string, string> = {}

    if (role) filter.role = role
    if (status !== undefined) filter.status = status  // เฉพาะ status ที่มีค่า

    updateState({
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      ...initialQueryState,
    })
  }


  return (
    <>
      {/* ปุ่ม Filter */}
      <button
        disabled={isLoading}
        type='button'
        className='btn btn-light-primary me-3'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        <KTIcon iconName='filter' className='fs-2' />
        ກັ່ນຕອງ
      </button>

      {/* เมนู dropdown */}
      <div className='menu menu-sub menu-sub-dropdown w-300px w-md-325px' data-kt-menu='true'>
        {/* Header */}
        <div className='px-7 py-5'>
          <div className='fs-5 text-gray-900 fw-bolder'>ຕົວເລືອກການກັ່ນຕອງ</div>
        </div>

        <div className='separator border-gray-200'></div>

        {/* Content */}
        <div className='px-7 py-5' data-kt-user-table-filter='form'>
          {/* Role */}
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>ບົດບາດ:</label>
            <select
              className='form-select form-select-solid fw-bolder'
              data-kt-select2='true'
              data-placeholder='ເລືອກລາຍການ'
              data-allow-clear='true'
              data-kt-user-table-filter='role'
              data-hide-search='true'
              onChange={(e) => setRole(e.target.value)}
              value={role}
            >
              <option value=''>ເລືອກບົດບາດ</option>
              <option value='admin'>ຜູ້ດູແລ</option>
              <option value='employee'>ພະນັກງານ</option>
              <option value='supervisor'>ຫົວໜ້າຄວບຄຸມ</option>
            </select>
          </div>

          {/* Status */}
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>ສະຖານະ:</label>
            <select
              className='form-select form-select-solid fw-bolder'
              data-kt-select2='true'
              data-placeholder='ເລືອກສະຖານະ'
              data-allow-clear='true'
              data-hide-search='true'
              onChange={(e) => setStatus(e.target.value || undefined)}
              value={status || ''}
            >
              <option value=''>ທຸກສະຖານະ</option>
              <option value='Active'>ພ້ອມໃຊ້ງານ</option>
              <option value='Inactive'>ບໍ່ພ້ອມໃຊ້ງານ</option>
              <option value='On Leave'>ຢຸດໃຫ້ບໍລິການ</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className='d-flex justify-content-end'>
            <button
              type='button'
              disabled={isLoading}
              onClick={resetData}
              className='btn btn-light btn-active-light-primary fw-bold me-2 px-6'
              data-kt-menu-dismiss='true'
              data-kt-user-table-filter='reset'
            >
              ຣີເຊັດ
            </button>
            <button
              disabled={isLoading}
              type='button'
              onClick={filterData}
              className='btn btn-primary fw-bold px-6'
              data-kt-menu-dismiss='true'
              data-kt-user-table-filter='filter'
            >
              ນຳໃຊ້
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export { UsersListFilter }
