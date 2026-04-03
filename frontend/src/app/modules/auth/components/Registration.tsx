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
    .min(3, 'ຕໍາ່ສຸດ 3 ຕົວອັກສອນ')
    .max(50, 'ບໍ່ເກີນ 50 ຕົວອັກສອນ')
    .required('ຊື່ ແມ່ນບໍ່ສາມາດປ່ອຍໄວ້ໄດ້'),
  lastname: Yup.string()
    .min(3, 'ຕໍາ່ສຸດ 3 ຕົວອັກສອນ')
    .max(50, 'ບໍ່ເກີນ 50 ຕົວອັກສອນ')
    .required('ນາມສະກຸນ ແມ່ນບໍ່ສາມາດປ່ອຍໄວ້ໄດ້'),
  email: Yup.string()
    .email('ຮູບແບບອີເມວ ບໍ່ຖືກຕ້ອງ')
    .min(3, 'ຕໍາ່ສຸດ 3 ຕົວອັກສອນ')
    .max(50, 'ບໍ່ເກີນ 50 ຕົວອັກສອນ')
    .required('ອີເມວ ແມ່ນບໍ່ສາມາດປ່ອຍໄວ້ໄດ້'),
  phone_number: Yup.string()
    .min(8, 'ຕໍາ່ສຸດ 8 ຕົວເລກ')
    .max(15, 'ບໍ່ເກີນ 15 ຕົວເລກ')
    .matches(/^[0-9+\-\s()]+$/, 'ຮູບແບບເບີໂທ ບໍ່ຖືກຕ້ອງ')
    .required('ເບີໂທ ແມ່ນບໍ່ສາມາດປ່ອຍໄວ້ໄດ້'),
  password: Yup.string()
    .min(8, 'ຕໍາ່ສຸດ 8 ຕົວອັກສອນ')
    .max(50, 'ບໍ່ເກີນ 50 ຕົວອັກສອນ')
    .required('ລະຫັດຜ່ານ ແມ່ນບໍ່ສາມາດປ່ອຍໄວ້ໄດ້'),
  changepassword: Yup.string()
    .min(8, 'ຕໍາ່ສຸດ 8 ຕົວອັກສອນ')
    .max(50, 'ບໍ່ເກີນ 50 ຕົວອັກສອນ')
    .required('ຢືນຢັນລະຫັດຜ່ານ ແມ່ນບໍ່ສາມາດປ່ອຍໄວ້ໄດ້')
    .oneOf([Yup.ref('password')], 'ລະຫັດຜ່ານ ແລະ ຢືນຢັນລະຫັດຜ່ານ ບໍ່ກົງກັນ'),
  acceptTerms: Yup.bool().oneOf([true], 'ທ່ານຕ້ອງຍອມຮັບ ເງື່ອນໄຂ ແລະ ເຄື່ອງ'),
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
  },
]

