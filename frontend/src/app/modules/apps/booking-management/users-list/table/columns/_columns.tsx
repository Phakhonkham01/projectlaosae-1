// shipColumns.tsx
import { Column } from 'react-table'
import { ShipData } from '../../core/ship_models'
import { ShipInfoCell } from './ShipInfoCell'
import { ShipImageCell } from './ShipImageCell'
import { ShipPriceCell } from './ShipPriceCell'
import { ShipCapacityCell } from './ShipCapacityCell'
import { ShipQuantityCell } from './ShipQuantityCell'
import { ShipStatusCell } from './ShipStatusCell'
import { BookingShipActionsCell } from './BookingShipActionsCell'
import { UserCustomHeader } from './UserCustomHeader'

const shipColumns: ReadonlyArray<Column<ShipData>> = [
  // No (index)
  {
    Header: () => <th className="min-w-50px text-center">No</th>,
    id: 'no',
    Cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },

  // Ship Image - Updated to show 200x200
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title="Image" className="min-w-220px text-center" />
    ),
    id: 'image',
    accessor: 'image_url',
    Cell: ({ value }) => <ShipImageCell image_url={value} />,
  },

  // Ship Name
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title="Ship Name" className="min-w-200px" />
    ),
    id: 'ship_name',
    accessor: 'ship_name',
    Cell: ({ value, row }) => <ShipInfoCell ship_name={value} status={row.original.status} />,
  },

  // Capacity
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title="Capacity" className="min-w-120px text-end" />
    ),
    accessor: 'capacity',
    Cell: ({ value }) => <ShipCapacityCell capacity={value} />,
  },

  // Price
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title="Price" className="min-w-120px text-end" />
    ),
    accessor: 'price',
    Cell: ({ value }) => <ShipPriceCell price={value} />,
  },

  // Quantity
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title="Quantity" className="min-w-100px text-center" />
    ),
    accessor: 'quantity',
    Cell: ({ value }) => <ShipQuantityCell quantity={value} />,
  },

  // Status
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title="Status" className="min-w-100px text-center" />
    ),
    accessor: 'status',
    Cell: ({ value }) => <ShipStatusCell status={value} />,
  },

  // Actions
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title="Actions" className="text-end min-w-100px" />
    ),
    id: 'actions',
    Cell: ({ row }) => <BookingShipActionsCell id={row.original.id} />,
  },
]

export { shipColumns }