import {useState, useEffect} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
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
  acceptTerms: Yup.bool().oneOf([true], 'ທ່ານຕ້ອງຍອມຮັບ ເງື່ອນໄຂ'),
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

const FONT = "'Plus Jakarta Sans','Noto Sans Lao',sans-serif"

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

        // Step 2: Save user profile to Firestore → collection: users
        await setDoc(doc(db, 'users', firebaseUser.uid), {
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
          confirmButtonColor: '#0891b2',
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

  const err = (field: keyof typeof initialValues) =>
    !!((formik.touched as any)[field] && (formik.errors as any)[field])

  const inputStyle = (field: keyof typeof initialValues): React.CSSProperties => ({
    width: '100%',
    height: 48,
    border: `1.5px solid ${err(field) ? '#ef4444' : '#dde8e9'}`,
    borderRadius: 12,
    padding: '0 15px',
    fontSize: 14.5,
    fontFamily: FONT,
    color: '#0c2d34',
    background: '#fff',
    outline: 'none',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 700,
    fontSize: 13,
    color: '#0c2d34',
    marginBottom: 7,
  }

  const errText: React.CSSProperties = {color: '#ef4444', fontSize: 12, fontWeight: 600, marginTop: 5}

  const cur = images[currentImageIndex]

  return (
    <>
      <link
        href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Lao:wght@400;500;600;700&display=swap'
        rel='stylesheet'
      />
      <style>{`
        #kt_login_signup_form .jv-input::placeholder{color:#9bb0b4}
        #kt_login_signup_form .jv-input:focus{border-color:#0891b2 !important;box-shadow:0 0 0 4px rgba(8,145,178,.13)}
        @media (max-width: 1000px){ #jv-reg-split{grid-template-columns:1fr !important} #jv-reg-image{display:none !important} }
      `}</style>

      {/* ── Full-screen split layout ─────────────────────────────────────────── */}
      <div
        id='jv-reg-split'
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '.85fr 1.15fr',
          background: '#fff',
          fontFamily: FONT,
        }}
      >
        {/* LEFT: image panel */}
        <div
          id='jv-reg-image'
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 48,
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
                transform: 'scale(1.03)',
                transition: 'opacity 1.2s ease-in-out',
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(160deg, rgba(6,82,95,0.55) 0%, rgba(8,145,178,0.32) 50%, rgba(7,49,58,0.78) 100%)',
            }}
          />

          {/* brand */}
          <div style={{position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 13}}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: 'rgba(255,255,255,.18)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              JV
            </div>
            <div>
              <div style={{color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2}}>JoVa ທະເລລາວ</div>
              <div
                style={{
                  color: '#cdeef2',
                  fontSize: 11,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Cruise &amp; Dining
              </div>
            </div>
          </div>

          {/* headline overlay */}
          <div style={{position: 'relative', zIndex: 1, maxWidth: 380}}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: 'rgba(255,255,255,.16)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,.25)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: '.05em',
                padding: '6px 13px',
                borderRadius: 999,
                marginBottom: 18,
              }}
            >
              🌊 ເລີ່ມການເດີນທາງກັບເຮົາ
            </div>
            <h2
              style={{
                color: '#fff',
                fontWeight: 800,
                fontSize: 32,
                lineHeight: 1.3,
                margin: '0 0 12px',
                letterSpacing: '-.01em',
              }}
            >
              {cur.title}
            </h2>
            <p style={{color: '#dbeff2', fontSize: 15, lineHeight: 1.6, margin: 0}}>{cur.description}</p>
            <div style={{display: 'flex', gap: 8, marginTop: 24}}>
              {images.map((_, index) => (
                <span
                  key={index}
                  style={{
                    height: 6,
                    width: currentImageIndex === index ? 26 : 8,
                    borderRadius: 999,
                    background: currentImageIndex === index ? '#fff' : 'rgba(255,255,255,.45)',
                    transition: 'width .3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: form */}
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', overflowY: 'auto'}}>
          {/* back to home */}
          <Link
            to='/'
            style={{
              position: 'absolute',
              top: 22,
              left: 24,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              border: '1.5px solid #dde8e9',
              background: '#fff',
              color: '#0e7490',
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 13.5,
              padding: '9px 16px',
              borderRadius: 11,
              textDecoration: 'none',
            }}
          >
            ← ກັບໜ້າຫຼັກ
          </Link>
          <form
            className='fv-plugins-bootstrap5 fv-plugins-framework'
            noValidate
            id='kt_login_signup_form'
            onSubmit={formik.handleSubmit}
            style={{width: '100%', maxWidth: 520}}
          >
            {/* Heading */}
            <div style={{marginBottom: 26}}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  marginBottom: 16,
                  background: 'linear-gradient(140deg,#0891b2,#06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 22,
                  boxShadow: '0 12px 26px rgba(8,145,178,.32)',
                }}
              >
                JV
              </div>
              <h1 style={{color: '#0c2d34', fontWeight: 800, fontSize: 28, margin: 0, letterSpacing: '-.01em'}}>
                ສ້າງບັນຊີ
              </h1>
              <div style={{color: '#5b7479', fontWeight: 500, fontSize: 14.5, marginTop: 6}}>
                ລົງທະບຽນເພື່ອເລີ່ມຈອງເຮືອ ແລະ ສັ່ງອາຫານ
              </div>
            </div>

            {/* Error Alert */}
            {formik.status && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                {formik.status}
              </div>
            )}

            {/* Section: personal info */}
            <div style={{fontWeight: 700, color: '#0e7490', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14}}>
              ຂໍ້ມູນສ່ວນຕົວ
            </div>

            {/* firstname + lastname */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16}}>
              <div>
                <label style={labelStyle}>ຊື່</label>
                <input
                  className='jv-input'
                  placeholder='ຊື່'
                  type='text'
                  autoComplete='off'
                  {...formik.getFieldProps('firstname')}
                  style={inputStyle('firstname')}
                />
                {err('firstname') && <div style={errText}>{formik.errors.firstname}</div>}
              </div>
              <div>
                <label style={labelStyle}>ນາມສະກຸນ</label>
                <input
                  className='jv-input'
                  placeholder='ນາມສະກຸນ'
                  type='text'
                  autoComplete='off'
                  {...formik.getFieldProps('lastname')}
                  style={inputStyle('lastname')}
                />
                {err('lastname') && <div style={errText}>{formik.errors.lastname}</div>}
              </div>
            </div>

            {/* email */}
            <div style={{marginBottom: 16}}>
              <label style={labelStyle}>ອີເມວ</label>
              <input
                className='jv-input'
                placeholder='you@example.com'
                type='email'
                autoComplete='off'
                {...formik.getFieldProps('email')}
                style={inputStyle('email')}
              />
              {err('email') && <div style={errText}>{formik.errors.email}</div>}
            </div>

            {/* phone */}
            <div style={{marginBottom: 24}}>
              <label style={labelStyle}>ເບີໂທ</label>
              <input
                className='jv-input'
                placeholder='ຕົວຢ່າງ: +856 20 XXXX XXXX'
                type='tel'
                autoComplete='off'
                {...formik.getFieldProps('phone_number')}
                style={inputStyle('phone_number')}
              />
              {err('phone_number') && <div style={errText}>{formik.errors.phone_number}</div>}
            </div>

            {/* Section: security */}
            <div style={{fontWeight: 700, color: '#0e7490', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14}}>
              ຄວາມປອດໄພ
            </div>

            {/* password + meter */}
            <div style={{marginBottom: 16}} data-kt-password-meter='true'>
              <label style={labelStyle}>ລະຫັດຜ່ານ</label>
              <input
                type='password'
                className='jv-input'
                placeholder='ລະຫັດຜ່ານ'
                autoComplete='off'
                {...formik.getFieldProps('password')}
                style={inputStyle('password')}
              />
              {err('password') && <div style={errText}>{formik.errors.password}</div>}

              <div className='d-flex align-items-center mt-3 mb-2' data-kt-password-meter-control='highlight'>
                <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px'></div>
              </div>
              <div style={{color: '#8a9ea2', fontSize: 12.5}}>
                ໃຊ້ຢ່າງນ້ອຍ 8 ຕົວອັກສອນ ໂດຍມີທັງຕົວອັກສອນ ແລະ ຕົວເລກ
              </div>
            </div>

            {/* confirm password */}
            <div style={{marginBottom: 20}}>
              <label style={labelStyle}>ຢືນຢັນລະຫັດຜ່ານ</label>
              <input
                type='password'
                className='jv-input'
                placeholder='ຢືນຢັນລະຫັດຜ່ານ'
                autoComplete='off'
                {...formik.getFieldProps('changepassword')}
                style={inputStyle('changepassword')}
              />
              {err('changepassword') && <div style={errText}>{formik.errors.changepassword}</div>}
            </div>

            {/* terms */}
            <div style={{marginBottom: 22}}>
              <label htmlFor='kt_login_toc_agree' style={{display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer'}}>
                <input
                  className='form-check-input'
                  type='checkbox'
                  id='kt_login_toc_agree'
                  {...formik.getFieldProps('acceptTerms')}
                  checked={formik.values.acceptTerms}
                  style={{width: 18, height: 18, marginTop: 2, accentColor: '#0891b2', flexShrink: 0}}
                />
                <span style={{fontWeight: 500, fontSize: 13.5, color: '#5b7479', lineHeight: 1.5}}>
                  ຂ້ອຍຍອມຮັບ{' '}
                  <a
                    href='https://keenthemes.com/metronic/?page=faq'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{color: '#0891b2', fontWeight: 700, textDecoration: 'none'}}
                  >
                    ເງື່ອນໄຂ ແລະ ຂໍ້ກຳນົດ
                  </a>
                </span>
              </label>
              {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                <div style={errText}>{formik.errors.acceptTerms}</div>
              )}
            </div>

            {/* submit */}
            <button
              type='submit'
              id='kt_sign_up_submit'
              disabled={formik.isSubmitting || !formik.isValid || !formik.values.acceptTerms}
              style={{
                width: '100%',
                height: 52,
                border: 'none',
                borderRadius: 14,
                background: 'linear-gradient(135deg,#0891b2,#06b6d4)',
                color: '#fff',
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 16,
                cursor:
                  formik.isSubmitting || !formik.isValid || !formik.values.acceptTerms
                    ? 'not-allowed'
                    : 'pointer',
                boxShadow: '0 14px 30px -8px rgba(8,145,178,.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                opacity:
                  formik.isSubmitting || !formik.isValid || !formik.values.acceptTerms ? 0.6 : 1,
                transition: 'opacity .2s ease',
                marginBottom: 14,
              }}
            >
              {!loading ? (
                <>ສ້າງບັນຊີ</>
              ) : (
                <span style={{display: 'flex', alignItems: 'center', gap: 9}}>
                  ກະລຸນາລໍຖ້າ...
                  <span className='spinner-border spinner-border-sm align-middle'></span>
                </span>
              )}
            </button>

            {/* back to login */}
            <Link
              to='/auth/login'
              id='kt_login_signup_form_cancel_button'
              style={{
                width: '100%',
                height: 50,
                border: '1.5px solid #b6e4e6',
                borderRadius: 14,
                background: '#fff',
                color: '#0e7490',
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              ← ມີບັນຊີແລ້ວ? ເຂົ້າສູ່ລະບົບ
            </Link>
          </form>
        </div>
      </div>
    </>
  )
}
