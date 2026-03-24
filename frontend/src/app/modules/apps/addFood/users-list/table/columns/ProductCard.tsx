import React from 'react'
import {Product} from '../../core/_models'
import {UserActionsCell} from './UserActionsCell'

type Props = {
  product: Product
  index: number
  categoryName?: string
}

const ProductCard: React.FC<Props> = ({product, index, categoryName}) => {
  const imageSrc = product.image || '/media/avatars/blank.png'

  return (
    <div className='card card-flush h-md-100 shadow-sm'>
      <div
        className='card-header p-0 overflow-hidden'
        style={{borderRadius: '0.625rem 0.625rem 0 0', maxHeight: '200px'}}
      >
        <img
          src={imageSrc}
          alt={product.name}
          className='w-100 object-fit-cover'
          style={{height: '200px'}}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/media/avatars/blank.png'
          }}
        />
      </div>

      <div className='card-body d-flex flex-column gap-3 pt-4 pb-3 px-5'>
        <div className='d-flex justify-content-between align-items-center gap-2'>
          <span className='badge badge-light-primary fw-bold fs-8'>#{index + 1}</span>
          <span className={`badge fw-bolder badge-light-${product.availability ? 'success' : 'danger'}`}>
            {product.availability ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div>
          <span className='text-gray-900 fw-bold fs-5 d-block text-truncate'>{product.name}</span>
          <span className='text-muted fw-semibold fs-7 d-block mt-1 text-truncate'>
            {categoryName || 'Uncategorized'}
          </span>
        </div>

        <div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
          <div className='d-flex flex-column align-items-start'>
            <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>Price</span>
            <span className='text-primary fw-bold fs-6'>
              {product.price.toLocaleString()} LAK
            </span>
          </div>

          <div className='d-flex flex-column align-items-start'>
            <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>Category</span>
            <span className='text-gray-700 fw-bold fs-6 text-truncate'>
              {categoryName || '-'}
            </span>
          </div>
        </div>
      </div>

      <div className='card-footer d-flex justify-content-end py-3 px-5 border-top'>
        <UserActionsCell id={product.product_id} />
      </div>
    </div>
  )
}

export {ProductCard}
