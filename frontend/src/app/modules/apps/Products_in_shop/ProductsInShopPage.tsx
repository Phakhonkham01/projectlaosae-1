import {Navigate, Outlet, Route, Routes} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {ProductsInShopWrapper} from './products-list/ProductsInShop'

const productsBreadcrumbs: Array<PageLink> = [
  {
    title: 'Shop',
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
              <PageTitle breadcrumbs={productsBreadcrumbs}>Products In Shop</PageTitle>
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
