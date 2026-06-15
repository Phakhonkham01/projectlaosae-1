import {Column} from 'react-table'
import {Product} from '../../../../addFood/users-list/core/_models'
import {useCategoryMap} from '../../../../addFood/users-list/table/columns/_columns'

const ImageCell = ({src, name}: {src: string; name: string}) => (
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

const NameCell = ({name}: {name: string}) => (
  <span className='text-gray-900 fw-bold fs-6 d-block text-truncate' style={{maxWidth: 260}} title={name}>
    {name}
  </span>
)

const PriceCell = ({price}: {price: number}) => (
  <span className='text-primary fw-bolder fs-6'>
    {price.toLocaleString()}
    <span className='fs-8 fw-semibold text-muted ms-1'>ກີບ</span>
  </span>
)

const AvailabilityCell = ({available}: {available: boolean}) => (
  <span className={`badge badge-light-${available ? 'success' : 'danger'}`}>
    {available ? 'ມີຂາຍ' : 'ບໍ່ມີຂາຍ'}
  </span>
)

const CategoryCell = ({
  categoryId,
  categoryMap,
  loadingMap,
}: {
  categoryId: string
  categoryMap: Record<string, string>
  loadingMap: boolean
}) => {
  if (loadingMap) return <span className='spinner-border spinner-border-sm text-muted' />
  return <span className='badge badge-light-info fw-semibold'>{categoryMap[categoryId] || '-'}</span>
}

const getProductsInShopColumns = (
  categoryMap: Record<string, string>,
  loadingMap: boolean
): ReadonlyArray<Column<Product>> => [
  {
    Header: 'ຮູບ',
    id: 'image',
    Cell: ({row}) => <ImageCell src={row.original.image} name={row.original.name} />,
  },
  {
    Header: 'ຊື່ສິນຄ້າ',
    id: 'name',
    Cell: ({row}) => <NameCell name={row.original.name} />,
  },
  {
    Header: 'ລາຄາ (ກີບ)',
    id: 'price',
    Cell: ({row}) => <PriceCell price={row.original.price} />,
  },
  {
    Header: 'ໝວດໝູ່',
    id: 'category',
    Cell: ({row}) => (
      <CategoryCell
        categoryId={row.original.category_id}
        categoryMap={categoryMap}
        loadingMap={loadingMap}
      />
    ),
  },
  {
    Header: 'ສະຖານະ',
    id: 'availability',
    Cell: ({row}) => <AvailabilityCell available={row.original.availability} />,
  },
]

export {getProductsInShopColumns, useCategoryMap}
