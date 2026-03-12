import { Column } from 'react-table'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../../../../../../../firebase/useFirebase' // ✅ ปรับ path
import { Product } from '../../core/_models'
import { UserActionsCell } from './UserActionsCell'
import { useState, useEffect } from 'react'

// ─── Shared category map (module-level cache, fetch once) ─────────────────────
let _categoryCache: Record<string, string> = {}
let _fetched = false

export const useCategoryMap = () => {
  const [map, setMap] = useState<Record<string, string>>(_categoryCache)

  useEffect(() => {
    if (_fetched) return // ✅ ใช้ cache ถ้าดึงแล้ว
    _fetched = true
    getDocs(collection(db, 'categories'))
      .then((snapshot) => {
        snapshot.docs.forEach((d) => {
          _categoryCache[d.id] = (d.data() as { name: string }).name
        })
        setMap({ ..._categoryCache })
      })
      .catch(console.error)
  }, [])

  // expose refetch เพื่อ invalidate cache เมื่อ add/edit/delete category
  const refetch = () => {
    _fetched = false
    _categoryCache = {}
    getDocs(collection(db, 'categories'))
      .then((snapshot) => {
        snapshot.docs.forEach((d) => {
          _categoryCache[d.id] = (d.data() as { name: string }).name
        })
        _fetched = true
        setMap({ ..._categoryCache })
      })
      .catch(console.error)
  }

  return { map, refetch }
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
}: {
  categoryId: string
  categoryMap: Record<string, string>
}) => {
  const name = categoryMap[categoryId]
  if (!name) return <span className='text-muted fst-italic fs-7'>—</span>
  return <span className='badge badge-light-info fw-semibold'>{name}</span>
}

// ─── Column factory — รับ categoryMap จาก ProductsTable ──────────────────────
export const getProductsColumns = (
  categoryMap: Record<string, string>
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
      <CategoryCell categoryId={row.original.category_id} categoryMap={categoryMap} />
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