import {ProductsInShopSearch} from './ProductsInShopSearch'

type Props = {
  title?: string
  subtitle: string
  searchPlaceholder?: string
  searchScope?: 'products' | 'ships'
  showSearch?: boolean
}

const ProductsInShopHeader = ({
  title,
  subtitle,
  searchPlaceholder = '',
  searchScope = 'products',
  showSearch = true,
}: Props) => {
  return (
    <div className='card-header border-0 pt-4'>
      <div className='d-flex flex-column flex-md-row align-items-md-center justify-content-between w-100 gap-4'>
        <div>
          {title && <div className='fs-3 fw-bold text-gray-900'>{title}</div>}
          <div className='text-muted fw-semibold fs-7 mt-1'>{subtitle}</div>
        </div>
        {showSearch && <ProductsInShopSearch placeholder={searchPlaceholder} scope={searchScope} />}
      </div>
    </div>
  )
}

export {ProductsInShopHeader}