// ─── Registration Component ───────────────────────────────────────────────────
export function Registration() {
  const [loading, setLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
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
          status: 'Active',
          role: 'customer',
          createdAt: serverTimestamp(),
        })

        // Step 3: Sign out immediately — prevent auto-login after register
        await auth.signOut()

        // Step 4: Show SweetAlert2 success popup
        await Swal.fire({
          icon: 'success',
          title: 'ສ້າງບັນຊີ ສຳເລັດ!',
          html: `
            <div style="color:#5e6278; font-size:14px; line-height:1.8">
              ບັນຊີຂອງທ່ານ ໄດ້ຖືກສ້າງຂຶ້ນ ສຳເລັດແລ້ວ.<br/>
              ກະລຸນາ ເຂົ້າສູ່ລະບົບ ເພື່ອ ດຳເນີນການຕໍ່
            </div>
          `,
          confirmButtonText: 'ໄປ ເຂົ້າສູ່ລະບົບ',
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
            setStatus('ທີ່ຢູ່ອີເມວ ນີ້ ໄດ້ລົງທະບຽນແລ້ວ.')
            break
          case 'auth/weak-password':
            setStatus('ລະຫັດຜ່ານ ຂ້ອນຂ້າງອ່ອນແອ. ກະລຸນາ ໃຊ້ ຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ.')
            break
          case 'auth/invalid-email':
            setStatus('ຮູບແບບທີ່ຢູ່ອີເມວ ບໍ່ຖືກຕ້ອງ.')
            break
          default:
            setStatus('ການລົງທະບຽນ ບໍ່ສຳເລັດ. ກະລຸນາ ກວດສອບ ລາຍລະອຽດ ແລະ ລອງໃໝ່.')
        }

        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    PasswordMeterComponent.bootstrap()
  }, [])

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
        className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
        noValidate
        id='kt_login_signup_form'
        onSubmit={formik.handleSubmit}
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
        <h1 className='text-gray-900 fw-bolder mb-3'>ລົງທະບຽນ</h1>
        <div className='text-gray-500 fw-semibold fs-6'>ລະບົບ ຜູ້ໃຊ້ຂອງທ່ານ</div>
      </div>

      {/* ── Social Login Options ─────────────────────────────────────────────── */}
      <div className='row g-3 mb-9'>
        {/* <div className='col-md-6'>
          <a
            href='#'
            className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
          >
            <img
              alt='Google'
              src={toAbsoluteUrl('media/svg/brand-logos/google-icon.svg')}
              className='h-15px me-3'
            />
            ເຂົ້າສູ່ລະບົບ ໂດຍໃຊ້ Google
          </a>
        </div> */}
        {/* <div className='col-md-6'>
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
            ເຂົ້າສູ່ລະບົບ ໂດຍໃຊ້ Apple
          </a>
        </div> */}
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      {/* <div className='separator separator-content my-14'>
        <span className='w-125px text-gray-500 fw-semibold fs-7'>ຫຼື ໂດຍໃຊ້ອີເມວ</span>
      </div> */}

      {/* ── Error Alert ─────────────────────────────────────────────────────── */}
      {formik.status && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{formik.status}</div>
        </div>
      )}

      {/* ── First Name ──────────────────────────────────────────────────────── */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>ຊື່</label>
        <input
          placeholder='ຊື່'
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
        <label className='form-label fw-bolder text-gray-900 fs-6'>ນາມສະກຸນ</label>
        <input
          placeholder='ນາມສະກຸນ'
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
        <label className='form-label fw-bolder text-gray-900 fs-6'>ອີເມວ</label>
        <input
          placeholder='ອີເມວ'
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
        <label className='form-label fw-bolder text-gray-900 fs-6'>ເບີໂທ</label>
        <input
          placeholder='ຕົວຢ່າງ: +856 20 XXXX XXXX'
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
          <label className='form-label fw-bolder text-gray-900 fs-6'>ລະຫັດຜ່ານ</label>
          <div className='position-relative mb-3'>
            <input
              type='password'
              placeholder='ລະຫັດຜ່ານ'
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
          ໃຊ້ 8 ຕົວອັກສອນ ຫຼື ຫຼາຍກວ່າ ທີ່ລວມເອົາ ຕົວອັກษອ, ຕົວເລກ ແລະ ສັນຍາລັກ.
        </div>
      </div>

      {/* ── Confirm Password ────────────────────────────────────────────────── */}
      <div className='fv-row mb-5'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>ຢືນຢັນລະຫັດຜ່ານ</label>
        <input
          type='password'
          placeholder='ຢືນຢັນລະຫັດຜ່ານ'
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
            ຂ້າພະເຈົ້າ ຍອມຮັບ{' '}
            <a
              href='https://keenthemes.com/metronic/?page=faq'
              target='_blank'
              rel='noopener noreferrer'
              className='ms-1 link-primary fw-bold'
            >
              ເງື່ອນໄຂທັງໝົດ
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
              ສ້າງບັນຊີ
            </span>
          ) : (
            <span className='indicator-progress' style={{display: 'block'}}>
              ກະລຸນາ ລໍຖ້າ...{' '}
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
            ທ່ານ ມີບັນຊີ ແລ້ວ? ເຂົ້າສູ່ລະບົບ
          </button>
        </Link>
      </div>
      </form>
    </>
  )
}
