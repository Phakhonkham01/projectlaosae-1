import { Column } from 'react-table'
import { User } from '../../core/_models'
import { UserSelectionCell } from './UserSelectionCell'
import { UserSelectionHeader } from './UserSelectionHeader'
import { UserInfoCell } from './UserInfoCell'
import { UserEmailCell } from './UserEmailCell'
import { UserDepartmentCell } from './UserDepartmentCell'
import { UserPositionCell } from './UserPositionCell'
import { UserLeaveDaysCell } from './UserLeaveDaysCell'
import { UserStatusCell } from './UserStatusCell'
import { UserActionsCell } from './UserActionsCell'
import { CustomHeaderColumn } from './CustomHeaderColumn'

const UsersList: ReadonlyArray<Column<User>> = [
  {
    Header: (props) => <CustomHeaderColumn tableProps={props} name="#" className="w-50px" />,
    id: 'selection',
    Cell: ({ row }) => <UserSelectionCell id={row.original.id} />,
    Header: <UserSelectionHeader />,
  },
  {
    Header: (props) => <CustomHeaderColumn tableProps={props} name="User" className="min-w-200px" />,
    id: 'info',
    Cell: ({ row }) => <UserInfoCell user={row.original} />,
  },
  {
    Header: (props) => <CustomHeaderColumn tableProps={props} name="Email" className="min-w-150px" />,
    accessor: 'email',
    Cell: ({ value }) => <UserEmailCell email={value} />,
  },
  {
    Header: (props) => <CustomHeaderColumn tableProps={props} name="Department" className="min-w-125px" />,
    accessor: 'department_id',
    Cell: ({ value }) => <UserDepartmentCell department_id={value} />,
  },
  {
    Header: (props) => <CustomHeaderColumn tableProps={props} name="Position" className="min-w-125px" />,
    accessor: 'position_id',
    Cell: ({ value }) => <UserPositionCell position_id={value} />,
  },
  {
    Header: (props) => <CustomHeaderColumn tableProps={props} name="Leave Days" className="min-w-100px" />,
    accessor: 'leave_days',
    Cell: ({ value }) => <UserLeaveDaysCell leave_days={value} />,
  },
  {
    Header: (props) => <CustomHeaderColumn tableProps={props} name="Status" className="min-w-100px" />,
    accessor: 'status',
    Cell: ({ value }) => <UserStatusCell status={value} />,
  },
  {
    Header: (props) => <CustomHeaderColumn tableProps={props} name="Actions" className="text-end min-w-100px" />,
    id: 'actions',
    Cell: ({ row }) => <UserActionsCell id={row.original.id} />,
  },
]

export { UsersList }