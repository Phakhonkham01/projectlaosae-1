import { FC } from 'react'

type Props = {
  image_url: string
}

const ShipImageCell: FC<Props> = ({ image_url }) => {
  return (
    <div className="d-flex justify-content-center">
      <div 
        className="symbol" 
        style={{ 
          width: '200px', 
          height: '200px',
          overflow: 'hidden',
          borderRadius: '8px',
          border: '1px solid #EFF2F5'
        }}
      >
        {image_url ? (
          <img 
            src={image_url} 
            alt="ship" 
            className="symbol-label"
            style={{ 
              width: '200px', 
              height: '200px',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.currentTarget.src = '/media/svg/files/blank-image.svg'
            }}
          />
        ) : (
          <div 
            className="symbol-label bg-light-primary d-flex align-items-center justify-content-center"
            style={{ 
              width: '200px', 
              height: '200px'
            }}
          >
            <i className="ki-outline ki-ship fs-1 text-primary"></i>
          </div>
        )}
      </div>
    </div>
  )
}

export { ShipImageCell }