import {useEffect, useState} from 'react'
import * as Yup from 'yup'
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
  },
]

const initialValues = {
  user_email: '',
  password: '',
}

// ─── Firebase Error Messages ──────────────────────────────────────────────────
const getFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':         return 'ບໍ່ມີບັນຊີອີ-ເມວນີ້'
    case 'auth/wrong-password':         return 'ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
    case 'auth/invalid-credential':     return 'ອີ-ເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
    case 'auth/invalid-email':          return 'ຮູບແບບອີ-ເມວ ບໍ່ຖືກຕ້ອງ'
    case 'auth/too-many-requests':      return 'ເຄື່ອງພະຍາຍາມຫຼາຍເກີນໄປ. ກະລຸນາລອງໃຫມ່ຕໍ່ມາ'
    case 'auth/network-request-failed': return 'ກວດສອບການເຊື່ອມຕໍ່ຂອງທ່ານ'
    case 'auth/user-disabled':          return 'ບັນຊີນີ້ຖືກປະຕິເສດການໃຊ້ງານ'
    default:                            return 'ລາຍລະອຽດການເຂົ້າສູ່ລະບົບບໍ່ຖືກຕ້ອງ'
  }
}

const FONT = "'Plus Jakarta Sans','Noto Sans Lao',sans-serif"

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

  const emailErr = !!(formik.touched.user_email && formik.errors.user_email)
  const passErr = !!((formik.touched.password && formik.errors.password) || formik.status)

  const inputStyle = (err: boolean): React.CSSProperties => ({
    width: '100%',
    height: 50,
    border: `1.5px solid ${err ? '#ef4444' : '#dde8e9'}`,
    borderRadius: 13,
    padding: '0 16px',
    fontSize: 15,
    fontFamily: FONT,
    color: '#0c2d34',
    background: '#fff',
    outline: 'none',
  })

  const cur = images[currentImageIndex]

  return (
    <>
      <link
        href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Lao:wght@400;500;600;700&display=swap'
        rel='stylesheet'
      />
      <style>{`
        #kt_login_signin_form .jv-input::placeholder{color:#9bb0b4}
        #kt_login_signin_form .jv-input:focus{border-color:#0891b2 !important;box-shadow:0 0 0 4px rgba(8,145,178,.13)}
        @media (max-width: 900px){ #jv-login-split{grid-template-columns:1fr !important} #jv-login-image{display:none !important} }
      `}</style>

      {/* ── Full-screen split layout ─────────────────────────────────────────── */}
      <div
        id='jv-login-split'
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '1.05fr .95fr',
          background: '#fff',
          fontFamily: FONT,
        }}
      >
        {/* LEFT: image panel */}
        <div
          id='jv-login-image'
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
          <div style={{position: 'relative', zIndex: 1, maxWidth: 440}}>
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
              🌊 ປະສົບການລ່ອງເຮືອ
            </div>
            <h2
              style={{
                color: '#fff',
                fontWeight: 800,
                fontSize: 34,
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
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', overflowY: 'auto'}}>
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
            onSubmit={formik.handleSubmit}
            noValidate
            id='kt_login_signin_form'
            style={{width: '100%', maxWidth: 380}}
          >
            {/* Brand + Heading */}
            <div style={{textAlign: 'center', marginBottom: 30}}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 17,
                  margin: '0 auto 18px',
                  background: 'linear-gradient(140deg,#0891b2,#06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 24,
                  boxShadow: '0 12px 26px rgba(8,145,178,.32)',
                }}
              >
                JV
              </div>
              <h1 style={{color: '#0c2d34', fontWeight: 800, fontSize: 28, margin: 0, letterSpacing: '-.01em'}}>
                ເຂົ້າສູ່ລະບົບ
              </h1>
              <div style={{color: '#5b7479', fontWeight: 500, fontSize: 14.5, marginTop: 7}}>
                ຍິນດີຕ້ອນຮັບກັບມາ — ເຂົ້າສູ່ລະບົບເພື່ອສືບຕໍ່
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

            {/* Email */}
            <div style={{marginBottom: 18}}>
              <label style={{display: 'block', fontWeight: 700, fontSize: 13.5, color: '#0c2d34', marginBottom: 8}}>
                ອີ-ເມວ
              </label>
              <input
                type='email'
                className='jv-input'
                placeholder='you@example.com'
                autoComplete='off'
                {...formik.getFieldProps('user_email')}
                style={inputStyle(emailErr)}
              />
              {emailErr && (
                <div style={{color: '#ef4444', fontSize: 12.5, fontWeight: 600, marginTop: 6}}>
                  {formik.errors.user_email}
                </div>
              )}
            </div>

            {/* Password */}
            <div style={{marginBottom: 14}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                <label style={{fontWeight: 700, fontSize: 13.5, color: '#0c2d34'}}>ລະຫັດຜ່ານ</label>
                {/* <Link to='/auth/forgot-password' style={{color: '#0891b2', fontWeight: 600, fontSize: 13, textDecoration: 'none'}}>
                  ລືມລະຫັດຜ່ານ?
                </Link> */}
              </div>
              <input
                type='password'
                className='jv-input'
                placeholder='••••••••'
                autoComplete='off'
                {...formik.getFieldProps('password')}
                style={inputStyle(passErr)}
              />
              {formik.touched.password && formik.errors.password && (
                <div style={{color: '#ef4444', fontSize: 12.5, fontWeight: 600, marginTop: 6}}>
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type='submit'
              id='kt_sign_in_submit'
              disabled={formik.isSubmitting || !formik.isValid}
              style={{
                width: '100%',
                height: 52,
                marginTop: 18,
                border: 'none',
                borderRadius: 14,
                background: 'linear-gradient(135deg,#0891b2,#06b6d4)',
                color: '#fff',
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 16,
                cursor: formik.isSubmitting || !formik.isValid ? 'not-allowed' : 'pointer',
                boxShadow: '0 14px 30px -8px rgba(8,145,178,.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                opacity: formik.isSubmitting || !formik.isValid ? 0.6 : 1,
                transition: 'opacity .2s ease',
              }}
            >
              {!loading ? (
                <>
                  ເຂົ້າສູ່ລະບົບ <span style={{fontSize: 18}}>→</span>
                </>
              ) : (
                <span style={{display: 'flex', alignItems: 'center', gap: 9}}>
                  ກະລຸນາລໍຖ້າ...
                  <span className='spinner-border spinner-border-sm align-middle'></span>
                </span>
              )}
            </button>

            {/* Register link */}
            <div style={{textAlign: 'center', color: '#5b7479', fontWeight: 500, fontSize: 14.5, marginTop: 26}}>
              ບໍ່ແມ່ນສະມາຊິກ?{' '}
              <Link to='/auth/registration' style={{color: '#0891b2', fontWeight: 700, textDecoration: 'none'}}>
                ສ້າງບັນຊີ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
