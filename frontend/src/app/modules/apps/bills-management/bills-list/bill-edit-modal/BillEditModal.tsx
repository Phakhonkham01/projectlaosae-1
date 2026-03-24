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

  const paymentStatusMeta = PAYMENT_STATUS_META[bill.payment_status]

  return (
    <>
      <div
        className='modal fade show d-block'
        id='kt_modal_bill'
        role='dialog'
        tabIndex={-1}
        aria-modal='true'
      >
        <div className='modal-dialog modal-dialog-centered mw-900px'>
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
                <div className='col-xl-4 col-md-6'>
                  <div className='card bg-light-primary border-0 h-100'>
                    <div className='card-body'>
                      <div className='text-muted fs-7 mb-2'>Customer</div>
                      <div className='fw-bold fs-4'>{bill.user_name || '-'}</div>
                      <div className='text-muted'>{bill.user_email || '-'}</div>
                    </div>
                  </div>
                </div>
                <div className='col-xl-4 col-md-6'>
                  <div className='card bg-light-success border-0 h-100'>
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
                <div className='col-xl-4 col-md-12'>
                  <div className='card bg-light-warning border-0 h-100'>
                    <div className='card-body'>
                      <div className='text-muted fs-7 mb-2'>Current Status</div>
                      <div className={`badge ${paymentStatusMeta.badgeClass} fw-bold fs-7 mb-3`}>
                        {paymentStatusMeta.label}
                      </div>
                      <div className='text-muted fs-7'>Foods</div>
                      <div className='fw-bold fs-3'>{bill.foods?.length || 0} items</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='card border-0 bg-light mb-8'>
                <div className='card-body py-6'>
                  <div className='row g-6'>
                    <div className='col-md-4'>
                      <div className='text-muted fs-7 mb-2'>Booking Date</div>
                      <div className='fw-bold fs-6'>
                        {bill.booking_date || '-'} {bill.booking_time || ''}
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='text-muted fs-7 mb-2'>Ship</div>
                      <div className='fw-bold fs-6'>{bill.ship_name || '-'}</div>
                    </div>
                    <div className='col-md-4'>
                      <div className='text-muted fs-7 mb-2'>Payment Method</div>
                      <div className='fw-bold fs-6 text-capitalize'>{bill.payment_method || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='row g-8'>
                <div className='col-lg-7'>
                  <div className='card border border-gray-200 h-100'>
                    <div className='card-header border-0 pt-6'>
                      <div className='card-title'>
                        <h3 className='fw-bold m-0'>Foods in Bill</h3>
                      </div>
                    </div>
                    <div className='card-body pt-0'>
                      {bill.foods?.length ? (
                        <div className='table-responsive'>
                          <table className='table align-middle table-row-dashed gy-4'>
                            <thead>
                              <tr className='text-muted fw-bold fs-7 text-uppercase gs-0'>
                                <th>Food</th>
                                <th className='text-center'>Qty</th>
                                <th className='text-end'>Price</th>
                                <th className='text-end'>Total</th>
                              </tr>
                            </thead>
                            <tbody className='fw-semibold text-gray-700'>
                              {bill.foods.map((food, index) => (
                                <tr key={`${food.product_id}-${index}`}>
                                  <td>
                                    <div className='d-flex flex-column'>
                                      <span className='fw-bold text-gray-900'>{food.name}</span>
                                      <span className='text-muted fs-7'>
                                        ID: {food.product_id || '-'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className='text-center'>{food.quantity}</td>
                                  <td className='text-end'>{food.price.toLocaleString()} LAK</td>
                                  <td className='text-end fw-bold'>
                                    {(food.price * food.quantity).toLocaleString()} LAK
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className='d-flex flex-column align-items-center justify-content-center py-10 text-center'>
                          <i className='bi bi-basket2 text-muted fs-1 mb-3'></i>
                          <div className='fw-bold fs-5 text-gray-800 mb-1'>No foods in this bill</div>
                          <div className='text-muted fs-7'>This booking only contains ship charges.</div>
                        </div>
                      )}

                      <div className='separator separator-dashed my-5'></div>
                      <div className='d-flex justify-content-between align-items-center'>
                        <span className='text-muted fw-semibold'>Food Total</span>
                        <span className='fw-bold fs-4 text-primary'>
                          {bill.total_food_price.toLocaleString()} LAK
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-lg-5'>
                  <div className='card border border-gray-200 mb-8'>
                    <div className='card-header border-0 pt-6'>
                      <div className='card-title'>
                        <h3 className='fw-bold m-0'>Update Status</h3>
                      </div>
                    </div>
                    <div className='card-body pt-0'>
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
                  </div>

                  {bill.payment_method === 'transfer' && bill.slip_url && (
                    <div className='card border border-gray-200'>
                      <div className='card-header border-0 pt-6'>
                        <div className='card-title'>
                          <h3 className='fw-bold m-0'>Transfer Slip</h3>
                        </div>
                      </div>
                      <div className='card-body pt-0'>
                        <a href={bill.slip_url} target='_blank' rel='noreferrer'>
                          <img
                            src={bill.slip_url}
                            alt='Transfer slip'
                            className='rounded border w-100'
                            style={{maxHeight: 360, objectFit: 'contain'}}
                          />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
