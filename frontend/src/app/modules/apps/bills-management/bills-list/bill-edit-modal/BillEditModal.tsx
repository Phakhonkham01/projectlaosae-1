import {useEffect, useMemo, useState} from 'react'
import Swal from 'sweetalert2'
import {KTIcon} from '../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {PAYMENT_STATUS_META, PAYMENT_STATUS_OPTIONS} from '../core/bill_models'
import {updateBillStatus} from '../core/bill_requests'
import {useQueryResponse, useQueryResponseData} from '../core/QueryResponseProvider'

const BookingShipEditModal = () => {
  const {itemIdForUpdate, setItemIdForUpdate} = useListView()
  const {refetch} = useQueryResponse()
  const bills = useQueryResponseData()
  const bill = useMemo(
    () => bills.find((currentBill) => currentBill.id === itemIdForUpdate),
    [bills, itemIdForUpdate]
  )
  const [paymentStatus, setPaymentStatus] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  useEffect(() => {
    setPaymentStatus(bill?.payment_status || '')
    setRejectReason(bill?.reject_reason || '')
  }, [bill])

  const closeModal = () => setItemIdForUpdate(undefined)

  const handleSave = async () => {
    if (!bill || !paymentStatus) {
      return
    }

    if (paymentStatus === 'rejected' && !rejectReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Reject reason required',
        text: 'Please enter a reason when rejecting a bill.',
      })
      return
    }

    setIsSaving(true)
    try {
      await updateBillStatus(
        bill.id,
        paymentStatus as (typeof PAYMENT_STATUS_OPTIONS)[number],
        rejectReason.trim()
      )
      await refetch()
      Swal.fire({
        icon: 'success',
        title: 'Bill updated',
        timer: 1400,
        showConfirmButton: false,
      })
      closeModal()
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: 'Could not update this bill status.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!bill) {
    return null
  }

  return (
    <>
      <div
        className='modal fade show d-block'
        id='kt_modal_bill'
        role='dialog'
        tabIndex={-1}
        aria-modal='true'
      >
        <div className='modal-dialog modal-dialog-centered mw-700px'>
          <div className='modal-content'>
            <div className='modal-header'>
              <div>
                <h2 className='fw-bold mb-1'>Edit Bill Status</h2>
                <div className='text-muted fs-7'>#{bill.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <button
                type='button'
                className='btn btn-icon btn-sm btn-active-icon-primary'
                onClick={closeModal}
              >
                <KTIcon iconName='cross' className='fs-1' />
              </button>
            </div>

            <div className='modal-body py-8 px-10'>
              <div className='row g-5 mb-8'>
                <div className='col-md-6'>
                  <div className='card bg-light-primary border-0'>
                    <div className='card-body'>
                      <div className='text-muted fs-7 mb-2'>Customer</div>
                      <div className='fw-bold fs-4'>{bill.user_name || '-'}</div>
                      <div className='text-muted'>{bill.user_email || '-'}</div>
                    </div>
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='card bg-light-success border-0'>
                    <div className='card-body'>
                      <div className='text-muted fs-7 mb-2'>Bill Total</div>
                      <div className='fw-bold fs-2 text-success'>
                        {bill.grand_total.toLocaleString()} LAK
                      </div>
                      <div className='text-muted text-capitalize'>
                        {bill.payment_method} payment
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mb-7'>
                <label className='form-label fw-bold'>Booking Date</label>
                <div className='form-control form-control-solid'>
                  {bill.booking_date || '-'} {bill.booking_time || ''}
                </div>
              </div>

              <div className='mb-7'>
                <label className='form-label fw-bold'>Ship</label>
                <div className='form-control form-control-solid'>{bill.ship_name || '-'}</div>
              </div>

              <div className='mb-7'>
                <label className='form-label fw-bold'>Payment Status</label>
                <select
                  className='form-select form-select-solid'
                  value={paymentStatus}
                  onChange={(event) => setPaymentStatus(event.target.value)}
                >
                  {PAYMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {PAYMENT_STATUS_META[status].label}
                    </option>
                  ))}
                </select>
              </div>

              {bill.payment_method === 'transfer' && bill.slip_url && (
                <div className='mb-7'>
                  <label className='form-label fw-bold'>Transfer Slip</label>
                  <div>
                    <a href={bill.slip_url} target='_blank' rel='noreferrer'>
                      <img
                        src={bill.slip_url}
                        alt='Transfer slip'
                        className='rounded border'
                        style={{maxWidth: 220, maxHeight: 280, objectFit: 'contain'}}
                      />
                    </a>
                  </div>
                </div>
              )}

              {paymentStatus === 'rejected' && (
                <div className='mb-0'>
                  <label className='form-label fw-bold'>Reject Reason</label>
                  <textarea
                    className='form-control form-control-solid'
                    rows={4}
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder='Explain why this bill is rejected'
                  />
                </div>
              )}
            </div>

            <div className='modal-footer'>
              <button type='button' className='btn btn-light' onClick={closeModal}>
                Cancel
              </button>
              <button
                type='button'
                className='btn btn-primary'
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show'></div>
    </>
  )
}

export {BookingShipEditModal}
