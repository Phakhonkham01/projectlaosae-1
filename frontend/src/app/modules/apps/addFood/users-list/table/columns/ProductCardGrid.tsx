import React from 'react'
import {Product} from '../../core/_models'
import {ProductCard} from './ProductCard'

type Props = {
  data: Product[]
  categoryMap: Record<string, string>
}

const ProductCardGrid: React.FC<Props> = ({data, categoryMap}) => {
  return (
    <>
      <style>{`
        .product-card-grid .product-card-col {
          width: 50%;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }

        @media (max-width: 575.98px) {
          .product-card-grid .product-card-col {
            width: 100%;
          }
        }

        @media (min-width: 1450px) {
          .product-card-grid .product-card-col {
            width: 25%;
          }
        }

        @media (min-width: 2000px) {
          .product-card-grid {
            --bs-gutter-x: 2rem;
          }

          .product-card-grid .product-card-col {
            width: 25%;
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>

      <div className='row g-5 product-card-grid'>
        {data.length === 0 ? (
          <div className='col-12'>
            <div className='d-flex text-center w-100 align-content-center justify-content-center py-10'>
              <span className='text-muted fs-5'>No products found</span>
            </div>
          </div>
        ) : (
          data.map((product, index) => (
            <div key={product.product_id || `${product.name}-${index}`} className='product-card-col'>
              <ProductCard
                product={product}
                index={index}
                categoryName={categoryMap[product.category_id]}
              />
            </div>
          ))
        )}
      </div>
    </>
  )
}

export {ProductCardGrid}
