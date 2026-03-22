import { FC } from 'react'
import { EmployeesEditModalHeader } from './EmployeesEditModalHeader'
import { EmployeesEditModalFormWrapper } from './EmployeesEditModalFormWrapper'

const EmployeesEditModal: FC = () => {
  return (
    <div className="modal fade show d-block" id="kt_modal_employees_edit" aria-modal="true" role="dialog">
      <div className="modal-dialog modal-dialog-centered mw-650px">
        <div className="modal-content">
          <EmployeesEditModalHeader />
          <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
            <EmployeesEditModalFormWrapper />
          </div>
        </div>
      </div>
    </div>
  )
}

export { EmployeesEditModal }