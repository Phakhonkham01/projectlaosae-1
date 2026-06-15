import {useEffect, useMemo, useState} from 'react'
import {ColumnInstance, Row, useTable} from 'react-table'
import {KTCardBody, KTIcon, useDebounce} from '../../../../../../_metronic/helpers'
import {UsersListLoading} from '../../../addFood/users-list/components/loading/UsersListLoading'
import {getShips} from '../../../create-ships/users-list/core/ship_requests'
import {ShipData} from '../../../create-ships/users-list/core/ship_models'
import {ShipsInShopCardGrid} from './columns/ShipsInShopCardGrid'
import {getShipsInShopColumns} from './columns/shipsColumns'

type ViewMode = 'table' | 'card'

const ShipsInShopTable = () => {
  const [ships, setShips] = useState<ShipData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 150)

  useEffect(() => {
    const fetchShips = async () => {
      try {
        setIsLoading(true)
        const response = await getShips()
        setShips(response.filter((ship) => ship.status !== 'Inactive' && (ship.quantity ?? 0) > 0))
      } catch (error) {
        console.error('Failed to load ships in shop:', error)
        setShips([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchShips()
  }, [])

  const filteredShips = useMemo(() => {
    const keyword = (debouncedSearchTerm || '').trim().toLowerCase()
    if (!keyword) return ships

    return ships.filter((ship) =>
      [ship.ship_name, ship.name, String(ship.capacity), String(ship.price)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword))
    )
  }, [ships, debouncedSearchTerm])

  const columns = useMemo(() => getShipsInShopColumns(), [])
  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
    columns,
    data: filteredShips,
  })

  return (
    <KTCardBody className='py-4 position-relative'>
      <div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-6'>
        <div className='d-flex align-items-center gap-4'>
          <div className='d-flex align-items-center position-relative my-1'>
            <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />
            <input
              type='text'
              className='form-control form-control-solid w-250px ps-14'
              placeholder='ຄົ້ນຫາເຮືອ'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className='badge badge-light-primary fs-7 fw-bold px-3 py-2 d-none d-md-inline'>
            ມີເຮືອ {filteredShips.length} ລຳ
          </span>
        </div>

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

      {viewMode === 'card' && <ShipsInShopCardGrid data={filteredShips} />}

      {viewMode === 'table' && (
        <div className='table-responsive'>
          <table
            id='kt_table_ships_in_shop'
            className='table align-middle table-row-dashed table-hover fs-6 gy-4 dataTable no-footer'
            {...getTableProps()}
          >
            <thead>
              <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                {headers.map((column: ColumnInstance<ShipData>) => (
                  <th {...column.getHeaderProps()} key={column.id} className='min-w-125px'>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
              {rows.length > 0 ? (
                rows.map((row: Row<ShipData>, index) => {
                  prepareRow(row)
                  return (
                    <tr {...row.getRowProps()} key={`ship-in-shop-row-${index}-${row.id}`}>
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} key={cell.column.id}>
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className='d-flex flex-column text-center w-100 align-items-center justify-content-center py-10'>
                      <i className='ki-duotone ki-delivery-3 fs-3x text-muted mb-3'>
                        <span className='path1' />
                        <span className='path2' />
                        <span className='path3' />
                        <span className='path4' />
                        <span className='path5' />
                      </i>
                      <span className='text-muted fs-5'>ບໍ່ພົບເຮືອທີ່ມີໃຫ້ບໍລິການ</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isLoading && <UsersListLoading />}
    </KTCardBody>
  )
}

export {ShipsInShopTable}
