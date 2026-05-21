import {FC, lazy, Suspense} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {MenuTestPage} from '../pages/MenuTestPage'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper'
import BillPage from '../modules/apps/bills-management/BillPage'

const PrivateRoutes = () => {
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const WizardsPage = lazy(() => import('../modules/wizards/WizardsPage'))
  const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
  const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))
  const ChatPage = lazy(() => import('../modules/apps/chat/ChatPage'))
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))
  // const EventsPage = lazy(() => import('../modules/apps/event/EventsPage'))
  // const HolidaysPage = lazy(() => import('../modules/apps/holiday/HolidaysPage'))
  const RequestsPage = lazy(() => import('../modules/apps/request/RequestPage'))
  const UserRequired = lazy(() => import('../modules/apps/user-required/UserRequired'))
  const ShipsPage = lazy(() => import('../modules/apps/create-ships/ShipsPage'))
  const AddFood  = lazy(()=> import('../modules/apps/addFood/addFoodPage'))
  const ProductsInShopPage = lazy(() => import('../modules/apps/Products_in_shop/ProductsInShopPage'))
  const BookingShipsPage = lazy(() => import('../modules/apps/booking-management/BookingShipsPage'))
  const EmployeePage = lazy(()=> import('../modules/apps/employees-management/EmployeesPage'))
  const HistoryPage = lazy(()=> import('../modules/apps/User-history/UserHistoryPage'))
  const MyProfilePage = lazy(() => import('../modules/apps/my-profile/MyProfilePage'))
  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        {/* Pages */}
        <Route path='dashboard' element={<DashboardWrapper />} />
        <Route path='builder' element={<BuilderPageWrapper />} />
        <Route path='menu-test' element={<MenuTestPage />} />
        {/* Lazy Modules */}
        <Route
          path='crafted/pages/profile/*'
          element={
            <SuspensedView>
              <ProfilePage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/create-ships/*'
          element={
            <SuspensedView>
              <ShipsPage />
            </SuspensedView>
          }
        />
           <Route
          path='apps/check-bill/*'
          element={
            <SuspensedView>
              <BillPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/booking-management/*'
          element={
            <SuspensedView>
              <BookingShipsPage />
            </SuspensedView>
          }
        />
             <Route
          path='/apps/employees-management/*'
          element={
            <SuspensedView>
              <EmployeePage />
            </SuspensedView>
          }
        />
        {/* <Route
          path='apps/event/*'
          element={
            <SuspensedView>
              <EventsPage />
            </SuspensedView>
          }
        /> */}
        <Route
          path='apps/user-required/*'
          element={
            <SuspensedView>
              <UserRequired />
            </SuspensedView>
          }
        />
        <Route
          path='apps/requests/*'
          element={
            <SuspensedView>
              <RequestsPage />
            </SuspensedView>
          }
        />
        {/* <Route
          path='apps/holiday/*'
          element={
            <SuspensedView>
              <HolidaysPage />
            </SuspensedView>
          }
        /> */}
        <Route
          path='crafted/widgets/*'
          element={
            <SuspensedView>
              <WidgetsPage />
            </SuspensedView>
          }
        />
        <Route
          path='crafted/account/*'
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/chat/*'
          element={
            <SuspensedView>
              <ChatPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/user-management/*'
          element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/add-food/*'
          element={
            <SuspensedView>
              <AddFood />
            </SuspensedView>
          }
        />
        <Route
          path='apps/products-in-shop/*'
          element={
            <SuspensedView>
              <ProductsInShopPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/user-history/*'
          element={
            <SuspensedView>
              <HistoryPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/my-profile'
          element={
            <SuspensedView>
              <MyProfilePage />
            </SuspensedView>
          }
        />
        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export {PrivateRoutes}
