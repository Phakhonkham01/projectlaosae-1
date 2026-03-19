import {ListViewProvider, useListView} from './core/ListViewProvider'
import {QueryRequestProvider} from './core/QueryRequestProvider'
import {QueryResponseProvider} from './core/QueryResponseProvider'
import {UsersListHeader} from './components/header/UsersListHeader'
import {ShipTable} from './table/BillTable'
import {BookingShipEditModal} from './bill-edit-modal/BillEditModal'
import {KTCard} from '../../../../../_metronic/helpers'

const BillsList = () => {
  const {itemIdForUpdate} = useListView()
  return (
    <>
      <KTCard>
        <UsersListHeader />
        <ShipTable />
      </KTCard>
      {itemIdForUpdate !== undefined && <BookingShipEditModal />}
    </>
  )
}

const UsersListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <BillsList />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {UsersListWrapper}
