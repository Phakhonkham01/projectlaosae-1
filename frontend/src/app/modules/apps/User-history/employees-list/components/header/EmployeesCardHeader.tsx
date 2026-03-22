import { EmployeesListSearchComponent } from './EmployeesListSearchComponent'
import { EmployeesListToolbar } from './EmployeesListToolbar'

const EmployeesCardHeader = () => {
  return (
    <div className='card-header border-0 pt-6'>
      <EmployeesListSearchComponent />
      <div className='card-toolbar'>
        <EmployeesListToolbar />
      </div>
    </div>
  )
}

export { EmployeesCardHeader }