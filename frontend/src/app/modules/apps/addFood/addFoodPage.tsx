import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {UsersListWrapper} from './users-list/UsersList'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Food Management',
    path: '/apps/add-food/list',
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

const UsersPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='list'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Product List</PageTitle>
              <UsersListWrapper />
            </>
          }
        />
      </Route>
      {/* ✅ relative path — ไม่มี / นำหน้า */}
      <Route index element={<Navigate to='list' />} />
    </Routes>
  )
}

export default UsersPage