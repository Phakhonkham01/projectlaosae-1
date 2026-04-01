import { FC, useState, useRef, useEffect } from 'react'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { db, storage, auth } from '../../../../../../../firebase/useFirebase'
import { KTIcon } from '../../../../../_metronic/helpers'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileData {
  _id: string
  name: string
  lastname: string
  email: string
  phone_number: string
  role: string
  status: string
  image_url: string
  createdAt?: string
}

type EditableField = 'name' | 'lastname' | 'phone_number' | null

// ─── Inline editable field component ─────────────────────────────────────────
interface InlineFieldProps {
  label: string
  value: string
  fieldKey: EditableField
  activeEdit: EditableField
  saving: string | null
  placeholder?: string
  validate?: (v: string) => string | null
  onEdit: (f: EditableField) => void
  onSave: (f: NonNullable<EditableField>, v: string) => Promise<void>
  onCancel: () => void
}

const InlineField: FC<InlineFieldProps> = ({
  label, value, fieldKey, activeEdit, saving, placeholder,
  validate, onEdit, onSave, onCancel,
}) => {
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isEditing = activeEdit === fieldKey
  const isSaving = saving === fieldKey

  useEffect(() => {
    if (isEditing) {
      setDraft(value)
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isEditing, value])

  const handleSave = async () => {
    if (validate) {
      const err = validate(draft)
      if (err) { setError(err); return }
    }
    await onSave(fieldKey!, draft)
  }

  return (
    <div className='mb-6'>
      <label className='fw-bold fs-7 text-muted text-uppercase mb-2 d-block'>{label}</label>
      {isEditing ? (
        <div>
          <div className='input-group'>
            <input
              ref={inputRef}
              type='text'
              className={`form-control form-control-solid${error ? ' is-invalid' : ''}`}
              value={draft}
              placeholder={placeholder}
              onChange={(e) => { setDraft(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
              disabled={isSaving}
            />
            {/* ✓ Save */}
            <button
              type='button'
              className='btn btn-success px-3'
              onClick={handleSave}
              disabled={isSaving}
              title='ບັນທຶກ'
            >
              {isSaving
                ? <span className='spinner-border spinner-border-sm' />
                : <KTIcon iconName='check' className='fs-4 m-0' />}
            </button>
            {/* ✕ Cancel */}
            <button
              type='button'
              className='btn btn-light px-3'
              onClick={onCancel}
              disabled={isSaving}
              title='ຍົກເລີກ'
            >
              <KTIcon iconName='cross' className='fs-4 m-0' />
            </button>
          </div>
          {error && <div className='text-danger fs-8 mt-1'>{error}</div>}
        </div>
      ) : (
        <div className='d-flex align-items-center gap-3'>
          <div
            className='form-control form-control-solid bg-light-secondary text-gray-800 flex-grow-1'
            style={{ cursor: 'default', userSelect: 'text' }}
          >
            {value || <span className='text-muted'>—</span>}
          </div>
          <button
            type='button'
            className='btn btn-sm btn-icon btn-light-primary flex-shrink-0'
            onClick={() => onEdit(fieldKey)}
            title='ແກ້ໄຂ'
          >
            <KTIcon iconName='pencil' className='fs-5' />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Password input with show/hide toggle ─────────────────────────────────────
interface PwInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  error?: string
}
const PwInput: FC<PwInputProps> = ({ label, value, onChange, placeholder, required, error }) => {
  const [show, setShow] = useState(false)
  return (
    <div className='mb-5'>
      <label className={`fw-bold fs-7 text-muted text-uppercase mb-2 d-block${required ? ' required' : ''}`}>{label}</label>
      <div className='input-group'>
        <input
          type={show ? 'text' : 'password'}
          className={`form-control form-control-solid${error ? ' is-invalid' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || '••••••••'}
        />
        <button
          type='button'
          className='btn btn-light btn-icon'
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          title={show ? 'ຊ່ອນລະຫັດ' : 'ສະແດງລະຫັດ'}
        >
          <KTIcon iconName={show ? 'eye-slash' : 'eye'} className='fs-4' />
        </button>
      </div>
      {error && <div className='text-danger fs-8 mt-1'>{error}</div>}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
const MyProfileCard: FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeEdit, setActiveEdit] = useState<EditableField>(null)
  const [savingField, setSavingField] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageSaving, setImageSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password section
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwErrors, setPwErrors] = useState<{ old?: string; new?: string; confirm?: string }>({})

  // ── Load profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const raw = localStorage.getItem('user')
        if (!raw) { setLoading(false); return }
        const local = JSON.parse(raw) as { _id?: string; user_name?: string; user_email?: string; role?: string }
        if (!local._id) { setLoading(false); return }

        const snap = await getDoc(doc(db, 'Users', local._id))
        if (snap.exists()) {
          const data = { _id: snap.id, ...snap.data() } as ProfileData
          setProfile(data)
          setImagePreview(data.image_url || '')
        } else {
          const parts = (local.user_name || '').split(' ')
          setProfile({
            _id: local._id,
            name: parts[0] || '',
            lastname: parts.slice(1).join(' ') || '',
            email: local.user_email || '',
            phone_number: '',
            role: local.role || 'customer',
            status: 'Active',
            image_url: '',
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Save single field ───────────────────────────────────────────────────────
  const saveField = async (field: NonNullable<EditableField>, value: string) => {
    if (!profile?._id) return
    setSavingField(field)
    try {
      const payload = { [field]: value, updatedAt: new Date().toISOString() }
      await updateDoc(doc(db, 'Users', profile._id), payload)
      setProfile((p) => p ? { ...p, [field]: value } : p)
      const raw = localStorage.getItem('user')
      if (raw) localStorage.setItem('user', JSON.stringify({ ...JSON.parse(raw), [field]: value }))
      setActiveEdit(null)
      Swal.fire({ icon: 'success', title: 'ບັນທຶກສຳເລັດ', timer: 1200, showConfirmButton: false })
    } catch {
      Swal.fire({ icon: 'error', title: 'ຜິດພາດ', text: 'ບໍ່ສາມາດບັນທຶກໄດ້' })
    } finally {
      setSavingField(null)
    }
  }

  // ── Save avatar ─────────────────────────────────────────────────────────────
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?._id) return
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'warning', title: 'ກະລຸນາເລືອກໄຟລ໌ຮູບ', timer: 1500, showConfirmButton: false })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'ຮູບຕ້ອງນ້ອຍກວ່າ 5MB', timer: 1500, showConfirmButton: false })
      return
    }
    setImagePreview(URL.createObjectURL(file))
    setImageFile(file)
    setImageSaving(true)
    try {
      const storageRef = ref(storage, `users/${profile._id}/profile_${Date.now()}`)
      const snap = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snap.ref)
      await updateDoc(doc(db, 'Users', profile._id), { image_url: url, updatedAt: new Date().toISOString() })
      setProfile((p) => p ? { ...p, image_url: url } : p)
      setImagePreview(url)
      setImageFile(null)
      Swal.fire({ icon: 'success', title: 'ອັບເດດຮູບສຳເລັດ', timer: 1500, showConfirmButton: false })
    } catch {
      Swal.fire({ icon: 'error', title: 'ອັບໂຫຼດຮູບຜິດພາດ' })
      setImagePreview(profile.image_url || '')
    } finally {
      setImageSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    const errs: typeof pwErrors = {}
    if (!pwForm.old) errs.old = 'ກະລຸນາໃສ່ລະຫັດຜ່ານເກົ່າ'
    if (pwForm.new.length < 6) errs.new = 'ລະຫັດໃໝ່ຕ້ອງຢ່າງໜ້ອຍ 6 ຕົວ'
    if (pwForm.new !== pwForm.confirm) errs.confirm = 'ລະຫັດຜ່ານທັງສອງບໍ່ຕົງກັນ'
    setPwErrors(errs)
    if (Object.keys(errs).length > 0) return

    const user = auth.currentUser
    if (!user || !user.email) {
      Swal.fire({ icon: 'error', title: 'ຜິດພາດ', text: 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່' })
      return
    }

    setPwSaving(true)
    try {
      // 1) Re-authenticate with old password
      const credential = EmailAuthProvider.credential(user.email, pwForm.old)
      await reauthenticateWithCredential(user, credential)

      // 2) Update password
      await updatePassword(user, pwForm.new)

      Swal.fire({
        icon: 'success',
        title: '<span style="color:#10b981;font-weight:bold;">ປ່ຽນລະຫັດສຳເລັດ</span>',
        text: 'ລະຫັດຜ່ານຂອງທ່ານຖືກປ່ຽນແລ້ວ',
        timer: 2000,
        showConfirmButton: false,
      })
      setPwForm({ old: '', new: '', confirm: '' })
      setPwErrors({})
    } catch (err: any) {
      const code = err?.code || ''
      let msg = 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່'
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        msg = 'ລະຫັດຜ່ານເກົ່າບໍ່ຖືກຕ້ອງ'
        setPwErrors((e) => ({ ...e, old: msg }))
      } else if (code === 'auth/too-many-requests') {
        msg = 'ພະຍາຍາມຫຼາຍຄັ້ງເກີນໄປ ກະລຸນາລອງໃໝ່ພາຍຫຼັງ'
      } else if (code === 'auth/requires-recent-login') {
        msg = 'ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່ແລ້ວລອງອີກຄັ້ງ'
      } else if (code === 'auth/weak-password') {
        msg = 'ລະຫັດຜ່ານໃໝ່ອ່ອນແອເກີນໄປ'
        setPwErrors((e) => ({ ...e, new: msg }))
      }
      Swal.fire({ icon: 'error', title: 'ປ່ຽນລະຫັດຜ່ານລົ້ມເຫຼວ', text: msg })
    } finally {
      setPwSaving(false)
    }
  }

  const roleLabel = (r: string) => ({ owner: 'ເຈົ້າຂອງ', employee: 'ພະນັກງານ', customer: 'ລູກຄ້າ' }[r] || r)
  const statusColor = (s: string) => s === 'Active' ? 'badge-light-success' : s === 'Inactive' ? 'badge-light-danger' : 'badge-light-warning'

  if (loading) return (
    <div className='d-flex justify-content-center align-items-center' style={{ minHeight: 300 }}>
      <span className='spinner-border text-primary' />
    </div>
  )

  if (!profile) return (
    <div className='card'>
      <div className='card-body text-center py-15 text-muted'>
        <KTIcon iconName='user' className='fs-3x mb-3 d-block text-gray-400' />
        ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້
      </div>
    </div>
  )

  const initials = `${profile.name?.charAt(0) ?? ''}${profile.lastname?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <div className='row g-6'>

      {/* ── Left column: avatar + summary ── */}
      <div className='col-xl-4'>
        <div className='card h-100'>
          <div className='card-body d-flex flex-column align-items-center py-10 px-6'>

            {/* Avatar */}
            <div className='position-relative mb-5'>
              {imageSaving && (
                <div
                  className='position-absolute rounded-circle d-flex align-items-center justify-content-center'
                  style={{ inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 5, borderRadius: '50%' }}
                >
                  <span className='spinner-border text-white' />
                </div>
              )}
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt='avatar'
                  className='rounded-circle shadow'
                  style={{ width: 120, height: 120, objectFit: 'cover', border: '4px solid #e2e8f0' }}
                />
              ) : (
                <div
                  className='rounded-circle d-flex align-items-center justify-content-center bg-primary shadow'
                  style={{ width: 120, height: 120, fontSize: 36, color: '#fff', fontWeight: 800 }}
                >
                  {initials || '?'}
                </div>
              )}

              {/* Camera button */}
              <button
                type='button'
                className='btn btn-icon btn-sm btn-primary position-absolute bottom-0 end-0 shadow-sm'
                style={{ width: 32, height: 32, borderRadius: '50%' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={imageSaving}
                title='ປ່ຽນຮູບໂປຣໄຟລ໌'
              >
                <KTIcon iconName='camera' className='fs-6' />
              </button>
              <input ref={fileInputRef} type='file' accept='image/*' className='d-none' onChange={handleImageChange} />
            </div>

            <h4 className='fw-bolder fs-3 mb-1'>{profile.name} {profile.lastname}</h4>
            <div className='text-muted fs-7 mb-4'>{profile.email}</div>
            <div className='d-flex gap-3 flex-wrap justify-content-center mb-6'>
              <span className='badge badge-light-primary fw-bold px-4 py-2'>{roleLabel(profile.role)}</span>
              <span className={`badge fw-bold px-4 py-2 ${statusColor(profile.status)}`}>{profile.status}</span>
            </div>

            <div className='separator separator-dashed w-100 my-4' />
            <div className='w-100'>
              {[
                { icon: 'phone', label: 'ເບີໂທ', value: profile.phone_number || '—' },
                { icon: 'sms', label: 'ອີເມລ', value: profile.email },
                { icon: 'calendar', label: 'ສ້າງບັນຊີ', value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('lo-LA') : '—' },
              ].map(({ icon, label, value }) => (
                <div key={label} className='d-flex align-items-center py-3 border-bottom border-gray-200'>
                  <span className='symbol symbol-35px symbol-light-primary me-3'>
                    <span className='symbol-label'>
                      <KTIcon iconName={icon} className='fs-4 text-primary' />
                    </span>
                  </span>
                  <div>
                    <div className='text-muted fs-8'>{label}</div>
                    <div className='fw-semibold fs-7'>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column ── */}
      <div className='col-xl-8 d-flex flex-column gap-6'>

        {/* ── Card 1: Basic info ── */}
        <div className='card'>
          <div className='card-header border-0 pt-6'>
            <h5 className='card-title align-items-start flex-column'>
              <span className='card-label fw-bolder fs-5'>
                <KTIcon iconName='user-edit' className='fs-4 me-2 text-primary' />
                ຂໍ້ມູນສ່ວນຕົວ
              </span>
              <span className='text-muted fw-semibold fs-8 mt-1'>ກົດ ✏️ ເພື່ອແກ້ໄຂສະເພາະ field ທີ່ຕ້ອງການ</span>
            </h5>
          </div>
          <div className='card-body pt-2'>
            <div className='row g-0'>
              <div className='col-md-6 pe-md-6'>
                <InlineField
                  label='ຊື່'
                  value={profile.name}
                  fieldKey='name'
                  activeEdit={activeEdit}
                  saving={savingField}
                  placeholder='ຊື່'
                  validate={(v) => v.trim().length < 2 ? 'ຕ້ອງຢ່າງໜ້ອຍ 2 ຕົວ' : null}
                  onEdit={setActiveEdit}
                  onSave={saveField}
                  onCancel={() => setActiveEdit(null)}
                />
              </div>
              <div className='col-md-6 ps-md-6'>
                <InlineField
                  label='ນາມສະກຸນ'
                  value={profile.lastname}
                  fieldKey='lastname'
                  activeEdit={activeEdit}
                  saving={savingField}
                  placeholder='ນາມສະກຸນ'
                  validate={(v) => v.trim().length < 2 ? 'ຕ້ອງຢ່າງໜ້ອຍ 2 ຕົວ' : null}
                  onEdit={setActiveEdit}
                  onSave={saveField}
                  onCancel={() => setActiveEdit(null)}
                />
              </div>
              <div className='col-md-6 pe-md-6'>
                <InlineField
                  label='ເບີໂທ'
                  value={profile.phone_number}
                  fieldKey='phone_number'
                  activeEdit={activeEdit}
                  saving={savingField}
                  placeholder='020xxxxxxxx'
                  validate={(v) => v && !/^[0-9+\-\s()]*$/.test(v) ? 'ເບີໂທບໍ່ຖືກຕ້ອງ' : null}
                  onEdit={setActiveEdit}
                  onSave={saveField}
                  onCancel={() => setActiveEdit(null)}
                />
              </div>
              <div className='col-md-6 ps-md-6'>
                {/* Email read-only */}
                <div className='mb-6'>
                  <label className='fw-bold fs-7 text-muted text-uppercase mb-2 d-block'>ອີເມລ</label>
                  <div className='d-flex align-items-center gap-3'>
                    <div className='form-control form-control-solid bg-light-secondary text-gray-600 flex-grow-1'>
                      {profile.email}
                    </div>
                    <span className='badge badge-light fs-8 flex-shrink-0'>ຄົງທີ່</span>
                  </div>
                  <div className='text-muted fs-8 mt-1'>ອີເມລບໍ່ສາມາດປ່ຽນໄດ້</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 2: Change password ── */}
        <div className='card'>
          <div className='card-header border-0 pt-6'>
            <h5 className='card-title'>
              <KTIcon iconName='lock' className='fs-4 me-2 text-primary' />
              ປ່ຽນລະຫັດຜ່ານ
            </h5>
          </div>
          <div className='card-body pt-2'>
            <div className='row g-0'>
              <div className='col-12 col-md-8'>
                <PwInput
                  label='ລະຫັດຜ່ານເກົ່າ'
                  value={pwForm.old}
                  onChange={(v) => { setPwForm((p) => ({ ...p, old: v })); setPwErrors((e) => ({ ...e, old: undefined })) }}
                  required
                  error={pwErrors.old}
                />
                <PwInput
                  label='ລະຫັດຜ່ານໃໝ່'
                  value={pwForm.new}
                  onChange={(v) => { setPwForm((p) => ({ ...p, new: v })); setPwErrors((e) => ({ ...e, new: undefined })) }}
                  required
                  error={pwErrors.new}
                />
                <PwInput
                  label='ຢືນຢັນລະຫັດໃໝ່'
                  value={pwForm.confirm}
                  onChange={(v) => { setPwForm((p) => ({ ...p, confirm: v })); setPwErrors((e) => ({ ...e, confirm: undefined })) }}
                  required
                  error={pwErrors.confirm}
                />
              </div>
            </div>
            <div className='d-flex gap-3 mt-2'>
              <button
                type='button'
                className='btn btn-light btn-sm'
                onClick={() => { setPwForm({ old: '', new: '', confirm: '' }); setPwErrors({}) }}
                disabled={pwSaving}
              >
                ລ້າງ
              </button>
              <button
                type='button'
                className='btn btn-primary btn-sm'
                onClick={handleChangePassword}
                disabled={pwSaving || !pwForm.old || !pwForm.new || !pwForm.confirm}
              >
                {pwSaving ? (
                  <><span className='spinner-border spinner-border-sm me-2' />ກຳລັງດຳເນີນ...</>
                ) : (
                  <><KTIcon iconName='lock' className='fs-5 me-1' />ປ່ຽນລະຫັດ</>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export { MyProfileCard }
