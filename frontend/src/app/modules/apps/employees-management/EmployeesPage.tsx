import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {UsersListWrapper} from './employees-list/EmployeesList'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'User Management',
    path: '',
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
          index  // ← ใช้ index แทน path=''
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>Users list</PageTitle>
              <UsersListWrapper />
            </>
          }
        />
      </Route>
      {/* ลบ <Route index element={<Navigate to='' />} /> ออก */}
    </Routes>
  )
}

export default UsersPage
