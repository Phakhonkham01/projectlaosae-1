
import { AsideMenuItemWithSub } from './AsideMenuItemWithSub'
import { AsideMenuItem } from './AsideMenuItem'
import { useAuth } from '../../../../app/modules/auth'

export function AsideMenuMain() {
  const { currentUser } = useAuth()
  const isCustomer = currentUser?.role === 'customer'

  return (
    <>
      <AsideMenuItem
        to='/dashboard'
        icon='home'
        title='ໜ້າຫຼັກ'
        fontIcon='bi-app-indicator'
      />

      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>ບໍລິການ</span>
        </div>
      </div>

      <AsideMenuItem
        to='/apps/booking-management/booking-ships'
        icon='lots-shopping'
        title='ຈອງເຮືອ ແລະ ອາຫານ'
        fontIcon='bi-layers'
      />

      {isCustomer && (
        <AsideMenuItem
          to='/apps/products-in-shop/list'
          icon='basket'
          title='ສິນຄ້າໃນຮ້ານ'
          fontIcon='bi-bag'
        />
      )}

      <AsideMenuItem
        to='/apps/user-history'
        icon='directbox-default'
        title='ປະຫວັດການຈອງເຮືອ'
        fontIcon='bi-calendar-event'
      />

      {!isCustomer && (
        <>
          <div className='menu-item'>
            <div className='menu-content pt-8 pb-2'>
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'>ຈັດການລະບົບ</span>
            </div>
          </div>

          <AsideMenuItem
            to='/apps/create-ships/ships'
            icon='ship'
            title='ຈັດການເຮືອໃນຮ້ານ'
            fontIcon='bi-layers'
          />

          <AsideMenuItem
            to='/apps/add-food'
            icon='delivery-3'
            title='ຈັດການສິນຄ້າພາຍໃນຮ້ານ'
            fontIcon='bi-calendar-event'
          />

          <AsideMenuItem
            to='/apps/check-bill/check-bills'
            icon='notepad-bookmark'
            title='ກວດສອບ ແລະ ຈັດການໃບບິນ'
            fontIcon='bi-calendar-event'
          />

          <AsideMenuItem
            to='/apps/revenue-report/summary'
            icon='chart-line-up'
            title='ລາຍງານລາຍຮັບ'
            fontIcon='bi-graph-up'
          />

          <AsideMenuItem
            to='/apps/employees-management'
            icon='people'
            title='ພະນັກງານ ( ຈັດການຂໍ້ມູນ )'
            fontIcon='bi-calendar-event'
          />
        </>
      )}

      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>ບັນຊີຜູ້ໃຊ້</span>
        </div>
      </div>

      <AsideMenuItem
        to='/apps/my-profile'
        icon='profile-circle'
        title='ໂປຣໄຟລ໌'
        fontIcon='bi-layers'
      />
    </>
  )
}
