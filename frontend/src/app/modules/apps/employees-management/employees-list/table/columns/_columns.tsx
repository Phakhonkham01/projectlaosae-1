import { Column } from 'react-table'
import { User } from '../../core/_models'
import { EmployeesSelectionCell } from './EmployeesSelectionCell'
import { EmployeesSelectionHeader } from './EmployeesSelectionHeader'
import { EmployeesInfoCell } from './EmployeesInfoCell'
import { EmployeesEmailCell } from './EmployeesEmailCell'
import { UserStatusCell } from './EmployeesStatusCell'
import { EmployeesActionsCell } from './EmployeesActionsCell'
import { EmployeesListHeader } from '../../components/header/EmployeesListHeader'
import { UserRoleCell } from './EmployeeRoleCell'

const UsersList: ReadonlyArray<Column<User>> = [
 {
    Header: (props) => <EmployeesSelectionHeader tableProps={props} />,  // ← ส่ง props
    id: 'selection',
    Cell: ({ row }) => <EmployeesSelectionCell id={row.original._id} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='User' className='min-w-200px' />,
    id: 'info',
    Cell: ({ row }) => <EmployeesInfoCell user={row.original} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='Email' className='min-w-150px' />,
    accessor: 'email',
    Cell: ({ value }) => <EmployeesEmailCell email={value} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='Status' className='min-w-100px' />,
    accessor: 'status',
    Cell: ({ value }) => <UserStatusCell status={value} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='Status' className='min-w-100px' />,
    accessor: 'role',
    Cell: ({ value }) => <UserRoleCell role={value} />,
  },
  {
    Header: (props) => <EmployeesListHeader tableProps={props} title='Actions' className='text-end min-w-100px' />,
    id: 'actions',
    Cell: ({ row }) => <EmployeesActionsCell id={row.original._id} />,
  },
]

export { UsersList }