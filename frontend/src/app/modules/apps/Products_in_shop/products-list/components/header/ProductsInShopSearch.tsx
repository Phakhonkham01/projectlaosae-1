/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react'
import {initialQueryState, KTIcon, useDebounce} from '../../../../../../../_metronic/helpers'
import {useQueryRequest} from '../../../../addFood/users-list/core/QueryRequestProvider'

type Props = {
  placeholder: string
  scope: 'products' | 'ships'
}

const ProductsInShopSearch = ({placeholder, scope}: Props) => {
  const {updateState} = useQueryRequest()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 150)

  useEffect(() => {
    if (scope === 'products') {
      updateState({search: debouncedSearchTerm, ...initialQueryState})
    }
  }, [debouncedSearchTerm, scope])

  return (
    <div className='card-title m-0'>
      <div className='d-flex align-items-center position-relative my-1'>
        <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />
        <input
          type='text'
          className='form-control form-control-solid w-250px ps-14'
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  )
}

export {ProductsInShopSearch}
