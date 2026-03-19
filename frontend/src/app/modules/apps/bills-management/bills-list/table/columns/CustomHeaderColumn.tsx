import {FC} from 'react'
import {ColumnInstance} from 'react-table'
import {ShipData} from '../../core/bill_models'

type Props = {
  column: ColumnInstance<ShipData>
}

const CustomHeaderColumn: FC<Props> = ({column}) => (
  <>
    {column.Header && typeof column.Header === 'string' ? <th {...column.getHeaderProps()}>{column.render('Header')}</th> : column.render('Header')}
  </>
)

export {CustomHeaderColumn}
