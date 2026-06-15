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
          width: 100%;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        @media (min-width: 576px) {
          .products-in-shop-grid .product-card-col { width: 50%; }
        }
        @media (min-width: 992px) {
          .products-in-shop-grid .product-card-col { width: 33.3333%; }
        }
        @media (min-width: 1450px) {
          .products-in-shop-grid .product-card-col { width: 25%; }
        }

        .product-shop-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid var(--bs-gray-200);
        }
        .product-shop-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.12) !important;
        }
        .product-shop-card__media {
          border-radius: 0.625rem 0.625rem 0 0;
          aspect-ratio: 4 / 3;
          background: var(--bs-gray-100);
        }
        .product-shop-card__img {
          height: 100%;
          transition: transform 0.4s ease;
        }
        .product-shop-card:hover .product-shop-card__img {
          transform: scale(1.06);
        }
      `}</style>

      <div className='row g-5 products-in-shop-grid'>
        {data.length === 0 ? (
          <div className='col-12'>
            <div className='d-flex flex-column text-center w-100 align-items-center justify-content-center py-15'>
              <i className='ki-duotone ki-basket fs-3x text-muted mb-3'>
                <span className='path1' />
                <span className='path2' />
                <span className='path3' />
                <span className='path4' />
              </i>
              <span className='text-muted fs-5'>ບໍ່ພົບສິນຄ້າທີ່ມີຂາຍ</span>
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
