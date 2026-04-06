import {useMemo, useState} from 'react'
import {ColumnInstance, Row, useTable} from 'react-table'
import {KTCardBody} from '../../../../../../_metronic/helpers'
import {UsersListLoading} from '../../../addFood/users-list/components/loading/UsersListLoading'
import {UsersListPagination} from '../../../addFood/users-list/components/pagination/UsersListPagination'
import {Product} from '../../../addFood/users-list/core/_models'
import {useQueryResponseData, useQueryResponseLoading} from '../../../addFood/users-list/core/QueryResponseProvider'
import {CustomHeaderColumn} from '../../../addFood/users-list/table/columns/CustomHeaderColumn'
import {CustomRow} from '../../../addFood/users-list/table/columns/CustomRow'
import {getProductsInShopColumns, useCategoryMap} from './columns/_columns'
import {ProductsInShopCardGrid} from './columns/ProductsInShopCardGrid'

type ViewMode = 'table' | 'card'

const ProductsInShopTable = () => {
  const products = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const {map: categoryMap, loading: loadingMap} = useCategoryMap()
  const [viewMode, setViewMode] = useState<ViewMode>('card')

  const data = useMemo(
    () => (products as Product[]).filter((product) => product.availability !== false),
    [products]
  )
  const columns = useMemo(
    () => getProductsInShopColumns(categoryMap, loadingMap),
    [categoryMap, loadingMap]
  )

  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
    columns,
    data,
  })

  return (
    <KTCardBody className='py-4'>
      <div className='d-flex justify-content-end mb-5'>
        <div className='btn-group' role='group'>
          <button
            type='button'
            className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setViewMode('card')}
          >
            <i className='ki-duotone ki-element-equal fs-4 m-0'>
              <span className='path1' />
              <span className='path2' />
              <span className='path3' />
              <span className='path4' />
            </i>
            <span className='ms-1'>Card</span>
          </button>
          <button
            type='button'
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setViewMode('table')}
          >
            <i className='ki-duotone ki-row-horizontal fs-4 m-0'>
              <span className='path1' />
              <span className='path2' />
            </i>
            <span className='ms-1'>Table</span>
          </button>
        </div>
      </div>

      {viewMode === 'card' && (
        <>
          <ProductsInShopCardGrid data={data} categoryMap={categoryMap} />
          {isLoading && <UsersListLoading />}
          <UsersListPagination />
        </>
      )}

      {viewMode === 'table' && (
        <>
          <div className='table-responsive'>
            <table
              id='kt_table_products_in_shop'
              className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
              {...getTableProps()}
            >
              <thead>
                <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                  {headers.map((column: ColumnInstance<Product>) => (
                    <CustomHeaderColumn key={column.id} column={column} />
                  ))}
                </tr>
              </thead>
              <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
                {rows.length > 0 ? (
                  rows.map((row: Row<Product>, index) => {
                    prepareRow(row)
                    return <CustomRow row={row} key={`product-in-shop-row-${index}-${row.id}`} />
                  })
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                        No available products found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <UsersListPagination />
          {isLoading && <UsersListLoading />}
        </>
      )}
    </KTCardBody>
  )
}

export {ProductsInShopTable}
