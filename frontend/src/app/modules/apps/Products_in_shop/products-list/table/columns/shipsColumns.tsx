import {Column} from 'react-table'
import {ShipData} from '../../../../create-ships/users-list/core/ship_models'

const STATUS_LABELS: Record<string, string> = {
  Active: 'ໃຊ້ງານ',
  Maintenance: 'ສ້ອມແປງ',
  Inactive: 'ບໍ່ໃຊ້ງານ',
}

const ShipImageCell = ({src, name}: {src: string; name: string}) => (
  <div className='symbol symbol-75px' style={{width: 75, height: 75}}>
    {src ? (
      <img
        src={src}
        alt={name}
        className='object-fit-cover rounded border border-gray-200'
        style={{width: 75, height: 75}}
        loading='lazy'
      />
    ) : (
      <div
        className='symbol-label bg-light rounded border border-gray-200'
        style={{width: 75, height: 75}}
      >
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

  return <span className={`badge ${statusClass}`}>{STATUS_LABELS[status as string] || status}</span>
}

const getShipsInShopColumns = (): ReadonlyArray<Column<ShipData>> => [
  {
    Header: 'ຮູບ',
    id: 'image',
    Cell: ({row}) => (
      <ShipImageCell src={row.original.image_url} name={row.original.ship_name || row.original.name} />
    ),
  },
  {
    Header: 'ຊື່ເຮືອ',
    id: 'ship_name',
    Cell: ({row}) => (
      <span className='text-gray-900 fw-bold fs-6'>{row.original.ship_name || row.original.name}</span>
    ),
  },
  {
    Header: 'ຄວາມຈຸ (ຄົນ)',
    id: 'capacity',
    Cell: ({row}) => <span>{row.original.capacity?.toLocaleString() ?? '-'}</span>,
  },
  {
    Header: 'ລາຄາ (ກີບ)',
    id: 'price',
    Cell: ({row}) => (
      <span className='text-primary fw-bolder fs-6'>{row.original.price?.toLocaleString() ?? '-'}</span>
    ),
  },
  {
    Header: 'ສະຖານະ',
    id: 'status',
    Cell: ({row}) => <ShipStatusBadge status={row.original.status} />,
  },
]

export {getShipsInShopColumns}
