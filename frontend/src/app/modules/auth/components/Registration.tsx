import {useState, useEffect} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link, useNavigate} from 'react-router-dom'
import Swal from 'sweetalert2'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import {PasswordMeterComponent} from '../../../../_metronic/assets/ts/components'
import {createUserWithEmailAndPassword} from 'firebase/auth'
import {doc, setDoc, serverTimestamp} from 'firebase/firestore'
import {auth, db} from '../../../../../../firebase/useFirebase'

// ─── Initial Values ───────────────────────────────────────────────────────────
const initialValues = {
  firstname: '',
  lastname: '',
  email: '',
  phone_number: '',
  password: '',
  changepassword: '',
  acceptTerms: false,
}

// ─── Validation Schema ────────────────────────────────────────────────────────
const registrationSchema = Yup.object().shape({
  firstname: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('First name is required'),
  lastname: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Last name is required'),
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  phone_number: Yup.string()
    .min(8, 'Minimum 8 digits')
    .max(15, 'Maximum 15 digits')
    .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Minimum 8 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
  changepassword: Yup.string()
    .min(8, 'Minimum 8 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password')], "Password and Confirm Password didn't match"),
  acceptTerms: Yup.bool().oneOf([true], 'You must accept the terms and conditions'),
})

// ─── Registration Component ───────────────────────────────────────────────────
export function Registration() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      try {
        // Step 1: Create user in Firebase Authentication (email + password)
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        )
        const firebaseUser = userCredential.user

        // Step 2: Save user profile to Firestore → collection: USER
        await setDoc(doc(db, 'Users', firebaseUser.uid), {
          email: values.email,
          name: values.firstname,
          lastname: values.lastname,
          phone_number: values.phone_number,
          status: 'active',
          createdAt: serverTimestamp(),
        })

        // Step 3: Sign out immediately — prevent auto-login after register
        await auth.signOut()

        // Step 4: Show SweetAlert2 success popup
        await Swal.fire({
          icon: 'success',
          title: 'Create Account Success!',
          html: `
            <div style="color:#5e6278; font-size:14px; line-height:1.8">
              Your account has been created successfully.<br/>
              Please sign in to continue.
            </div>
          `,
          confirmButtonText: 'Go to Sign In',
          confirmButtonColor: '#009ef7',
          allowOutsideClick: false,
          customClass: {
            confirmButton: 'btn btn-primary px-10 py-3',
          },
          buttonsStyling: false,
        })

        // Step 5: Redirect to login page after user clicks "Go to Sign In"
        navigate('/auth/login')

      } catch (error: any) {
        console.error('Registration error:', error)

        // Firebase-specific error handling
        switch (error.code) {
          case 'auth/email-already-in-use':
            setStatus('This email address is already registered.')
            break
          case 'auth/weak-password':
            setStatus('Password is too weak. Please use at least 8 characters.')
            break
          case 'auth/invalid-email':
            setStatus('Invalid email address format.')
            break
          default:
            setStatus('Registration failed. Please check your details and try again.')
        }

        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    PasswordMeterComponent.bootstrap()
  }, [])

  return (
    <form
      className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
      noValidate
      id='kt_login_signup_form'
      onSubmit={formik.handleSubmit}
    >
      {/* ── Heading ─────────────────────────────────────────────────────────── */}
      <div className='text-center mb-11'>
        <h1 className='text-gray-900 fw-bolder mb-3'>Sign Up</h1>
        <div className='text-gray-500 fw-semibold fs-6'>Your Social Campaigns</div>
      </div>

      {/* ── Social Login Options ─────────────────────────────────────────────── */}
      <div className='row g-3 mb-9'>
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
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className='separator separator-content my-14'>
        <span className='w-125px text-gray-500 fw-semibold fs-7'>Or with email</span>
      </div>

      {/* ── Error Alert ─────────────────────────────────────────────────────── */}
      {formik.status && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{formik.status}</div>
        </div>
      )}

      {/* ── First Name ──────────────────────────────────────────────────────── */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>First name</label>
        <input
          placeholder='First name'
          type='text'
          autoComplete='off'
          {...formik.getFieldProps('firstname')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.firstname && formik.errors.firstname},
            {'is-valid': formik.touched.firstname && !formik.errors.firstname}
          )}
        />
        {formik.touched.firstname && formik.errors.firstname && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.firstname}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Last Name ───────────────────────────────────────────────────────── */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>Last name</label>
        <input
          placeholder='Last name'
          type='text'
          autoComplete='off'
          {...formik.getFieldProps('lastname')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.lastname && formik.errors.lastname},
            {'is-valid': formik.touched.lastname && !formik.errors.lastname}
          )}
        />
        {formik.touched.lastname && formik.errors.lastname && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.lastname}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Email ───────────────────────────────────────────────────────────── */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>Email</label>
        <input
          placeholder='Email'
          type='email'
          autoComplete='off'
          {...formik.getFieldProps('email')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.email && formik.errors.email},
            {'is-valid': formik.touched.email && !formik.errors.email}
          )}
        />
        {formik.touched.email && formik.errors.email && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.email}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Phone Number ────────────────────────────────────────────────────── */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>Phone Number</label>
        <input
          placeholder='e.g. +856 20 XXXX XXXX'
          type='tel'
          autoComplete='off'
          {...formik.getFieldProps('phone_number')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.phone_number && formik.errors.phone_number},
            {'is-valid': formik.touched.phone_number && !formik.errors.phone_number}
          )}
        />
        {formik.touched.phone_number && formik.errors.phone_number && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.phone_number}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Password ────────────────────────────────────────────────────────── */}
      <div className='fv-row mb-8' data-kt-password-meter='true'>
        <div className='mb-1'>
          <label className='form-label fw-bolder text-gray-900 fs-6'>Password</label>
          <div className='position-relative mb-3'>
            <input
              type='password'
              placeholder='Password'
              autoComplete='off'
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control bg-transparent',
                {'is-invalid': formik.touched.password && formik.errors.password},
                {'is-valid': formik.touched.password && !formik.errors.password}
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
          {/* Password Strength Meter */}
          <div
            className='d-flex align-items-center mb-3'
            data-kt-password-meter-control='highlight'
          >
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px'></div>
          </div>
        </div>
        <div className='text-muted'>
          Use 8 or more characters with a mix of letters, numbers & symbols.
        </div>
      </div>

      {/* ── Confirm Password ────────────────────────────────────────────────── */}
      <div className='fv-row mb-5'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>Confirm Password</label>
        <input
          type='password'
          placeholder='Password confirmation'
          autoComplete='off'
          {...formik.getFieldProps('changepassword')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.changepassword && formik.errors.changepassword},
            {'is-valid': formik.touched.changepassword && !formik.errors.changepassword}
          )}
        />
        {formik.touched.changepassword && formik.errors.changepassword && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.changepassword}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Accept Terms ────────────────────────────────────────────────────── */}
      <div className='fv-row mb-8'>
        <label className='form-check form-check-inline' htmlFor='kt_login_toc_agree'>
          <input
            className='form-check-input'
            type='checkbox'
            id='kt_login_toc_agree'
            {...formik.getFieldProps('acceptTerms')}
            checked={formik.values.acceptTerms}
          />
          <span className='fw-semibold fs-6 text-gray-700'>
            I Accept the{' '}
            <a
              href='https://keenthemes.com/metronic/?page=faq'
              target='_blank'
              rel='noopener noreferrer'
              className='ms-1 link-primary fw-bold'
            >
              Terms & Conditions
            </a>
          </span>
        </label>
        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.acceptTerms}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Submit / Cancel ─────────────────────────────────────────────────── */}
      <div className='text-center'>
        <button
          type='submit'
          id='kt_sign_up_submit'
          className='btn btn-lg btn-primary w-100 mb-5'
          disabled={formik.isSubmitting || !formik.isValid || !formik.values.acceptTerms}
        >
          {!loading ? (
            <span className='indicator-label'>
              <i className='ki-duotone ki-check fs-3 me-2'>
                <span className='path1'></span>
                <span className='path2'></span>
              </i>
              Create Account
            </span>
          ) : (
            <span className='indicator-progress' style={{display: 'block'}}>
              Please wait...{' '}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>

        <Link to='/auth/login'>
          <button
            type='button'
            id='kt_login_signup_form_cancel_button'
            className='btn btn-lg btn-light-primary w-100 mb-5'
          >
            <i className='ki-duotone ki-arrow-left fs-3 me-2'>
              <span className='path1'></span>
              <span className='path2'></span>
            </i>
            Already have an account? Sign In
          </button>
        </Link>
      </div>
    </form>
  )
}