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
    () => (products as Product[]).filter((product) => product.available !== false),
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
      <div className='d-flex flex-wrap justify-content-between align-items-center mb-6 gap-3'>
        <span className='badge badge-light-primary fs-7 fw-bold px-3 py-2'>
          ມີສິນຄ້າ {data.length} ລາຍການ
        </span>
        <div className='btn-group btn-group-sm bg-light rounded p-1' role='group'>
          <button
            type='button'
            className={`btn btn-sm rounded ${viewMode === 'card' ? 'btn-primary' : 'btn-active-light-primary text-gray-700'}`}
            onClick={() => setViewMode('card')}
          >
            <i className='ki-duotone ki-element-11 fs-5 m-0'>
              <span className='path1' />
              <span className='path2' />
              <span className='path3' />
              <span className='path4' />
            </i>
            <span className='ms-1'>ບັດ</span>
          </button>
          <button
            type='button'
            className={`btn btn-sm rounded ${viewMode === 'table' ? 'btn-primary' : 'btn-active-light-primary text-gray-700'}`}
            onClick={() => setViewMode('table')}
          >
            <i className='ki-duotone ki-row-horizontal fs-5 m-0'>
              <span className='path1' />
              <span className='path2' />
            </i>
            <span className='ms-1'>ຕາຕະລາງ</span>
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
              className='table align-middle table-row-dashed table-hover fs-6 gy-4 dataTable no-footer'
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
                      <div className='d-flex flex-column text-center w-100 align-items-center justify-content-center py-10'>
                        <i className='ki-duotone ki-basket fs-3x text-muted mb-3'>
                          <span className='path1' />
                          <span className='path2' />
                          <span className='path3' />
                          <span className='path4' />
                        </i>
                        <span className='text-muted fs-5'>ບໍ່ພົບສິນຄ້າທີ່ມີຂາຍ</span>
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
