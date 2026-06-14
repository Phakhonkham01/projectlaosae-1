import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {RevenueReport} from './RevenueReport'

const breadcrumbs: Array<PageLink> = [
  {
    title: 'ລາຍງານ',
    path: '/apps/revenue-report/summary',
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

const RevenueReportPage = () => (
  <Routes>
    <Route element={<Outlet />}>
      <Route
        path='summary'
        element={
          <>
            <PageTitle breadcrumbs={breadcrumbs}>ລາຍງານລາຍຮັບ</PageTitle>
            <RevenueReport />
          </>
        }
      />
    </Route>
    <Route index element={<Navigate to='/apps/revenue-report/summary' />} />
  </Routes>
)

export default RevenueReportPage
