import { useState } from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import { useFormik } from 'formik'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../../../../../firebase/useFirebase'
import { useAuth } from '../core/Auth'
import { UserModel } from '../core/_models'

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
  password:   '',
}

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

export function Login() {
  const [loading, setLoading] = useState(false)
  const { saveAuth, setCurrentUser } = useAuth()

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true)

      try {
        // ✅ Step 1: Firebase Auth — sign in
        const userCredential = await signInWithEmailAndPassword(
          auth,
          values.user_email,
          values.password
        )
        const firebaseUser = userCredential.user
        console.log('✅ Firebase Auth OK — uid:', firebaseUser.uid)

        // ✅ Step 2: Get Firestore doc — ถ้าไม่มีก็ใช้ข้อมูลจาก Auth แทน
        // ✅ ตรงกับ UserModel: "owner" | "admin" | "employee" | "CEO"
        type UserRole = 'owner' | 'admin' | 'employee' | 'CEO'

        let name         = ''
        let lastname     = ''
        let role: UserRole = 'employee'   // ← default fallback
        let phone_number = ''

        const userSnap = await getDoc(doc(db, 'Users', firebaseUser.uid))
        console.log('📄 Firestore doc exists:', userSnap.exists())

        if (userSnap.exists()) {
          // ✅ มี doc — ใช้ข้อมูลจาก Firestore
          const d   = userSnap.data()
          name         = d.name          ?? ''
          lastname     = d.lastname      ?? ''
          role         = (d.role as UserRole) ?? 'employee'
          phone_number = d.phone_number  ?? ''
          console.log('✅ Firestore data:', d)
        } else {
          // ⚠️ ไม่มี doc — fallback ใช้ข้อมูลจาก Firebase Auth
          console.warn('⚠️ No Firestore doc found — using Auth data only')
          name = firebaseUser.email?.split('@')[0] ?? 'User'
        }

        // ✅ Step 3: Build UserModel
        const user: UserModel = {
          _id:           firebaseUser.uid,
          user_name:     `${name} ${lastname}`.trim(),
          user_email:    firebaseUser.email ?? values.user_email,
          role:          role,
          department_id: '',
          leave_days:    0,
        }

        // ✅ Step 4: Build authData
        // AuthModel.role = "CEO" | "admin" | "employee"  (ไม่มี "owner")
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

        // ✅ Step 5: Save
        saveAuth(authData)
        localStorage.setItem('user', JSON.stringify(user))
        setCurrentUser(user)
        console.log('✅ Login complete! Role:', role)

      } catch (error: any) {
        // ✅ เฉพาะ Firebase Auth error จริงๆ เท่านั้น
        console.error('❌ Login error:', error)
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

      {/* Logo */}
      <div className='row g-3 mb-9'>
        <img src='media/logos/sys.png' alt='logo' className='h-100%' />
      </div>

      {/* Error alert */}
      {formik.status && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text fw-bold'>{formik.status}</div>
        </div>
      )}

      {/* Email */}
      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-gray-900'>Email</label>
        <input
          type='email'
          placeholder='Email'
          autoComplete='off'
          {...formik.getFieldProps('user_email')}
          className={clsx(
            'form-control bg-transparent',
            { 'is-invalid': formik.touched.user_email && formik.errors.user_email },
            { 'is-valid':   formik.touched.user_email && !formik.errors.user_email },
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

      {/* Password */}
      <div className='fv-row mb-3'>
        <label className='form-label fw-bolder text-gray-900 fs-6 mb-0'>Password</label>
        <input
          type='password'
          placeholder='Password'
          autoComplete='off'
          {...formik.getFieldProps('password')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': (formik.touched.password && formik.errors.password) || formik.status,
              'is-valid':    formik.touched.password && !formik.errors.password && !formik.status,
            }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className='invalid-feedback'>{formik.errors.password}</div>
        )}
        {formik.status && !formik.errors.password && (
          <div className='invalid-feedback'>{formik.status}</div>
        )}
      </div>

      {/* Spacer */}
      <div className='d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8'>
        <div />
      </div>

      {/* Submit */}
      <div className='d-grid mb-10'>
        <button
          type='submit'
          id='kt_sign_in_submit'
          className='btn btn-primary'
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {!loading && <span className='indicator-label'>Login</span>}
          {loading && (
            <span className='indicator-progress' style={{ display: 'block' }}>
              Please wait...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>

    </form>
  )
}