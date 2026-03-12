import { Column } from 'react-table'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../../../../../../../firebase/useFirebase' // ✅ ปรับ path
import { Product } from '../../core/_models'
import { UserActionsCell } from './UserActionsCell'
import { useState, useEffect } from 'react'

// ─── useCategoryMap — fetch categories และ cache ─────────────────────────────
export const useCategoryMap = () => {
  const [map, setMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const fetchMap = () => {
    setLoading(true)
    getDocs(collection(db, 'categories'))
      .then((snapshot) => {
        const result: Record<string, string> = {}
        snapshot.docs.forEach((d) => {
          result[d.id] = (d.data() as { name: string }).name
        })
        setMap(result)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMap()
  }, [])

  return { map, loading, refetch: fetchMap }
}

// ─── Cell Components ──────────────────────────────────────────────────────────

const ImageCell = ({ src, name }: { src: string; name: string }) => (
  <div className='symbol symbol-45px'>
    {src ? (
      <img
        src={src}
        alt={name}
        className='object-fit-cover rounded'
        style={{ width: 45, height: 45 }}
      />
    ) : (
      <div className='symbol-label bg-light'>
        <i className='bi bi-image text-muted fs-3' />
      </div>
    )}
  </div>
)

const PriceCell = ({ price }: { price: number }) => (
  <span>{price.toLocaleString()} LAK</span>
)

const AvailabilityCell = ({ available }: { available: boolean }) => (
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
  const name = categoryMap[categoryId]
  if (!name) return <span className='text-muted fst-italic fs-7'>—</span>
  return <span className='badge badge-light-info fw-semibold'>{name}</span>
}

// ─── Column factory — รับ categoryMap จาก ProductsTable ──────────────────────
export const getProductsColumns = (
  categoryMap: Record<string, string>,
  loadingMap: boolean
): ReadonlyArray<Column<Product>> => [
  {
    Header: 'Image',
    id: 'image',
    Cell: ({ row }) => <ImageCell src={row.original.image} name={row.original.name} />,
  },
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Price (LAK)',
    id: 'price',
    Cell: ({ row }) => <PriceCell price={row.original.price} />,
  },
  {
    Header: 'Category',
    id: 'category',
    Cell: ({ row }) => (
      <CategoryCell categoryId={row.original.category_id} categoryMap={categoryMap} loadingMap={loadingMap} />
    ),
  },
  {
    Header: 'Available',
    id: 'availability',
    Cell: ({ row }) => <AvailabilityCell available={row.original.availability} />,
  },
  {
    Header: () => <div className='text-end pe-3'>Actions</div>,
    id: 'actions',
    Cell: ({ row }) => (
      <div className='text-end'>
        <UserActionsCell id={row.original.product_id} />
      </div>
    ),
  },
]