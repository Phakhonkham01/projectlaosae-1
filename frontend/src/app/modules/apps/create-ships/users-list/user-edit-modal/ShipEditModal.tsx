import { useEffect } from 'react'
import { ShipEditModalHeader } from './ShipEditModalHeader'
import { ShipEditModalForm } from './ShipEditModalForm'

const ShipEditModal = () => {
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
        <div className="modal-dialog modal-dialog-centered mw-650px">
          <ShipEditModalForm />
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  )
}

export { ShipEditModal }