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
          width: 50%;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }

        @media (max-width: 575.98px) {
          .ships-in-shop-grid .ship-card-col {
            width: 100%;
          }
        }

        @media (min-width: 1450px) {
          .ships-in-shop-grid .ship-card-col {
            width: 25%;
          }
        }
      `}</style>

      <div className='row g-5 ships-in-shop-grid'>
        {data.length === 0 ? (
          <div className='col-12'>
            <div className='d-flex text-center w-100 align-content-center justify-content-center py-10'>
              <span className='text-muted fs-5'>No available ships found</span>
            </div>
          </div>
        ) : (
          data.map((ship, index) => (
            <div key={ship.id || `${ship.ship_name}-${index}`} className='ship-card-col'>
              <ShipsInShopCard ship={ship} index={index} />
            </div>
          ))
        )}
      </div>
    </>
  )
}

export {ShipsInShopCardGrid}
