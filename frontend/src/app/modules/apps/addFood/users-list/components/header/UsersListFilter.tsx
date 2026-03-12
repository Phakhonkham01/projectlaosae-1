import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { MenuComponent } from '../../../../../../../_metronic/assets/ts/components'
import { initialQueryState, KTIcon } from '../../../../../../../_metronic/helpers'
import { useQueryRequest } from '../../core/QueryRequestProvider'
import { useQueryResponse } from '../../core/QueryResponseProvider'
import { db } from '../../../../../../../../../firebase/useFirebase' // ✅ ปรับ path

interface Category {
  category_id: string
  name: string
}

const UsersListFilter = () => {
  const { updateState } = useQueryRequest()
  const { isLoading } = useQueryResponse()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [availability, setAvailability] = useState<string>('')

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  // ── Fetch categories ───────────────────────────────────────────────────────
  useEffect(() => {
    getDocs(collection(db, 'categories'))
      .then((snapshot) => {
        setCategories(
          snapshot.docs.map((d) => ({
            category_id: d.id,
            name: (d.data() as { name: string }).name,
          }))
        )
      })
      .catch(console.error)
  }, [])

  const resetData = () => {
    setSelectedCategory('')
    setAvailability('')
    updateState({ filter: undefined, ...initialQueryState })
    MenuComponent.reinitialization()
  }

  const filterData = () => {
    const filter: Record<string, string> = {}
    if (selectedCategory) filter.category_id = selectedCategory
    if (availability !== '') filter.availability = availability

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

          {/* Category */}
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>Category:</label>
            <select
              className='form-select form-select-solid fw-bolder'
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              <option value=''>All Categories</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>Availability:</label>
            <select
              className='form-select form-select-solid fw-bolder'
              onChange={(e) => setAvailability(e.target.value)}
              value={availability}
            >
              <option value=''>All</option>
              <option value='true'>Available</option>
              <option value='false'>Unavailable</option>
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

export { UsersListFilter }