import { Column } from 'react-table'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../../../../../../../../firebase/useFirebase'
import { Product } from '../../core/_models'
import { UserActionsCell } from './UserActionsCell'
import { useState, useEffect } from 'react'

// ─── useCategoryMap — real-time listener ─────────────────────────────────────
export const useCategoryMap = () => {
  const [map, setMap]         = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const result: Record<string, string> = {}
        snapshot.docs.forEach((d) => {
          result[d.id] = (d.data() as { name: string }).name
        })
        setMap(result)
        setLoading(false)
      },
      (err) => {
        console.error('Category listener error:', err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  return { map, loading }
}

// ─── Cell Components ──────────────────────────────────────────────────────────

const ImageCell = ({ src, name }: { src: string; name: string }) => (
  <div className='symbol' style={{width: 150, height: 150}}>
    {src ? (
      <img
        src={src}
        alt={name}
        className='object-fit-cover rounded'
        style={{width: 150, height: 150}}
      />
    ) : (
      <div className='symbol-label bg-light' style={{width: 150, height: 150}}>
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

// ─── Column factory ───────────────────────────────────────────────────────────
export const getProductsColumns = (
  categoryMap: Record<string, string>,
  loadingMap: boolean
): ReadonlyArray<Column<Product>> => [
  {
    Header: 'Image',
    id: 'image',
    Cell: ({ row }) => <ImageCell src={row.original.imageUrl} name={row.original.name} />,
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
      <CategoryCell
        categoryId={row.original.categoryId}
        categoryMap={categoryMap}
        loadingMap={loadingMap}
      />
    ),
  },
  {
    Header: 'Available',
    id: 'availability',
    Cell: ({ row }) => <AvailabilityCell available={row.original.available} />,
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
