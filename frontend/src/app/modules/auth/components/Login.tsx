import {useEffect, useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useFormik} from 'formik'
import {Link} from 'react-router-dom'
import {signInWithEmailAndPassword, signOut} from 'firebase/auth'
import {doc, getDoc} from 'firebase/firestore'
import {auth, db} from '../../../../../../firebase/useFirebase'
import {useAuth} from '../core/Auth'
import {UserModel} from '../core/_models'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

// ─── Validation Schema ────────────────────────────────────────────────────────
const loginSchema = Yup.object().shape({
  user_email: Yup.string()
    .email('ຮູບແບບອີ-ເມວ ບໍ່ຖືກຕ້ອງ')
    .min(3, 'ຕໍ່າສຸດ 3 ສັນຍາລັກ')
    .max(50, 'ສູງສຸດ 50 ສັນຍາລັກ')
    .required('ອີ-ເມວ ແມ່ນບໍ່ສາມາດປະຫຍາດໄດ້'),
  password: Yup.string()
    .min(3, 'ຕໍ່າສຸດ 3 ສັນຍາລັກ')
    .required('ລະຫັດຜ່ານ ແມ່ນບໍ່ສາມາດປະຫຍາດໄດ້'),
})
  const images = [

    {
      url: 'media/logos/1.jpg',
      title: 'ວິວທິວທັດສວຍງາມ',
      description: 'ດື່ມດ່ຳກັບບັນຍາກາດລິມນ້ຳ ແລະ ການເດີນທາງທີ່ນຸ່ມນວນ',
    },
    {
      url: 'media/logos/5.jpg',
      title: 'ບໍລິການລະດັບພຣີເມຍມ',
      description: 'ທີມງານດູແລໃສ່ໃຈທຸກລາຍລະອຽດ ຕັ້ງແຕ່ການຈອງຈົນຈົບທຣິບ',
    }
  ]

const initialValues = {
  user_email: '',
  password: '',
}

// ─── Firebase Error Messages ──────────────────────────────────────────────────
const getFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':         return 'ບໍ່ມີບັນຊີທີ່ພົບວ່າມີອີ-ເມວນີ້'
    case 'auth/wrong-password':         return 'ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
    case 'auth/invalid-credential':     return 'ອີ-ເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
    case 'auth/invalid-email':          return 'ຮູບແບບອີ-ເມວ ບໍ່ຖືກຕ້ອງ'
    case 'auth/too-many-requests':      return 'ເຄື່ອງພະຍາຍາມຫຼາຍເກີນໄປ. ກະລຸນາລອງໃຫມ່ຕໍ່ມາ'
    case 'auth/network-request-failed': return 'ຜໍ້າວເຄືອຂ່າຍ. ກວດສອບການເຊື່ອມຕໍ່ຂອງທ່ານ'
    case 'auth/user-disabled':          return 'ບັນຊີນີ້ຖືກປະຕິເສດໃຊ້'
    default:                            return 'ລາຍລະອຽດການເຂົ້າສູ່ລະບົບບໍ່ຖືກຕ້ອງ'
  }
}

