import React, { FC, useState, useRef, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import Swal from 'sweetalert2'
import { useAuth } from '../../../../../app/modules/auth'
import { toAbsoluteUrl } from '../../../../helpers'
import { db, storage, auth } from '../../../../../../../firebase/useFirebase'

type Tab = 'profile' | 'password'

// ─────────────────────────────────────────────────────────────
// Helpers — defined OUTSIDE component so React never remounts
// ─────────────────────────────────────────────────────────────
const getStrength = (pwd: string) => {
  if (!pwd) return { level: 0, label: '', color: '' }
  let s = 0
  if (pwd.length >= 8)          s++
  if (/[A-Z]/.test(pwd))        s++
  if (/[0-9]/.test(pwd))        s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  if (s <= 1) return { level: 1, label: 'Weak',   color: '#f1416c' }
  if (s === 2) return { level: 2, label: 'Fair',   color: '#ffc700' }
  if (s === 3) return { level: 3, label: 'Good',   color: '#17c653' }
  return           { level: 4, label: 'Strong', color: '#17c653' }
}

interface PwdFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  error?: string
  hint?: React.ReactNode
  required?: boolean
}

// ── Defined at module level — stable identity, no remount bug ──
const PwdField: FC<PwdFieldProps> = ({
  label, value, onChange, show, onToggle, error, hint, required = false,
}) => (
  <div className='fv-row mb-6'>
    <label className={`${required ? 'required' : ''} fw-semibold fs-6 mb-2`}>{label}</label>
    <div className='input-group input-group-solid'>
      <input
        type={show ? 'text' : 'password'}
        className={`form-control form-control-solid border-0 ${error ? 'is-invalid' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='••••••••'
        autoComplete='new-password'
      />
      <button
        type='button'
        className='btn btn-icon btn-active-light-secondary border-0 bg-light'
        onClick={onToggle}
        tabIndex={-1}
      >
        <i className={`ki-duotone ${show ? 'ki-eye-slash' : 'ki-eye'} fs-3 text-gray-500`}>
          <span className='path1' /><span className='path2' /><span className='path3' />
        </i>
      </button>
    </div>
    {error && (
      <div className='fv-plugins-message-container mt-1'>
        <span className='fv-help-block text-danger fs-7'>{error}</span>
      </div>
    )}
    {hint && !error && <div className='mt-1'>{hint}</div>}
  </div>
)

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
interface EditProfileModalProps {
  show: boolean
  onClose: () => void
}

const EditProfileModal: FC<EditProfileModalProps> = ({ show, onClose }) => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // Profile state
  const [userName,      setUserName]      = useState('')
  const [userLastname,  setUserLastname]  = useState('')
  const [userEmail,     setUserEmail]     = useState('')
  const [userPhone,     setUserPhone]     = useState('')
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [saving,        setSaving]        = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent,     setShowCurrent]     = useState(false)
  const [showNew,         setShowNew]         = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [savingPwd,       setSavingPwd]       = useState(false)
  const [pwdErrors, setPwdErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  // Fetch profile
  useEffect(() => {
    if (!show || !currentUser?._id) return
    const fetchUser = async () => {
      setLoading(true)
      try {
        const snap = await getDoc(doc(db, 'Users', currentUser._id))
        if (snap.exists()) {
          const d = snap.data()
          setUserName(d.name          || '')
          setUserLastname(d.lastname  || '')
          setUserEmail(d.email        || '')
          setUserPhone(d.phone_number || '')
          setAvatarPreview(d.avatar_url || null)
        }
      } catch (err) {
        console.error('Fetch user error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [show, currentUser?._id])

  // Reset password fields on tab switch
  useEffect(() => {
    if (activeTab === 'profile') {
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setShowCurrent(false);  setShowNew(false);   setShowConfirm(false)
      setPwdErrors({})
    }
  }, [activeTab])

  if (!show) return null

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!currentUser?._id) return
    setSaving(true)
    try {
      let avatarUrl: string | undefined
      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${currentUser._id}/${avatarFile.name}`)
        await uploadBytes(storageRef, avatarFile)
        avatarUrl = await getDownloadURL(storageRef)
      }
      await updateDoc(doc(db, 'Users', currentUser._id), {
        name: userName, lastname: userLastname,
        email: userEmail, phone_number: userPhone,
        updatedAt: new Date(),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      })
      await Swal.fire({
        icon: 'success', title: 'Saved!',
        text: 'Your profile has been updated successfully.',
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'btn btn-primary px-8' },
        buttonsStyling: false,
      })
      onClose()
    } catch (err: any) {
      Swal.fire({
        icon: 'error', title: 'Something went wrong!',
        text: err?.message || 'Unable to save changes. Please try again.',
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'btn btn-danger px-8' },
        buttonsStyling: false,
      })
    } finally {
      setSaving(false)
    }
  }

  const validatePwd = (): boolean => {
    const e: typeof pwdErrors = {}
    if (!currentPassword) e.currentPassword = 'Please enter your current password.'
    if (!newPassword)              e.newPassword = 'Please enter a new password.'
    else if (newPassword.length < 8)      e.newPassword = 'At least 8 characters required.'
    else if (!/[A-Z]/.test(newPassword))  e.newPassword = 'Must contain at least one uppercase letter.'
    else if (!/[0-9]/.test(newPassword))  e.newPassword = 'Must contain at least one number.'
    if (!confirmPassword)          e.confirmPassword = 'Please confirm your new password.'
    else if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match.'
    setPwdErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSavePassword = async () => {
    if (!validatePwd()) return
    setSavingPwd(true)
    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser || !firebaseUser.email) throw new Error('Not authenticated')

      // 1️⃣ Re-authenticate ด้วย current password ก่อน
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword)
      await reauthenticateWithCredential(firebaseUser, credential)

      // 2️⃣ อัปเดต password ใน Firebase Auth
      await updatePassword(firebaseUser, newPassword)

      await Swal.fire({
        icon: 'success', title: 'Password Updated!',
        text: 'Your password has been changed successfully.',
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'btn btn-primary px-8' },
        buttonsStyling: false,
      })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      onClose()
    } catch (err: any) {
      // Firebase Auth error codes
      const msg =
        err?.code === 'auth/wrong-password'    ? 'Current password is incorrect.' :
        err?.code === 'auth/too-many-requests'  ? 'Too many attempts. Please try again later.' :
        err?.code === 'auth/requires-recent-login' ? 'Session expired. Please sign in again.' :
        err?.message || 'Unable to update password. Please try again.'

      // ถ้า current password ผิด ให้แสดง error ใต้ field แทน Swal
      if (err?.code === 'auth/wrong-password') {
        setPwdErrors((e) => ({ ...e, currentPassword: 'Current password is incorrect.' }))
        setSavingPwd(false)
        return
      }

      Swal.fire({
        icon: 'error', title: 'Something went wrong!',
        text: msg,
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'btn btn-danger px-8' },
        buttonsStyling: false,
      })
    } finally {
      setSavingPwd(false)
    }
  }

  const handleClose = () => {
    Swal.fire({
      title: 'Discard changes?', text: 'Any unsaved changes will be lost.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Discard', cancelButtonText: 'Keep Editing',
      customClass: { confirmButton: 'btn btn-danger px-6', cancelButton: 'btn btn-light px-6' },
      buttonsStyling: false, reverseButtons: true,
    }).then((r) => { if (r.isConfirmed) onClose() })
  }

  const strength = getStrength(newPassword)

  return (
    <>
      <div className='modal-backdrop fade show' onClick={handleClose} style={{ zIndex: 1055 }} />

      <div className='modal fade show d-block' tabIndex={-1} style={{ zIndex: 1056 }}>
        <div className='modal-dialog modal-dialog-centered modal-md'>
          <div className='modal-content'>

            {/* Header */}
            <div className='modal-header py-5 px-7'>
              <h3 className='fw-bold m-0'>Account Settings</h3>
              <button type='button' className='btn btn-icon btn-sm btn-active-icon-primary' onClick={handleClose}>
                <i className='ki-duotone ki-cross fs-1'><span className='path1' /><span className='path2' /></i>
              </button>
            </div>

            {/* Tabs */}
            <div className='px-7 border-bottom'>
              <ul className='nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold'>
                <li className='nav-item'>
                  <a className={`nav-link text-active-primary py-5 me-6 ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
                    <i className='ki-duotone ki-profile-circle fs-4 me-2'>
                      <span className='path1' /><span className='path2' /><span className='path3' />
                    </i>
                    Profile
                  </a>
                </li>
                <li className='nav-item'>
                  <a className={`nav-link text-active-primary py-5 ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')} style={{ cursor: 'pointer' }}>
                    <i className='ki-duotone ki-lock-3 fs-4 me-2'>
                      <span className='path1' /><span className='path2' /><span className='path3' />
                    </i>
                    Password
                  </a>
                </li>
              </ul>
            </div>

            {/* Body */}
            <div className='modal-body py-7 px-7'>
              {loading ? (
                <div className='d-flex justify-content-center align-items-center py-15'>
                  <span className='spinner-border text-primary' style={{ width: 40, height: 40 }} />
                </div>
              ) : activeTab === 'profile' ? (
                <>
                  {/* Avatar */}
                  <div className='d-flex flex-column align-items-center mb-8'>
                    <div className='symbol symbol-100px symbol-circle position-relative mb-3'>
                      <img
                        src={avatarPreview || toAbsoluteUrl('media/avatars/blank.png')}
                        alt='avatar'
                        className='w-100 h-100 object-fit-cover rounded-circle'
                        style={{ border: '3px solid #e9f3ff' }}
                      />
                      <label htmlFor='avatar-upload'
                        className='btn btn-icon btn-circle btn-primary btn-sm position-absolute'
                        style={{ bottom: 0, right: 0, width: 28, height: 28, cursor: 'pointer' }}>
                        <i className='ki-duotone ki-pencil fs-7'><span className='path1' /><span className='path2' /></i>
                      </label>
                      <input id='avatar-upload' ref={fileInputRef} type='file'
                        accept='image/*' className='d-none' onChange={handleAvatarChange} />
                    </div>
                    <span className='text-muted fs-7'>Click the pencil icon to change photo</span>
                  </div>

                  <div className='separator mb-7' />

                  <div className='row g-5'>
                    <div className='col-md-6 fv-row'>
                      <label className='required fw-semibold fs-6 mb-2'>First Name</label>
                      <input type='text' className='form-control form-control-solid'
                        placeholder='First name' value={userName}
                        onChange={(e) => setUserName(e.target.value)} />
                    </div>
                    <div className='col-md-6 fv-row'>
                      <label className='fw-semibold fs-6 mb-2'>Last Name</label>
                      <input type='text' className='form-control form-control-solid'
                        placeholder='Last name' value={userLastname}
                        onChange={(e) => setUserLastname(e.target.value)} />
                    </div>
                    <div className='col-12 fv-row'>
                      <label className='required fw-semibold fs-6 mb-2'>Email</label>
                      <input type='email' className='form-control form-control-solid'
                        placeholder='example@email.com' value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)} />
                    </div>
                    <div className='col-12 fv-row'>
                      <label className='fw-semibold fs-6 mb-2'>Phone Number</label>
                      <input type='tel' className='form-control form-control-solid'
                        placeholder='0XX-XXX-XXXX' value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='notice d-flex bg-light-warning rounded border-warning border border-dashed mb-7 p-6'>
                    <i className='ki-duotone ki-information fs-2tx text-warning me-4'>
                      <span className='path1' /><span className='path2' /><span className='path3' />
                    </i>
                    <div className='fs-6 text-gray-700'>
                      Choose a strong password. Minimum <strong>8 characters</strong> with uppercase and a number.
                    </div>
                  </div>

                  <PwdField
                    label='Current Password' value={currentPassword} required
                    onChange={(v) => { setCurrentPassword(v); setPwdErrors((e) => ({ ...e, currentPassword: undefined })) }}
                    show={showCurrent} onToggle={() => setShowCurrent((s) => !s)}
                    error={pwdErrors.currentPassword}
                  />

                  <div className='separator mb-6' />

                  <PwdField
                    label='New Password' value={newPassword} required
                    onChange={(v) => { setNewPassword(v); setPwdErrors((e) => ({ ...e, newPassword: undefined })) }}
                    show={showNew} onToggle={() => setShowNew((s) => !s)}
                    error={pwdErrors.newPassword}
                    hint={newPassword ? (
                      <div>
                        <div className='d-flex gap-1 mb-1'>
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className='flex-grow-1 rounded'
                              style={{ height: 4, background: i <= strength.level ? strength.color : '#e4e6ef', transition: 'background 0.3s' }} />
                          ))}
                        </div>
                        <span className='fs-8 fw-semibold' style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                    ) : null}
                  />

                  <PwdField
                    label='Confirm New Password' value={confirmPassword} required
                    onChange={(v) => { setConfirmPassword(v); setPwdErrors((e) => ({ ...e, confirmPassword: undefined })) }}
                    show={showConfirm} onToggle={() => setShowConfirm((s) => !s)}
                    error={pwdErrors.confirmPassword}
                    hint={confirmPassword && !pwdErrors.confirmPassword && newPassword === confirmPassword ? (
                      <span className='fs-8 fw-semibold text-success'>
                        <i className='ki-duotone ki-check fs-7 text-success me-1'><span className='path1' /><span className='path2' /></i>
                        Passwords match
                      </span>
                    ) : null}
                  />
                </>
              )}
            </div>

            {/* Footer */}
            <div className='modal-footer py-5 px-7'>
              <button type='button' className='btn btn-light me-3'
                onClick={handleClose} disabled={saving || savingPwd}>
                Cancel
              </button>
              {activeTab === 'profile' ? (
                <button type='button' className='btn btn-primary'
                  onClick={handleSaveProfile} disabled={saving || loading}>
                  {saving
                    ? <><span className='spinner-border spinner-border-sm align-middle me-2' />Saving...</>
                    : <><i className='ki-duotone ki-check fs-3 me-1'><span className='path1' /><span className='path2' /></i>Save Changes</>
                  }
                </button>
              ) : (
                <button type='button' className='btn btn-primary'
                  onClick={handleSavePassword} disabled={savingPwd}>
                  {savingPwd
                    ? <><span className='spinner-border spinner-border-sm align-middle me-2' />Updating...</>
                    : <><i className='ki-duotone ki-lock-3 fs-3 me-1'><span className='path1' /><span className='path2' /><span className='path3' /></i>Update Password</>
                  }
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export { EditProfileModal }