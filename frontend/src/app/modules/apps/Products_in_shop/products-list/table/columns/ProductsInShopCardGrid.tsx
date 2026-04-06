import React from 'react'
import {Product} from '../../../../addFood/users-list/core/_models'
import {ProductsInShopCard} from './ProductsInShopCard'

type Props = {
  data: Product[]
  categoryMap: Record<string, string>
}

const ProductsInShopCardGrid: React.FC<Props> = ({data, categoryMap}) => {
  return (
    <>
      <style>{`
        .products-in-shop-grid .product-card-col {
          width: 50%;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }

        @media (max-width: 575.98px) {
          .products-in-shop-grid .product-card-col {
            width: 100%;
          }
        }

        @media (min-width: 1450px) {
          .products-in-shop-grid .product-card-col {
            width: 25%;
          }
        }
      `}</style>

      <div className='row g-5 products-in-shop-grid'>
        {data.length === 0 ? (
          <div className='col-12'>
            <div className='d-flex text-center w-100 align-content-center justify-content-center py-10'>
              <span className='text-muted fs-5'>No available products found</span>
            </div>
          </div>
        ) : (
          data.map((product, index) => (
            <div key={product.product_id || `${product.name}-${index}`} className='product-card-col'>
              <ProductsInShopCard
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

export {ProductsInShopCardGrid}
