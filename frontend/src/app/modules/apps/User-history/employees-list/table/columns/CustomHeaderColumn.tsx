import { FC } from 'react'
import { ColumnInstance, HeaderProps } from 'react-table'
import { User } from '../../core/_models'
import { EmployeesListHeader } from '../../components/header/EmployeesListHeader'

type Props = {
  column: ColumnInstance<User>
}

const CustomHeaderColumn: FC<Props> = ({ column }) => (
  <>
    {column.Header && typeof column.Header === 'string' ? (
      <EmployeesListHeader
        title={column.Header}
        tableProps={column.getHeaderProps() as unknown as HeaderProps<User>}
      />
    ) : (
      column.render('Header')
    )}
  </>
)

export { CustomHeaderColumn }