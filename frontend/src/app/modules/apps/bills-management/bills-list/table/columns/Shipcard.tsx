import React from 'react'
import {BillData} from '../../core/bill_models'

interface ShipCardProps {
  ship: BillData
  index: number
}

const ShipCard: React.FC<ShipCardProps> = ({ship, index}) => {
  return (
    <div className='card card-flush h-100'>
      <div className='card-body'>
        <div className='text-muted fs-8 mb-2'>#{index + 1}</div>
        <div className='fw-bold fs-4'>{ship.ship_name || '-'}</div>
        <div className='text-muted'>{ship.user_name || '-'}</div>
      </div>
    </div>
  )
}

export {ShipCard}
