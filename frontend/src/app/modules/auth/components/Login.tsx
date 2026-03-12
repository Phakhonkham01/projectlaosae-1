import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useFormik} from 'formik'
import {Link} from 'react-router-dom'
import {signInWithEmailAndPassword} from 'firebase/auth'
import {doc, getDoc} from 'firebase/firestore'
import {auth, db} from '../../../../../../firebase/useFirebase'
import {useAuth} from '../core/Auth'
import {UserModel} from '../core/_models'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

// ─── Validation Schema ────────────────────────────────────────────────────────
const loginSchema = Yup.object().shape({
  user_email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .required('Password is required'),
})

const initialValues = {
  user_email: '',
  password: '',
}

// ─── Firebase Error Messages ──────────────────────────────────────────────────
const getFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':         return 'No account found with this email'
    case 'auth/wrong-password':         return 'Incorrect password'
    case 'auth/invalid-credential':     return 'Invalid email or password'
    case 'auth/invalid-email':          return 'Invalid email format'
    case 'auth/too-many-requests':      return 'Too many attempts. Please try again later'
    case 'auth/network-request-failed': return 'Network error. Check your connection'
    case 'auth/user-disabled':          return 'This account has been disabled'
    default:                            return 'The login details are incorrect'
  }
}

// ─── Login Component ──────────────────────────────────────────────────────────
export function Login() {
  const [loading, setLoading] = useState(false)
  const {saveAuth, setCurrentUser} = useAuth()

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
        type UserRole = 'owner' | 'admin' | 'employee' | 'CEO'
        let name = ''
        let lastname = ''
        let role: UserRole = 'employee'
        let phone_number = ''

        const userSnap = await getDoc(doc(db, 'Users', firebaseUser.uid))

        if (userSnap.exists()) {
          const d = userSnap.data()
          name         = d.name         ?? ''
          lastname     = d.lastname     ?? ''
          role         = (d.role as UserRole) ?? 'employee'
          phone_number = d.phone_number ?? ''
        } else {
          name = firebaseUser.email?.split('@')[0] ?? 'User'
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
        type AuthRole = 'CEO' | 'admin' | 'employee'
        const authRole = (role === 'owner' ? 'admin' : role) as AuthRole
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
    <form
      className='form w-100'
      onSubmit={formik.handleSubmit}
      noValidate
      id='kt_login_signin_form'
    >
      {/* ── Heading ─────────────────────────────────────────────────────────── */}
      <div className='text-center mb-11'>
        <h1 className='text-gray-900 fw-bolder mb-3'>Sign In</h1>
        {/* <div className='text-gray-500 fw-semibold fs-6'>Your Social Campaigns</div> */}
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
        <span className='w-125px text-gray-500 fw-semibold fs-7'>Or with email</span>
      </div>

      {/* ── Error Alert ─────────────────────────────────────────────────────── */}
      {formik.status && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text fw-bold'>{formik.status}</div>
        </div>
      )}

      {/* ── Email ───────────────────────────────────────────────────────────── */}
      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-gray-900'>Email</label>
        <input
          type='email'
          placeholder='Email'
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
          <label className='form-label fw-bolder text-gray-900 fs-6 mb-0'>Password</label>
          {/* Forgot password link — uncomment if needed */}
          {/* <Link to='/auth/forgot-password' className='link-primary fs-6 fw-bolder'>
            Forgot Password?
          </Link> */}
        </div>
        <input
          type='password'
          placeholder='Password'
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
              Sign In
            </span>
          ) : (
            <span className='indicator-progress' style={{display: 'block'}}>
              Please wait...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>

      {/* ── Register Link ────────────────────────────────────────────────────── */}
      <div className='text-gray-500 text-center fw-semibold fs-6'>
        Not a Member yet?{' '}
        <Link to='/auth/registration' className='link-primary fw-bold'>
          Create an Account
        </Link>
      </div>
    </form>
  )
}