import {useState} from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import {ListViewProvider} from '../../addFood/users-list/core/ListViewProvider'
import {QueryRequestProvider} from '../../addFood/users-list/core/QueryRequestProvider'
import {QueryResponseProvider} from '../../addFood/users-list/core/QueryResponseProvider'
import {ProductsInShopHeader} from './components/header/ProductsInShopHeader'
import {ShipsInShopTable} from './table/ShipsInShopTable'
import {ProductsInShopTable} from './table/ProductsInShopTable'

type TabKey = 'ships' | 'products'

const ProductsInShop = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('ships')

  return (
    <KTCard>
      <div className='card-header border-0 pt-6 pb-0'>
        <ul className='nav nav-tabs nav-line-tabs nav-line-tabs-2x fs-4 fw-bold border-0 w-100'>
          <li className='nav-item'>
            <button
              type='button'
              className={`nav-link d-flex align-items-center ${activeTab === 'ships' ? 'active' : ''}`}
              onClick={() => setActiveTab('ships')}
            >
              <i className='ki-duotone ki-delivery-3 fs-3 me-2'>
                <span className='path1' />
                <span className='path2' />
                <span className='path3' />
                <span className='path4' />
                <span className='path5' />
              </i>
              ເຮືອໃນຮ້ານ
            </button>
          </li>
          <li className='nav-item'>
            <button
              type='button'
              className={`nav-link d-flex align-items-center ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className='ki-duotone ki-basket fs-3 me-2'>
                <span className='path1' />
                <span className='path2' />
                <span className='path3' />
                <span className='path4' />
              </i>
              ສິນຄ້າໃນຮ້ານ
            </button>
          </li>
        </ul>
      </div>

      {activeTab === 'ships' && (
        <>
          <ProductsInShopHeader
            subtitle='ເລືອກເບິ່ງເຮືອທີ່ມີໃຫ້ບໍລິການກ່ອນຈະຈອງ'
            showSearch={false}
          />
          <ShipsInShopTable />
        </>
      )}

      {activeTab === 'products' && (
        <>
          <ProductsInShopHeader
            subtitle='ເລືອກເບິ່ງສິນຄ້າທີ່ມີຢູ່ໃນຮ້ານ'
            searchPlaceholder='ຄົ້ນຫາສິນຄ້າ'
            searchScope='products'
          />
          <ProductsInShopTable />
        </>
      )}
    </KTCard>
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
