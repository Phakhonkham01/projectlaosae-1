import {KTCard} from '../../../../../_metronic/helpers'
import {ListViewProvider} from '../../addFood/users-list/core/ListViewProvider'
import {QueryRequestProvider} from '../../addFood/users-list/core/QueryRequestProvider'
import {QueryResponseProvider} from '../../addFood/users-list/core/QueryResponseProvider'
import {ProductsInShopHeader} from './components/header/ProductsInShopHeader'
import {ShipsInShopTable} from './table/ShipsInShopTable'
import {ProductsInShopTable} from './table/ProductsInShopTable'

const ProductsInShop = () => {
  return (
    <>
      <KTCard className='mb-7'>
        <ProductsInShopHeader
          title='Ships In Shop'
          subtitle='Browse available ships before making a booking'
          searchPlaceholder='Search ships'
          searchScope='ships'
        />
        <ShipsInShopTable />
      </KTCard>

      <KTCard>
        <ProductsInShopHeader
          title='Products In Shop'
          subtitle='Browse available products in the shop'
          searchPlaceholder='Search products'
          searchScope='products'
        />
        <ProductsInShopTable />
      </KTCard>
    </>
  )
}

const ProductsInShopWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <ProductsInShop />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {ProductsInShopWrapper}
