import { useEffect } from 'react'
import { BookingShipEditModalForm } from './BookingShipEditModalForm'

const BookingShipEditModal = () => {
  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  return (
    <>
      <div
        className="modal fade show d-block"
        id="kt_modal_ship"
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
      >
        {/* เพิ่ม style ตรงนี้ */}
        <div 
          className="modal-dialog modal-dialog-centered mw-650px"
          style={{
            height: '900px',
            maxHeight: '900px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div
            className="modal-content"
            style={{ height: '900px', maxHeight: '900px', overflow: 'hidden' }}
          >
            <BookingShipEditModalForm />
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  )
}

export { BookingShipEditModal }
