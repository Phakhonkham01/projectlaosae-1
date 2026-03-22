import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {HistoryListWrapper} from './employees-list/HistoryList'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'User History',
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
              <HistoryListWrapper />
            </>
          }
        />
      </Route>
      {/* ลบ <Route index element={<Navigate to='' />} /> ออก */}
    </Routes>
  )
}

export default UsersPage
