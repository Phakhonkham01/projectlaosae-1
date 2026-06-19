import {ShipData} from '../../../../create-ships/users-list/core/ship_models'
import {ShipsInShopCard} from './ShipsInShopCard'

type Props = {
  data: ShipData[]
}

const ShipsInShopCardGrid = ({data}: Props) => {
  return (
    <>
      <style>{`
        .ships-in-shop-grid .ship-card-col {
          width: 100%;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        @media (min-width: 576px) {
          .ships-in-shop-grid .ship-card-col { width: 50%; }
        }
        @media (min-width: 992px) {
          .ships-in-shop-grid .ship-card-col { width: 33.3333%; }
        }
        @media (min-width: 1450px) {
          .ships-in-shop-grid .ship-card-col { width: 25%; }
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

      <div className='row g-5 ships-in-shop-grid'>
        {data.length === 0 ? (
          <div className='col-12'>
            <div className='d-flex flex-column text-center w-100 align-items-center justify-content-center py-15'>
              <i className='ki-duotone ki-delivery-3 fs-3x text-muted mb-3'>
                <span className='path1' />
                <span className='path2' />
                <span className='path3' />
                <span className='path4' />
                <span className='path5' />
              </i>
              <span className='text-muted fs-5'>ບໍ່ພົບເຮືອທີ່ມີໃຫ້ບໍລິການ</span>
            </div>
          </div>
        ) : (
          data.map((ship, index) => (
            <div key={ship.id || `${ship.name}-${index}`} className='ship-card-col'>
              <ShipsInShopCard ship={ship} index={index} />
            </div>
          ))
        )}
      </div>
    </>
  )
}

export {ShipsInShopCardGrid}
