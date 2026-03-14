import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {UsersListWrapper} from './users-list/BookingShips'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Booking Ships',
    path: '/apps/booking-ships/ships',
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

const BookingShipsPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='booking-ships'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Booking Ships</PageTitle>
              <UsersListWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/booking-ships/booking-ships' />} />
    </Routes>
  )
}

export default BookingShipsPage
