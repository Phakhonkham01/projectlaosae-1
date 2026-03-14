import { FC, useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../../../../app/modules/auth'
import { db } from '../../../../../../firebase/useFirebase' // ← ปรับ path ให้ตรง
import { EditProfileModal } from '../../../../_metronic/layout/components/aside/form/editProfileModal'


const HeaderUserMenu: FC = () => {
  const { currentUser, logout } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [displayName, setDisplayName]     = useState(currentUser?.user_name  || '')
  const [displayEmail, setDisplayEmail]   = useState(currentUser?.user_email || '')

  // ── ดึง name/email จาก Firestore จริงๆ ──
  useEffect(() => {
    if (!currentUser?._id) return

    const fetchUser = async () => {
      try {
        const snap = await getDoc(doc(db, 'USER', currentUser._id))
        if (snap.exists()) {
          const data = snap.data()
          setDisplayName(data.name   || currentUser.user_name  || '')
          setDisplayEmail(data.email || currentUser.user_email || '')
        }
      } catch (err) {
        console.error('HeaderUserMenu fetch error:', err)
      }
    }

    fetchUser()
  }, [currentUser?._id])

  // ── รีเฟรช header หลัง save modal ──
  const handleModalClose = async () => {
    setShowEditModal(false)
    if (!currentUser?._id) return
    try {
      const snap = await getDoc(doc(db, 'USER', currentUser._id))
      if (snap.exists()) {
        const data = snap.data()
        setDisplayName(data.name   || '')
        setDisplayEmail(data.email || '')
      }
    } catch (err) {
      console.error('Refresh user error:', err)
    }
  }

  return (
    <>
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
        data-kt-menu='true'
      >
        <div className='menu-item px-3'>
          <div className='menu-content d-flex align-items-center px-3'>
            <div className='d-flex flex-column'>
              <div
                className='fw-bolder d-flex align-items-center fs-5'
                onClick={() => setShowEditModal(true)}
                style={{ cursor: 'pointer' }}
                title='Edit profile'
              >
                {displayName}
              </div>
              <a
                href='#'
                className='fw-bold text-muted text-hover-primary fs-7'
                onClick={(e) => {
                  e.preventDefault()
                  setShowEditModal(true)
                }}
                title='Edit profile'
              >
                {displayEmail}
              </a>
            </div>
          </div>
        </div>

        <div className='separator my-2'></div>

        <div className='menu-item px-5'>
          <a
            onClick={() => setShowEditModal(true)}
            className='menu-link px-5'
            style={{ cursor: 'pointer' }}
          >
            Edit Profile
          </a>
        </div>

        <div className='separator my-2'></div>

        <div className='menu-item px-5'>
          <a onClick={logout} className='menu-link px-5'>
            Sign Out
          </a>
        </div>
      </div>

      <EditProfileModal
        show={showEditModal}
        onClose={handleModalClose}
      />
    </>
  )
}

export { HeaderUserMenu }