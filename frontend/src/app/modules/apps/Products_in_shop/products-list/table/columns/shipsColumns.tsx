import {Column} from 'react-table'
import {ShipData} from '../../../../create-ships/users-list/core/ship_models'

const ShipImageCell = ({src, name}: {src: string; name: string}) => (
  <div className='symbol' style={{width: 120, height: 120}}>
    {src ? (
      <img
        src={src}
        alt={name}
        className='object-fit-cover rounded'
        style={{width: 120, height: 120}}
      />
    ) : (
      <div className='symbol-label bg-light' style={{width: 120, height: 120}}>
        <i className='bi bi-image text-muted fs-3' />
      </div>
    )}
  </div>
)

const ShipStatusBadge = ({status}: {status: ShipData['status']}) => {
  const statusClass =
    status === 'Maintenance'
      ? 'badge-light-warning'
      : status === 'Inactive'
      ? 'badge-light-secondary'
      : 'badge-light-success'

  return <span className={`badge ${statusClass}`}>{status}</span>
}

const getShipsInShopColumns = (): ReadonlyArray<Column<ShipData>> => [
  {
    Header: 'Image',
    id: 'image',
    Cell: ({row}) => (
      <ShipImageCell src={row.original.image_url} name={row.original.ship_name || row.original.name} />
    ),
  },
  {
    Header: 'Ship Name',
    id: 'ship_name',
    Cell: ({row}) => <span>{row.original.ship_name || row.original.name}</span>,
  },
  {
    Header: 'Capacity',
    id: 'capacity',
    Cell: ({row}) => <span>{row.original.capacity?.toLocaleString() ?? '-'}</span>,
  },
  {
    Header: 'Price (LAK)',
    id: 'price',
    Cell: ({row}) => <span>{row.original.price?.toLocaleString() ?? '-'}</span>,
  },
  {
    Header: 'Status',
    id: 'status',
    Cell: ({row}) => <ShipStatusBadge status={row.original.status} />,
  },
]

export {getShipsInShopColumns}
