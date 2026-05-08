import Swal from 'sweetalert2'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {HeaderNotificationsMenu, HeaderUserMenu, QuickLinks} from '../../../partials'
import {useAuth} from '../../../../app/modules/auth'

const AsideFooter = () => {
  const {logout} = useAuth()

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'ອອກຈາກລະບົບ?',
      text: 'ທ່ານຕ້ອງການອອກຈາກລະບົບແທ້ບໍ?',
      showCancelButton: true,
      confirmButtonText: 'ຕົກລົງ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#f1416c',
    })

    if (!result.isConfirmed) return

    logout()
    window.location.href = import.meta.env.BASE_URL
  }

  return (
    <div
      className='aside-footer d-flex flex-column align-items-center flex-column-auto'
      id='kt_aside_footer'
    >
      {/* begin::Quick links */}
      <div className='d-flex align-items-center mb-2'>
        {/* begin::Menu wrapper */}
        {/* <div
          className='btn btn-icon btn-active-color-primary btn-color-gray-500 btn-active-light'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='true'
          data-kt-menu-placement='top-start'
          data-bs-toggle='tooltip'
          data-bs-placement='right'
          data-bs-dismiss='click'
          title='Quick links'
        >
          <KTIcon iconName='element-plus' className='fs-2 text-lg-1' />
        </div> */}
        {/* end::Menu wrapper */}
        <QuickLinks backgroundUrl='media/misc/pattern-1.jpg' />
      </div>
      {/* end::Quick links */}

      {/* begin::Activities */}
      <div className='d-flex align-items-center mb-3'>
        {/* begin::Drawer toggle */}
        {/* <div
          className='btn btn-icon btn-active-color-primary btn-color-gray-500 btn-active-light'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='true'
          data-kt-menu-placement='top-start'
          data-bs-toggle='tooltip'
          data-bs-placement='right'
          data-bs-dismiss='click'
          title='Activity Logs'
          id='kt_activities_toggle'
        >
          <KTIcon iconName='chart-simple' className='fs-2 text-lg-1' />
        </div> */}
        {/* end::drawer toggle */}
      </div>
      {/* end::Activities */}

      {/* begin::Notifications */}
      <div className='d-flex align-items-center mb-2'>
        {/* begin::Menu wrapper */}
        {/* <div
          className='btn btn-icon btn-active-color-primary btn-color-gray-500 btn-active-light'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='true'
          data-kt-menu-placement='top-start'
          data-bs-toggle='tooltip'
          data-bs-placement='right'
          data-bs-dismiss='click'
          title='Notifications'
        >
          <KTIcon iconName='element-11' className='fs-2 text-lg-1' />
        </div> */}
        {/* end::Menu wrapper */}
        <HeaderNotificationsMenu backgrounUrl='media/misc/pattern-1.jpg' />
      </div>
      {/* end::Notifications */}

      {/* begin::User */}
      <div className='d-flex align-items-center mb-10' id='kt_header_user_menu_toggle'>
        {/* begin::Menu wrapper */}
        {/* <div
          className='cursor-pointer symbol symbol-40px'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='false'
          data-kt-menu-placement='top-start'
          title='User profile'
        >
          <img src={toAbsoluteUrl('media/avatars/300-1.jpg')} alt='avatar' />
        </div> */}
        {/* end::Menu wrapper */}
        <HeaderUserMenu />
      </div>
      {/* end::User */}

      <button
        type='button'
        className='btn btn-icon btn-light-danger btn-active-danger position-fixed bottom-0 start-0 mb-8'
        title='ອອກຈາກລະບົບ'
        aria-label='ອອກຈາກລະບົບ'
        style={{marginLeft: 30, zIndex: 110}}
        onClick={handleLogout}
      >
        <i className='bi bi-box-arrow-right fs-2' />
      </button>
    </div>
  )
}

export {AsideFooter}
