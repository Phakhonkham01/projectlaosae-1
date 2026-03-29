
import {AsideMenuItemWithSub} from './AsideMenuItemWithSub'
import {AsideMenuItem} from './AsideMenuItem'
import { useAuth } from '../../../../app/modules/auth'

export function AsideMenuMain() {
  const { currentUser } = useAuth()
  const isCustomer = currentUser?.role === 'customer'

  return (
    <>
      <AsideMenuItem
        to='/dashboard'
        icon='color-swatch'
        title='ໜ້າຫຼັກ'
        fontIcon='bi-app-indicator'
      />
      {/* <AsideMenuItem to='/builder' icon='switch' title='ຕັ້ງຄ່າໂຄງຮ່າງ' fontIcon='bi-layers' />
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>ເມນູທົ່ວໄປ</span>
        </div>
      </div> */}
      {/* <AsideMenuItemWithSub
        to='/crafted/pages'
        title='ໜ້າ'
        fontIcon='bi-archive'
        icon='element-plus'
      > */}
        {/* <AsideMenuItemWithSub to='/crafted/pages/profile' title='ໂປຣໄຟລ໌' hasBullet={true}>
          <AsideMenuItem to='/crafted/pages/profile/overview' title='ພາບລວມ' hasBullet={true} />
          <AsideMenuItem to='/crafted/pages/profile/projects' title='ໂຄງການ' hasBullet={true} />
          <AsideMenuItem to='/crafted/pages/profile/campaigns' title='ແຄມເປນ' hasBullet={true} />
          <AsideMenuItem to='/crafted/pages/profile/documents' title='ເອກະສານ' hasBullet={true} />
          <AsideMenuItem
            to='/crafted/pages/profile/connections'
            title='ການເຊື່ອມຕໍ່'
            hasBullet={true}
          />
        </AsideMenuItemWithSub> */}

        {/* <AsideMenuItemWithSub to='/crafted/pages/wizards' title='ຕົວຊ່ວຍ' hasBullet={true}>
          <AsideMenuItem
            to='/crafted/pages/wizards/horizontal'
            title='ແນວນອນ'
            hasBullet={true}
          />
          <AsideMenuItem to='/crafted/pages/wizards/vertical' title='ແນວຕັ້ງ' hasBullet={true} />
        </AsideMenuItemWithSub> */}
      {/* </AsideMenuItemWithSub> */}
      {/* <AsideMenuItemWithSub
        to='/crafted/accounts'
        title='ບັນຊີ'
        icon='profile-circle'
        fontIcon='bi-person'
      >
        <AsideMenuItem to='/crafted/account/overview' title='ພາບລວມ' hasBullet={true} />
        <AsideMenuItem to='/crafted/account/settings' title='ຕັ້ງຄ່າ' hasBullet={true} />
      </AsideMenuItemWithSub>
      <AsideMenuItemWithSub to='/error' title='ຂໍ້ຜິດພາດ' fontIcon='bi-sticky' icon='cross-circle'>
        <AsideMenuItem to='/error/404' title='ຂໍ້ຜິດພາດ 404' hasBullet={true} />
        <AsideMenuItem to='/error/500' title='ຂໍ້ຜິດພາດ 500' hasBullet={true} />
      </AsideMenuItemWithSub> */}
      {/* <AsideMenuItemWithSub
        to='/crafted/widgets'
        title='ວິດເຈັດ'
        icon='element-11'
        fontIcon='bi-layers'
      >
        <AsideMenuItem to='/crafted/widgets/lists' title='ລາຍການ' hasBullet={true} />
        <AsideMenuItem to='/crafted/widgets/statistics' title='ສະຖິຕິ' hasBullet={true} />
        <AsideMenuItem to='/crafted/widgets/charts' title='ກຣາຟ' hasBullet={true} />
        <AsideMenuItem to='/crafted/widgets/mixed' title='ປະສົມ' hasBullet={true} />
        <AsideMenuItem to='/crafted/widgets/tables' title='ຕາຕະລາງ' hasBullet={true} />
        <AsideMenuItem to='/crafted/widgets/feeds' title='ຟີດ' hasBullet={true} />
      </AsideMenuItemWithSub>
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>ແອັບພລິເຄຊັນ</span>
        </div>
      </div> */}
      {/* <AsideMenuItemWithSub
        to='/apps/chat'
        title='ແຊັດ'
        fontIcon='bi-chat-left'
        icon='message-text-2'
      >
        <AsideMenuItem to='/apps/chat/private-chat' title='ແຊັດສ່ວນຕົວ' hasBullet={true} />
        <AsideMenuItem to='/apps/chat/group-chat' title='ແຊັດກຸ່ມ' hasBullet={true} />
        <AsideMenuItem to='/apps/chat/drawer-chat' title='ແຊັດແບບດຶງອອກ' hasBullet={true} />
      </AsideMenuItemWithSub> */}
      {/* <AsideMenuItem
        to='/apps/user-management/users'
        icon='people'
        title='ຈັດການຜູ້ໃຊ້'
        fontIcon='bi-layers'
      /> */}
      <AsideMenuItem
        to='/apps/booking-management/booking-ships'
        icon='people'
        title='ຈອງເຮືອ ແລະ ອາຫານ'
        fontIcon='bi-layers'
      />

      {!isCustomer && (
        <>
          <AsideMenuItem
            to='/apps/create-ships/ships'
            icon='people'
            title='ຈັດການເຮືອໃນຮ້ານ'
            fontIcon='bi-layers'
          />
          <AsideMenuItem
            to='/apps/check-bill/check-bills'
            icon='calendar-edit'
            title='ກວດສອບ ແລະ ຈັດການໃບບິນ'
            fontIcon='bi-calendar-event'
          />
          <AsideMenuItem
            to='/apps/employees-management'
            icon='check-circle'
            title='ພະນັກງານ ( ຈັດການຂໍ້ມູນ)'
            fontIcon='bi-calendar-event'
          />
          <AsideMenuItem
            to='/apps/add-food'
            icon='tree'
            title='ຈັດການສິນຄ້າພາຍໃນຮ້ານ'
            fontIcon='bi-calendar-event'
          />
        </>
      )}

      <AsideMenuItem
        to='/apps/user-history'
        icon='tree'
        title='ປະຫວັດການຈອງເຮືອ'
        fontIcon='bi-calendar-event'
      />
    </>
  )
}
