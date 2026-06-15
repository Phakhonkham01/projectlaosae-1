import {Navigate, Outlet, Route, Routes} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {ProductsInShopWrapper} from './products-list/ProductsInShop'

const productsBreadcrumbs: Array<PageLink> = [
  {
    title: 'ຮ້ານຄ້າ',
    path: '/apps/products-in-shop/list',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const ProductsInShopPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={productsBreadcrumbs}>ສິນຄ້າ ແລະ ເຮືອ ໃນຮ້ານ</PageTitle>
              <ProductsInShopWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='list' />} />
    </Routes>
  )
}

export default ProductsInShopPage
