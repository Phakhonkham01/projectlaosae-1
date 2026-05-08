import {useEffect} from 'react'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import Dashboard from './Dashboard'

const dashboardBreadCrumbs: Array<PageLink> = [
  {
    title: 'ໜ້າຫຼັກ',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  },
]

const DashboardPage = () => {
  useEffect(() => {
    // We have to show toolbar only for dashboard page
    document.getElementById('kt_layout_toolbar')?.classList.remove('d-none')
    return () => {
      document.getElementById('kt_layout_toolbar')?.classList.add('d-none')
    }
  }, [])

  return (
    <>
      <Dashboard />
    </>
  )
}

const DashboardWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={dashboardBreadCrumbs}>ໜ້າຫຼັກ</PageTitle>
      <DashboardPage />
    </>
  )
}

export {DashboardWrapper}
