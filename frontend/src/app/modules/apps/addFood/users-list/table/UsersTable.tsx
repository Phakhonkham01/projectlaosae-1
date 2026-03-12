import { useMemo } from 'react'
import { useTable, ColumnInstance, Row } from 'react-table'
import { useQueryResponseData, useQueryResponseLoading } from '../core/QueryResponseProvider'
import { Product } from '../core/_models'
import { getProductsColumns, useCategoryMap } from './columns/_columns'
import { KTCardBody } from '../../../../../../_metronic/helpers'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { UsersListLoading } from '../components/loading/UsersListLoading'
import { UsersListPagination } from '../components/pagination/UsersListPagination'

const ProductsTable = () => {
  const products = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const { map: categoryMap } = useCategoryMap() // ✅ fetch ครั้งเดียว

  const data = useMemo(() => products, [products])
  const columns = useMemo(
    () => getProductsColumns(categoryMap), // ✅ pass map เข้า columns
    [categoryMap]
  )

  const { getTableProps, getTableBodyProps, headers, rows, prepareRow } = useTable({
    columns,
    data,
  })

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table_products'
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
              rows.map((row: Row<Product>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.id}`} />
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    No products found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* <UsersListPagination /> */}
      {isLoading && <UsersListLoading />}
    </KTCardBody>
  )
}

export { ProductsTable }