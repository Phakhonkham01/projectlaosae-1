import {Column} from 'react-table'
import {Product} from '../../../../addFood/users-list/core/_models'
import {useCategoryMap} from '../../../../addFood/users-list/table/columns/_columns'

const ImageCell = ({src, name}: {src: string; name: string}) => (
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

const PriceCell = ({price}: {price: number}) => <span>{price.toLocaleString()} LAK</span>

const AvailabilityCell = ({available}: {available: boolean}) => (
  <span className={`badge badge-light-${available ? 'success' : 'danger'}`}>
    {available ? 'Available' : 'Unavailable'}
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
    Header: 'Image',
    id: 'image',
    Cell: ({row}) => <ImageCell src={row.original.image} name={row.original.name} />,
  },
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Price (LAK)',
    id: 'price',
    Cell: ({row}) => <PriceCell price={row.original.price} />,
  },
  {
    Header: 'Category',
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
    Header: 'Available',
    id: 'availability',
    Cell: ({row}) => <AvailabilityCell available={row.original.availability} />,
  },
]

export {getProductsInShopColumns, useCategoryMap}
