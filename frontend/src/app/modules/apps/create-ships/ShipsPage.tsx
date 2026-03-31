import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {UsersListWrapper} from './users-list/Ships'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'ສ້າງເຮືອ',
    path: '/apps/create-ships/ships',
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

const ShipsPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='ships'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>ລາຍການເຮືອ</PageTitle>
              <UsersListWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/create-ships/ships' />} />
    </Routes>
  )
}

export default ShipsPage
