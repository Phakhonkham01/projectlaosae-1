import {ShipData} from '../../../../create-ships/users-list/core/ship_models'

type Props = {
  ship: ShipData
  index: number
}

const ShipsInShopCard = ({ship, index}: Props) => {
  const shipName = ship.ship_name || ship.name
  const statusClass =
    ship.status === 'Maintenance'
      ? 'badge-light-warning'
      : ship.status === 'Inactive'
      ? 'badge-light-secondary'
      : 'badge-light-success'

  return (
    <div className='card card-flush h-md-100 shadow-sm'>
      <div
        className='card-header p-0 overflow-hidden'
        style={{borderRadius: '0.625rem 0.625rem 0 0', maxHeight: '200px'}}
      >
        <img
          src={ship.image_url || '/media/avatars/blank.png'}
          alt={shipName}
          className='w-100 object-fit-cover'
          style={{height: '200px'}}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/media/avatars/blank.png'
          }}
        />
      </div>

      <div className='card-body d-flex flex-column gap-3 pt-4 pb-4 px-5'>
        <div className='d-flex justify-content-between align-items-center'>
          <span className='badge badge-light-primary fw-bold fs-8'>#{index + 1}</span>
          <span className={`badge fw-bolder ${statusClass}`}>{ship.status}</span>
        </div>

        <div>
          <span className='text-gray-900 fw-bold fs-5 d-block text-truncate'>{shipName}</span>
          <span className='text-muted fw-semibold fs-7 d-block mt-1'>
            Capacity {ship.capacity?.toLocaleString() ?? '-'} people
          </span>
        </div>

        <div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
          <div className='d-flex flex-column align-items-start'>
            <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>Price</span>
            <span className='text-primary fw-bold fs-6'>{ship.price?.toLocaleString()} LAK</span>
          </div>

          <div className='d-flex flex-column align-items-start'>
            <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>Available</span>
            <span className='text-gray-700 fw-bold fs-6'>{ship.quantity ?? 0} units</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export {ShipsInShopCard}
