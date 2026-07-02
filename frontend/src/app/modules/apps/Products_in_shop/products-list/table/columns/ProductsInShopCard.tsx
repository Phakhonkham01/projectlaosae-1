import React from 'react'
import {Product} from '../../../../addFood/users-list/core/_models'

type Props = {
  product: Product
  index: number
  categoryName?: string
}

const ProductsInShopCard: React.FC<Props> = ({product, index, categoryName}) => {
  const imageSrc = product.imageUrl || '/media/avatars/blank.png'
  const isUnavailable = product.available === false

  return (
    <div className={`card card-flush h-100 shadow-sm product-shop-card ${isUnavailable ? 'border border-secondary' : ''}`}>
      <div className='card-header p-0 overflow-hidden position-relative product-shop-card__media'>
        <img
          src={imageSrc}
          alt={product.name}
          className='w-100 object-fit-cover product-shop-card__img'
          loading='lazy'
          style={{
            opacity: isUnavailable ? 0.35 : 1,
            filter: isUnavailable ? 'grayscale(100%)' : 'none',
            transition: 'opacity .2s, filter .2s',
          }}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/media/avatars/blank.png'
          }}
        />
        {isUnavailable && (
          <div
            className='position-absolute top-50 start-50 translate-middle text-center w-100 px-3'
            style={{pointerEvents: 'none'}}
          >
            <span
              className='badge bg-danger text-white fw-bolder fs-6 px-4 py-3 shadow-sm'
              style={{letterSpacing: '0.04em'}}
            >
              🚫 ໝົດ
            </span>
          </div>
        )}
        <span
          className={`badge position-absolute top-0 end-0 m-3 fw-bold shadow-sm ${
            isUnavailable ? 'badge-secondary' : 'badge-success'
          }`}
        >
          {isUnavailable ? 'ບໍ່ມີຂາຍ' : 'ມີຂາຍ'}
        </span>
        <span className='badge badge-circle badge-light position-absolute top-0 start-0 m-3 fw-bold text-gray-700 shadow-sm'>
          {index + 1}
        </span>
      </div>

      <div className='card-body d-flex flex-column gap-4 pt-5 pb-5 px-5'>
        <div>
          <span className='text-gray-900 fw-bold fs-4 d-block text-truncate' title={product.name}>
            {product.name}
          </span>
          <span className='badge badge-light-info fw-semibold mt-2'>
            {categoryName || 'ບໍ່ໄດ້ຈັດໝວດ'}
          </span>
        </div>

        <div className='d-flex align-items-end justify-content-between mt-auto pt-3 border-top border-gray-200'>
          <div className='d-flex flex-column'>
            <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>ລາຄາ</span>
            <span className='text-primary fw-bolder fs-2'>
              {product.price.toLocaleString()}
              <span className='fs-7 fw-semibold text-muted ms-1'>ກີບ</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export {ProductsInShopCard}
