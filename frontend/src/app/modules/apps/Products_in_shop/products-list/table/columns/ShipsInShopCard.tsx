import {ShipData} from '../../../../create-ships/users-list/core/ship_models'

type Props = {
  ship: ShipData
  index: number
}

const STATUS_LABELS: Record<string, string> = {
  active: 'ໃຊ້ງານ',
  maintenance: 'ສ້ອມແປງ',
  inactive: 'ບໍ່ໃຊ້ງານ',
}

const ShipsInShopCard = ({ship, index}: Props) => {
  const shipName = ship.name
  // status ຖືກບັນທຶກເປັນໂຕນ້ອຍ — normalize ກ່ອນທຽບ
  const status = String(ship.status ?? '').toLowerCase()
  const isSoldOut = (ship.quantity ?? 0) <= 0
  const isInactive = status === 'inactive'
  const isMaintenance = status === 'maintenance'
  const isUnavailable = isSoldOut || isInactive || isMaintenance

  const overlayText = isSoldOut
    ? '🚫 ເຮືອໝົດແລ້ວ'
    : isMaintenance
    ? '🔧 ກຳລັງປັບປຸງເຮືອ'
    : '🚫 ປິດໃຊ້ງານ'

  const statusClass =
    ship.status === 'maintenance'
      ? 'badge-warning'
      : ship.status === 'inactive'
      ? 'badge-secondary'
      : 'badge-success'
  const statusLabel = STATUS_LABELS[ship.status as string] || ship.status

  return (
    <div className={`card card-flush h-100 shadow-sm product-shop-card ${isUnavailable ? 'border border-secondary' : ''}`}>
      <div className='card-header p-0 overflow-hidden position-relative product-shop-card__media'>
        <img
          src={ship.imageUrl || '/media/avatars/blank.png'}
          alt={shipName}
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
              {overlayText}
            </span>
          </div>
        )}
        <span className={`badge position-absolute top-0 end-0 m-3 fw-bold shadow-sm ${statusClass}`}>
          {statusLabel}
        </span>
        <span className='badge badge-circle badge-light position-absolute top-0 start-0 m-3 fw-bold text-gray-700 shadow-sm'>
          {index + 1}
        </span>
      </div>

      <div className='card-body d-flex flex-column gap-3 pt-5 pb-5 px-5'>
        <div>
          <span className='text-gray-900 fw-bold fs-4 d-block text-truncate' title={shipName}>
            {shipName}
          </span>
          <span className='text-muted fw-semibold fs-7 d-block mt-1'>
            ຄວາມຈຸ {ship.capacity?.toLocaleString() ?? '-'} ຄົນ
          </span>
        </div>

        <div className='d-flex justify-content-between align-items-end flex-wrap gap-2 mt-auto pt-3 border-top border-gray-200'>
          <div className='d-flex flex-column align-items-start'>
            <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>ລາຄາ</span>
            <span className='text-primary fw-bolder fs-3'>
              {ship.pricePerHour?.toLocaleString()}
              <span className='fs-8 fw-semibold text-muted ms-1'>ກີບ</span>
            </span>
          </div>

          <div className='d-flex flex-column align-items-end'>
            <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>ຄົງເຫຼືອ</span>
            <span className={`fw-bold fs-6 ${isSoldOut ? 'text-danger' : 'text-gray-700'}`}>{ship.quantity ?? 0} ລຳ</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export {ShipsInShopCard}
