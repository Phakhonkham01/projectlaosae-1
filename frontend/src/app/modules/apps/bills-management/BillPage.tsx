import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {UsersListWrapper} from './bills-list/Bills'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'ບິນ',
    path: '/apps/check-bill/check-bills',
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

const BillPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='check-bills'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>ຈັດການໃບບິນ</PageTitle>
              <UsersListWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/check-bill/check-bills' />} />
    </Routes>
  )
}

export default BillPage
