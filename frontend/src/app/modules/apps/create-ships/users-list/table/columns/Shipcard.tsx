// ShipCard.tsx
import React from 'react'
import { ShipData } from '../../core/ship_models'
import { ShipActionsCell } from './ShipActionsCell'
import { ShipStatusCell } from './ShipStatusCell'

interface ShipCardProps {
  ship: ShipData
  index: number
}

const ShipCard: React.FC<ShipCardProps> = ({ ship, index }) => {
  const isSoldOut = (ship.quantity ?? 0) <= 0
  // status ຖືກບັນທຶກເປັນໂຕນ້ອຍ ('inactive' / 'maintenance') — normalize ກ່ອນທຽບ
  const status = String(ship.status ?? '').toLowerCase()
  const isInactive = status === 'inactive'
  const isMaintenance = status === 'maintenance'
  const isUnavailable = isSoldOut || isInactive || isMaintenance

  const overlayText = isSoldOut
    ? '🚫 ເຮືອໝົດແລ້ວ'
    : isMaintenance
    ? '🔧 ກຳລັງປັບປຸງເຮືອ'
    : '🚫 ປິດໃຊ້ງານ'

  return (
    <div className={`card card-flush h-md-100 shadow-sm position-relative ${isUnavailable ? 'border border-secondary' : ''}`}>
      {/* Card Header: Image */}
      <div
        className='card-header p-0 overflow-hidden position-relative'
        style={{ borderRadius: '0.625rem 0.625rem 0 0', maxHeight: '200px' }}
      >
        <img
          src={ship.imageUrl || '/media/avatars/blank.png'}
          alt={ship.name}
          className='w-100 object-fit-cover'
          style={{
            height: '200px',
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
            style={{ pointerEvents: 'none' }}
          >
            <span
              className='badge bg-danger text-white fw-bolder fs-6 px-4 py-3 shadow-sm'
              style={{ letterSpacing: '0.04em' }}
            >
              {overlayText}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className='card-body d-flex flex-column gap-3 pt-4 pb-3 px-5'>
        {/* Index badge + Status */}
        <div className='d-flex justify-content-between align-items-center'>
          <span className='badge badge-light-primary fw-bold fs-8'>#{index + 1}</span>
          <ShipStatusCell status={ship.status} />
        </div>

        {/* Ship Name */}
        <div>
          <span className='text-gray-900 fw-bold fs-5 d-block text-truncate'>
            {ship.name}
          </span>
        </div>

        {/* Stats Row */}
        <div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
          {/* Capacity */}
          <div className='d-flex flex-column align-items-start'>
            <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>ຄວາມຈຸ</span>
            <span className='text-gray-700 fw-bold fs-6'>
              {ship.capacity?.toLocaleString() ?? '—'}
            </span>
          </div>

          {/* Price */}
          <div className='d-flex flex-column align-items-start'>
            <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>ລາຄາ</span>
            <span className='text-primary fw-bold fs-6'>
              {ship.pricePerHour?.toLocaleString() ?? '—'} ກີບ
            </span>
          </div>

          {/* Quantity */}
          <div className='d-flex flex-column align-items-start'>
            <span className='text-muted fs-8 fw-semibold text-uppercase ls-1'>ຈຳນວນ</span>
            <span className={`fw-bold fs-6 ${isSoldOut ? 'text-danger' : 'text-gray-700'}`}>
              {ship.quantity ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Actions */}
      <div className='card-footer d-flex justify-content-end py-3 px-5 border-top'>
        <ShipActionsCell id={ship.id} />
      </div>
    </div>
  )
}

export { ShipCard }
