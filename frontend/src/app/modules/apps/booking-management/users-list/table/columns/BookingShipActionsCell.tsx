import { FC, useEffect } from 'react'
import { MenuComponent } from '../../../../../../../_metronic/assets/ts/components'
import { ID } from '../../../../../../../_metronic/helpers'
import { useListView } from '../../core/ListViewProvider'

type Props = {
  id: ID
  disabled?: boolean
  disabledLabel?: string
}

const BookingShipActionsCell: FC<Props> = ({ id, disabled = false, disabledLabel = 'ຈອງເຕັມແລ້ວ' }) => {
  const { setItemIdForUpdate } = useListView()

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = (e: React.MouseEvent) => {
    e.preventDefault()
    if (disabled) return
    setItemIdForUpdate(id)
  }

  return (
    <>
      <a
        href='#'
        className={`btn btn-sm ${
          disabled
            ? 'btn-light text-muted disabled'
            : 'btn-light btn-active-light-primary'
        }`}
        aria-disabled={disabled}
        style={disabled ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
        onClick={openEditModal}
      >
        {disabled ? disabledLabel : 'ຈອງດຽວນີ້'}
      </a>
      {/* begin::Menu */}
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4'
        data-kt-menu='true'
      >
        {/* begin::Menu item - Edit */}
     
        {/* end::Menu item */}

        {/* begin::Menu item - Delete */}

        {/* end::Menu item */}
      </div>
      {/* end::Menu */}
    </>
  )
}

export { BookingShipActionsCell }