// ─── Login Component ──────────────────────────────────────────────────────────
export function Login() {
  const [loading, setLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const {saveAuth, setCurrentUser} = useAuth()

  useEffect(() => {
    const root = document.getElementById('root')
    const previousRootBackground = root?.style.background
    const previousBodyBackground = document.body.style.background
    const previousHtmlBackground = document.documentElement.style.background

    if (root) {
      root.style.background = 'transparent'
    }
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'

    return () => {
      if (root) {
        root.style.background = previousRootBackground || ''
      }
      document.body.style.background = previousBodyBackground || ''
      document.documentElement.style.background = previousHtmlBackground || ''
    }
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [])

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      try {
        // Step 1: Firebase Auth — sign in
        const userCredential = await signInWithEmailAndPassword(
          auth,
          values.user_email,
          values.password
        )
        const firebaseUser = userCredential.user

        // Step 2: Get Firestore doc
        type UserRole = 'owner' | 'admin' | 'employee' | 'user' | 'customer'
        let name = ''
        let lastname = ''
        let role: UserRole = 'employee'
        let phone_number = ''

        const userSnap = await getDoc(doc(db, 'Users', firebaseUser.uid))

        let status = 'Active'
        if (userSnap.exists()) {
          const d = userSnap.data()
          name         = d.name         ?? ''
          lastname     = d.lastname     ?? ''
          role         = (d.role as UserRole) ?? 'employee'
          phone_number = d.phone_number ?? ''
          status       = (d.status as string) ?? 'Active'
        } else {
          name = firebaseUser.email?.split('@')[0] ?? 'user' 
        }

        if (status.toLowerCase().trim() === 'inactive') {
          await signOut(auth)
          saveAuth(undefined)
          localStorage.removeItem('user')
          setStatus('ບັນຊີນີ້ຖືກປິດໃຊ້. ບໍ່ສາມາດເຂົ້າສູ່ລະບົບໄດ້.')
          setSubmitting(false)
          setLoading(false)
          return
        }

        // Step 3: Build UserModel
        const user: UserModel = {
          _id:           firebaseUser.uid,
          user_name:     `${name} ${lastname}`.trim(),
          user_email:    firebaseUser.email ?? values.user_email,
          role:          role,
          department_id: '',
          leave_days:    0,
        }

        // Step 4: Build authData
        const authRole = role
        const authData = {
          token:         await firebaseUser.getIdToken(),
          _id:           firebaseUser.uid,
          user_name:     user.user_name,
          user_email:    user.user_email,
          role:          authRole,
          department_id: '',
          leave_days:    0,
        }

        // Step 5: Save
        saveAuth(authData)
        localStorage.setItem('user', JSON.stringify(user))
        setCurrentUser(user)

      } catch (error: any) {
        saveAuth(undefined)
        localStorage.removeItem('user')
        setStatus(getFirebaseError(error.code ?? ''))
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {images.map((image, index) => (
          <div
            key={image.url}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${toAbsoluteUrl(image.url)}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentImageIndex === index ? 1 : 0,
              transform: 'scale(1.02)',
              filter: 'saturate(1.02) contrast(1.02)',
              transition: 'opacity 1.2s ease-in-out',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(8,26,53,0.28) 0%, rgba(15,79,200,0.12) 50%, rgba(8,26,53,0.18) 100%)',
          }}
        />
      </div>

      <form
        className='form w-100'
        onSubmit={formik.handleSubmit}
        noValidate
        id='kt_login_signin_form'
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255,255,255,0.36)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.28)',
          borderRadius: '28px',
          padding: '2.5rem',
          boxShadow: '0 24px 60px rgba(8,26,53,0.18)',
        }}
      >
      {/* ── Heading ─────────────────────────────────────────────────────────── */}
      <div className='text-center mb-11'>
        <h1 className='text-gray-900 fw-bolder mb-3'>ເຂົ້າສູ່ລະບົບ</h1>
        {/* <div className='text-gray-500 fw-semibold fs-6'>ລະບາຍສາຍໂຄງການສາທາລະນະສຸກ</div> */}
      </div>

      {/* ── Social Login Options ─────────────────────────────────────────────── */}
      {/* <div className='row g-3 mb-9'>
        <div className='col-md-6'>
          <a
            href='#'
            className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
          >
            <img
              alt='Google'
              src={toAbsoluteUrl('media/svg/brand-logos/google-icon.svg')}
              className='h-15px me-3'
            />
            Sign in with Google
          </a>
        </div>
        <div className='col-md-6'>
          <a
            href='#'
            className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
          >
            <img
              alt='Apple'
              src={toAbsoluteUrl('media/svg/brand-logos/apple-black.svg')}
              className='theme-light-show h-15px me-3'
            />
            <img
              alt='Apple'
              src={toAbsoluteUrl('media/svg/brand-logos/apple-black-dark.svg')}
              className='theme-dark-show h-15px me-3'
            />
            Sign in with Apple
          </a>
        </div>
      </div> */}

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className='separator separator-content my-14'>
        <span className='w-125px text-gray-500 fw-semibold fs-7'>ຫຼື ໂດຍອີ-ເມວ</span>
      </div>

      {/* ── Error Alert ─────────────────────────────────────────────────────── */}
      {formik.status && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text fw-bold'>{formik.status}</div>
        </div>
      )}

      {/* ── Email ───────────────────────────────────────────────────────────── */}
      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-gray-900'>ອີ-ເມວ</label>
        <input
          type='email'
          placeholder='ອີ-ເມວ'
          autoComplete='off'
          {...formik.getFieldProps('user_email')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.user_email && formik.errors.user_email},
            {'is-valid': formik.touched.user_email && !formik.errors.user_email}
          )}
        />
        {formik.touched.user_email && formik.errors.user_email && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.user_email}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Password ────────────────────────────────────────────────────────── */}
      <div className='fv-row mb-3'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <label className='form-label fw-bolder text-gray-900 fs-6 mb-0'>ລະຫັດຜ່ານ</label>
          {/* Forgot password link — uncomment if needed */}
          {/* <Link to='/auth/forgot-password' className='link-primary fs-6 fw-bolder'>
            ລືມລະຫັດຜ່ານ?
          </Link> */}
        </div>
        <input
          type='password'
          placeholder='ລະຫັດຜ່ານ'
          autoComplete='off'
          {...formik.getFieldProps('password')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid':
                (formik.touched.password && formik.errors.password) || !!formik.status,
            },
            {
              'is-valid':
                formik.touched.password && !formik.errors.password && !formik.status,
            }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.password}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Spacer ──────────────────────────────────────────────────────────── */}
      <div className='d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8'>
        <div />
      </div>

      {/* ── Submit Button ────────────────────────────────────────────────────── */}
      <div className='d-grid mb-10'>
        <button
          type='submit'
          id='kt_sign_in_submit'
          className='btn btn-primary'
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {!loading ? (
            <span className='indicator-label'>
              <i className='ki-duotone ki-entrance-right fs-3 me-2'>
                <span className='path1'></span>
                <span className='path2'></span>
              </i>
              ເຂົ້າສູ່ລະບົບ
            </span>
          ) : (
            <span className='indicator-progress' style={{display: 'block'}}>
              ກະລຸນາລໍຖ້າ...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>

      {/* ── Register Link ────────────────────────────────────────────────────── */}
      <div className='text-gray-500 text-center fw-semibold fs-6'>
        ບໍ່ແມ່ນສະມາຊິກ?{' '}
        <Link to='/auth/registration' className='link-primary fw-bold'>
          ສ້າງບັນຊີ
        </Link>
      </div>
      </form>
    </>
  )
}
