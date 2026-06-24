import {useEffect, useState, CSSProperties} from 'react'
import {useNavigate} from 'react-router-dom'
import Swal from 'sweetalert2'
import {useAuth} from '../../auth/core/Auth'
import {getUsers} from '../addFood/users-list/core/_requests'
import {getShips} from '../create-ships/users-list/core/ship_requests'

/* ============================================================
   Theme tokens — Ocean Blue (cyan / seafoam) + White
   ============================================================ */
const C = {
  ink: '#0c2d34',
  body: '#4a6b72',
  muted: '#5b7479',
  teal: '#0891b2',
  tealDark: '#0e7490',
  seafoam: '#cffafe',
  seafoamBorder: '#e8f4f5',
  bg: '#f5fafb',
  white: '#ffffff',
  accent: '#f59e0b',
  accentGrad: 'linear-gradient(135deg,#f59e0b,#f97316)',
  deep: '#07313a',
}

const FONT = "'Plus Jakarta Sans','Noto Sans Lao',sans-serif"

const placeholder: CSSProperties = {
  background:
    'repeating-linear-gradient(135deg,#d9f1f2,#d9f1f2 12px,#c9e9eb 12px,#c9e9eb 24px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

/* ============================================================
   Feature card
   ============================================================ */
const FeatureCard = ({icon, title, desc}: {icon: string; title: string; desc: string}) => (
  <div
    style={{
      background: C.white,
      border: `1px solid ${C.seafoamBorder}`,
      borderRadius: 20,
      padding: '28px 24px',
      boxShadow: '0 10px 30px -22px rgba(6,80,90,.5)',
    }}
  >
    <div
      style={{
        width: 54,
        height: 54,
        borderRadius: 15,
        background: C.seafoam,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 25,
        marginBottom: 16,
      }}
    >
      {icon}
    </div>
    <h3 style={{fontWeight: 700, fontSize: 17, color: C.ink, margin: '0 0 7px'}}>{title}</h3>
    <p style={{fontSize: 14, color: C.muted, lineHeight: 1.55, margin: 0}}>{desc}</p>
  </div>
)

const SectionHead = ({
  eyebrow,
  title,
  desc,
  center,
}: {
  eyebrow: string
  title: string
  desc: string
  center?: boolean
}) => (
  <div style={{maxWidth: center ? 620 : 560, margin: center ? '0 auto 44px' : '0 0 36px', textAlign: center ? 'center' : 'left'}}>
    <span
      style={{
        color: C.teal,
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
      }}
    >
      {eyebrow}
    </span>
    <h2 style={{fontSize: 36, fontWeight: 800, color: C.ink, margin: '10px 0 10px', letterSpacing: '-.01em'}}>
      {title}
    </h2>
    <p style={{fontSize: 16, color: C.muted, margin: 0}}>{desc}</p>
  </div>
)

const btnPrimary: CSSProperties = {
  fontFamily: FONT,
  cursor: 'pointer',
  border: 'none',
  background: C.accentGrad,
  color: '#3a1d00',
  fontWeight: 800,
  fontSize: 16,
  padding: '16px 30px',
  borderRadius: 14,
  boxShadow: '0 12px 26px rgba(245,158,11,.36)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 9,
}

const btnOutline: CSSProperties = {
  fontFamily: FONT,
  cursor: 'pointer',
  border: '1.5px solid #9bd9dd',
  background: C.white,
  color: C.tealDark,
  fontWeight: 700,
  fontSize: 16,
  padding: '16px 28px',
  borderRadius: 14,
}

/* ============================================================
   Landing page
   ============================================================ */
const LandingPageShipsFoodsPage = () => {
  const navigate = useNavigate()
  const {auth, currentUser} = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [ships, setShips] = useState<any[]>([])
  const [foods, setFoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const shipsData = await getShips()
        const productsResponse = await getUsers('')

        setShips(shipsData.slice(0, 6))
        setFoods(productsResponse.data?.slice(0, 6) || [])
      } catch (error) {
        console.error('Error fetching landing page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const images = [
    {
      url: 'media/logos/1.jpg',
      title: 'ເຮືອທ່ອງທ່ຽວຫຼູຫຼາ',
      description: 'ປະສົບການທ່ອງທ່ຽວທີ່ສະດວກ ສະອາດ ແລະ ບໍລິການແບບມືອາຊີບ',
    },
    {
      url: 'media/logos/2.jpg',
      title: 'ວິວທິວທັດສວຍງາມ',
      description: 'ດື່ມດ່ຳກັບບັນຍາກາດລິມນ້ຳ ແລະ ການເດີນທາງທີ່ນຸ່ມນວນ',
    },
    {
      url: 'media/logos/3.jpg',
      title: 'ບໍລິການລະດັບພຣີເມຍມ',
      description: 'ທີມງານດູແລໃສ່ໃຈທຸກລາຍລະອຽດ ຕັ້ງແຕ່ການຈອງຈົນຈົບທຣິບ',
    },
    {
      url: 'media/logos/4.jpg',
      title: 'ເມນູອາຫານຄັດສັນ',
      description: 'ອາຫານທ້ອງຖິ່ນ ແລະ ຊີຟູ້ດພ້ອມສຳລັບການສັ່ງຄວບຄູ່ການເດີນທາງ',
    },
  ]

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [images.length])

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length)
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))

  const handleBookingClick = async (type: 'ship' | 'food') => {
    if (!auth || !auth.token || !currentUser) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'ເຂົ້າສູ່ລະບົບກ່ອນ',
        text: 'ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອດຳເນີນການຈອງ',
        showCancelButton: true,
        confirmButtonText: 'ເຂົ້າສູ່ລະບົບ',
        cancelButtonText: 'ຍົກເລີກ',
      })

      if (result.isConfirmed) {
        navigate('/auth/login', {state: {returnTo: `/apps/booking-management/booking-${type}s`}})
      }
      return
    }

    if (type === 'ship') {
      navigate('/apps/booking-management/booking-ships/booking-ships')
      return
    }

    navigate('/apps/booking-management/booking-foods')
  }

  const isLoggedIn = !!(auth?.token && currentUser)
  const heroStats = [
    {value: '50+', label: 'ເຮືອທ່ອງທ່ຽວ'},
    {value: '200+', label: 'ເມນູອາຫານ'},
    {value: '5,000+', label: 'ລູກຄ້າພໍໃຈ'},
  ]
  const platformStats = [
    {num: '50+', label: 'ເຮືອທ່ອງທ່ຽວ'},
    {num: '200+', label: 'ເມນູອາຫານ'},
    {num: '5,000+', label: 'ລູກຄ້າພໍໃຈ'},
    {num: '10+', label: 'ປີໃຫ້ບໍລິການ'},
  ]
  const cur = images[currentImageIndex]
  const container: CSSProperties = {maxWidth: 1200, margin: '0 auto', padding: '0 32px'}

  return (
    <div style={{fontFamily: FONT, color: C.ink, background: C.bg, width: '100%', lineHeight: 1.6}}>
      <link
        href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Lao:wght@400;500;600;700&display=swap'
        rel='stylesheet'
      />

      {/* NAV */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,.86)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e4f0f1',
        }}
      >
        <div
          style={{
            ...container,
            padding: '14px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <a href='/' style={{display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none'}}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: 'linear-gradient(140deg,#0891b2,#06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 6px 16px rgba(8,145,178,.28)',
              }}
            >
              <img src='media/logos/sys.jpeg' alt='Logo' style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <div>
              <div style={{fontWeight: 700, fontSize: 17, color: C.ink, lineHeight: 1.2}}>JoVa ທະເລລາວ</div>
              <div style={{fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5b9aa3', fontWeight: 600}}>
                Cruise &amp; Dining
              </div>
            </div>
          </a>

          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => handleBookingClick('food')}
                  style={{
                    fontFamily: FONT,
                    cursor: 'pointer',
                    border: '1.5px solid #b6e4e6',
                    background: C.white,
                    color: C.tealDark,
                    fontWeight: 600,
                    fontSize: 14,
                    padding: '10px 20px',
                    borderRadius: 11,
                  }}
                >
                  ຈອງອາຫານ
                </button>
                <button
                  onClick={() => handleBookingClick('ship')}
                  style={{
                    fontFamily: FONT,
                    cursor: 'pointer',
                    border: 'none',
                    background: C.teal,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    padding: '11px 22px',
                    borderRadius: 11,
                    boxShadow: '0 6px 16px rgba(8,145,178,.25)',
                  }}
                >
                  ຈອງເຮືອ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth/login')}
                  style={{
                    fontFamily: FONT,
                    cursor: 'pointer',
                    border: '1.5px solid #b6e4e6',
                    background: C.white,
                    color: C.tealDark,
                    fontWeight: 600,
                    fontSize: 14,
                    padding: '10px 20px',
                    borderRadius: 11,
                  }}
                >
                  ເຂົ້າສູ່ລະບົບ
                </button>
                <button
                  onClick={() => navigate('/auth/registration')}
                  style={{
                    fontFamily: FONT,
                    cursor: 'pointer',
                    border: 'none',
                    background: C.teal,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    padding: '11px 22px',
                    borderRadius: 11,
                    boxShadow: '0 6px 16px rgba(8,145,178,.25)',
                  }}
                >
                  ສະໝັກໃຊ້
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(1200px 500px at 78% -10%,#d6f5f6 0%,rgba(214,245,246,0) 60%),linear-gradient(180deg,#eefafb 0%,#f5fafb 100%)',
        }}
      >
        <div
          style={{
            ...container,
            padding: '76px 32px 88px',
            display: 'grid',
            gridTemplateColumns: '1.05fr .95fr',
            gap: 56,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: C.seafoam,
                color: C.tealDark,
                fontWeight: 700,
                fontSize: 12.5,
                letterSpacing: '.06em',
                padding: '7px 14px',
                borderRadius: 999,
                textTransform: 'uppercase',
              }}
            >
              🌊 JoVa Cruise Collection
            </div>

            <h1
              style={{
                fontSize: 'clamp(40px,5vw,66px)',
                lineHeight: 1.18,
                fontWeight: 800,
                letterSpacing: '-.01em',
                margin: '22px 0 18px',
                color: C.ink,
              }}
            >
              ທ່ອງທ່ຽວ
              <br />
              <span
                style={{
                  background: 'linear-gradient(120deg,#0891b2,#06b6d4 60%,#22d3ee)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                ທະເລລາວ
              </span>
            </h1>

            <p style={{fontSize: 17.5, color: C.body, maxWidth: 480, margin: '0 0 30px'}}>
              ພົບກັບປະສົບການລ່ອງເຮືອ ແລະ ການຮັບປະທານອາຫານໃນບັນຍາກາດທີ່ສະອາດ, ທັນສະໄໝ ແລະ ເປັນມືອາຊີບ
              ດ້ວຍທີມງານທີ່ພ້ອມດູແລທຸກລາຍລະອຽດ.
            </p>

            {isLoggedIn ? (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 42}}>
                <button onClick={() => handleBookingClick('ship')} style={btnPrimary}>
                  ຈອງເຮືອຕອນນີ້ <span style={{fontSize: 18}}>→</span>
                </button>
                <button onClick={() => handleBookingClick('food')} style={btnOutline}>
                  ສັ່ງອາຫານ
                </button>
              </div>
            ) : (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 42}}>
                <button onClick={() => navigate('/auth/login')} style={btnPrimary}>
                  ເຂົ້າສູ່ລະບົບ <span style={{fontSize: 18}}>→</span>
                </button>
                <button onClick={() => navigate('/auth/registration')} style={btnOutline}>
                  ສ້າງບັນຊີ
                </button>
              </div>
            )}

            <div style={{display: 'flex', gap: 30}}>
              {heroStats.map((item) => (
                <div key={item.label}>
                  <div style={{fontSize: 30, fontWeight: 800, color: C.teal, lineHeight: 1}}>{item.value}</div>
                  <div style={{fontSize: 13.5, color: C.muted, fontWeight: 500, marginTop: 4}}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* featured card */}
          <div
            style={{
              background: C.white,
              borderRadius: 26,
              padding: 18,
              boxShadow: '0 30px 70px -28px rgba(6,80,90,.45)',
              border: `1px solid ${C.seafoamBorder}`,
            }}
          >
            <div style={{position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: '4 / 3'}}>
              {images.map((image, index) => (
                <img
                  key={image.url}
                  src={image.url}
                  alt={image.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: currentImageIndex === index ? 1 : 0,
                    transition: 'opacity .6s ease',
                  }}
                />
              ))}

              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  background: 'rgba(255,255,255,.92)',
                  color: C.tealDark,
                  fontWeight: 700,
                  fontSize: 11.5,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  borderRadius: 999,
                }}
              >
                Featured
              </div>

              <button
                onClick={prevImage}
                aria-label='Previous'
                style={{
                  cursor: 'pointer',
                  position: 'absolute',
                  top: '50%',
                  left: 12,
                  transform: 'translateY(-50%)',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255,255,255,.9)',
                  color: C.tealDark,
                  fontSize: 20,
                  lineHeight: 1,
                  boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                }}
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                aria-label='Next'
                style={{
                  cursor: 'pointer',
                  position: 'absolute',
                  top: '50%',
                  right: 12,
                  transform: 'translateY(-50%)',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255,255,255,.9)',
                  color: C.tealDark,
                  fontSize: 20,
                  lineHeight: 1,
                  boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                }}
              >
                ›
              </button>

              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '22px 18px 16px',
                  background: 'linear-gradient(transparent,rgba(7,49,58,.82))',
                  color: '#fff',
                }}
              >
                <div style={{fontWeight: 700, fontSize: 18}}>{cur.title}</div>
                <div style={{fontSize: 13.5, color: '#d7f0f2', marginTop: 3, lineHeight: 1.45}}>{cur.description}</div>
              </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', gap: 7, margin: '14px 0 6px'}}>
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Slide ${index + 1}`}
                  style={{
                    cursor: 'pointer',
                    border: 'none',
                    padding: 0,
                    height: 8,
                    width: currentImageIndex === index ? 24 : 8,
                    borderRadius: 999,
                    background: currentImageIndex === index ? C.accent : '#cbe9ec',
                    transition: 'all .3s ease',
                  }}
                />
              ))}
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8}}>
              <div style={{background: '#f0fafb', border: '1px solid #e1f1f2', borderRadius: 13, padding: '13px 15px'}}>
                <div style={{fontWeight: 700, fontSize: 13.5, color: C.tealDark}}>Premium</div>
                <div style={{fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.4}}>ບັນຍາກາດດີ ເປັນລະບົບ</div>
              </div>
              <div style={{background: '#f0fafb', border: '1px solid #e1f1f2', borderRadius: 13, padding: '13px 15px'}}>
                <div style={{fontWeight: 700, fontSize: 13.5, color: C.tealDark}}>Fresh Menu</div>
                <div style={{fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.4}}>ອາຫານທ້ອງຖິ່ນ ທັນສະໄໝ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section style={{background: 'linear-gradient(120deg,#0e7490,#0891b2 55%,#0ea5b5)'}}>
        <div
          style={{
            ...container,
            padding: '42px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 24,
          }}
        >
          {platformStats.map((item) => (
            <div key={item.label} style={{textAlign: 'center', color: '#fff', borderLeft: '1px solid rgba(255,255,255,.2)'}}>
              <div style={{fontSize: 34, fontWeight: 800, lineHeight: 1}}>{item.num}</div>
              <div style={{fontSize: 13.5, color: '#cdeef2', marginTop: 5, fontWeight: 500}}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{...container, padding: '88px 32px 40px'}}>
        <SectionHead
          center
          eyebrow='ເປັນຫຍັງຕ້ອງເລືອກເຮົາ'
          title='ບໍລິການທີ່ເປັນມືອາຊີບ'
          desc='ປະສົບການທ່ອງທ່ຽວທາງນ້ຳທີ່ຖືກຈັດລະບຽບດີ ແລະ ມີມາດຕະຖານການບໍລິການຊັດເຈນ.'
        />
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22}}>
          <FeatureCard icon='🏝️' title='ສະຖານທີ່ສວຍງາມ' desc='ລ່ອງເຮືອຜ່ານບັນຍາກາດທີ່ສະຫງົບ ແລະ ຈຸດທ່ອງທ່ຽວສຳຄັນ.' />
          <FeatureCard icon='⭐' title='ບໍລິການລະດັບພຣີເມຍມ' desc='ທີມງານມືອາຊີບຄອຍແລການຈອງ, ການຂຶ້ນເຮືອ ແລະ ການໃຫ້ບໍລິການ.' />
          <FeatureCard icon='💠' title='ໂທນທັນສະໄໝ' desc='ອອກແບບການໃຊ້ງານໃຫ້ອ່ານງ່າຍ ສະອາດ ແລະ ດູນ່າເຊື່ອຖື.' />
          <FeatureCard icon='🛡️' title='ຄວາມປອດໄພ' desc='ເຮືອ ແລະ ຂັ້ນຕອນບໍລິການຖືກຈັດການໃຫ້ມີຄວາມພ້ອມໃນທຸກທຣິບ.' />
        </div>
      </section>

      {/* SHIPS */}
      <section style={{...container, padding: '64px 32px 40px'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            marginBottom: 36,
          }}
        >
          <SectionHead
            eyebrow='ເຮືອຂອງເຮົາ'
            title='ເລືອກເຮືອທ່ອງທ່ຽວ'
            desc='ເຮືອທຸກລຳຖືກຈັດວາງຂໍ້ມູນໃຫ້ເຫັນຊັດ ເພື່ອໃຫ້ຕັດສິນໃຈໄດ້ໄວ ແລະ ແມ່ນຍຳ.'
          />
        </div>

        {loading ? (
          <div style={{textAlign: 'center', color: C.muted, padding: '40px 0'}}>ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
        ) : ships.length > 0 ? (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24}}>
            {ships.map((ship) => (
              <div
                key={ship.id}
                onClick={() => handleBookingClick('ship')}
                style={{
                  cursor: 'pointer',
                  background: C.white,
                  border: `1px solid ${C.seafoamBorder}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 12px 32px -24px rgba(6,80,90,.5)',
                }}
              >
                <div style={{position: 'relative', aspectRatio: '16 / 10', ...placeholder}}>
                  {ship.imageUrl ? (
                    <img
                      src={ship.imageUrl}
                      alt={ship.name}
                      style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    />
                  ) : (
                    <span style={{fontSize: 36}}>🚢</span>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(255,255,255,.92)',
                      color: C.tealDark,
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: '5px 11px',
                      borderRadius: 999,
                    }}
                  >
                    {ship.status === 'active' ? 'ພ້ອມໃຫ້ບໍລິການ' : 'ບໍ່ວ່າງ'}
                  </span>
                </div>
                <div style={{padding: '18px 20px'}}>
                  <div style={{fontWeight: 700, fontSize: 17, color: C.ink}}>{ship.name}</div>
                  <div style={{fontSize: 13.5, color: C.muted, margin: '4px 0 14px'}}>⚓ ຄວາມຈຸ {ship.capacity} ຄົນ</div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #eef6f6',
                      paddingTop: 13,
                    }}
                  >
                    <span style={{fontWeight: 800, fontSize: 18, color: C.teal}}>{ship.pricePerHour?.toLocaleString()} ₭</span>
                    <span style={{fontSize: 13, fontWeight: 700, color: C.accent}}>ຈອງ →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{textAlign: 'center', color: C.muted, padding: '40px 0'}}>ບໍ່ມີເຮືອ ກະລຸນາກັບມາໃນພາຍຫຼັງ</div>
        )}
      </section>

      {/* FOODS */}
      <section style={{...container, padding: '48px 32px 80px'}}>
        <SectionHead
          eyebrow='ອາຫານ'
          title='ເມນູອາຫານ'
          desc='ເມນູອາຫານທ້ອງຖິ່ນ ແລະ ຊີຟູ້ດສົດໃໝ່ ພ້ອມສັ່ງຄວບຄູ່ກັບການລ່ອງເຮືອ.'
        />

        {loading ? (
          <div style={{textAlign: 'center', color: C.muted, padding: '40px 0'}}>ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
        ) : foods.length > 0 ? (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24}}>
            {foods.map((food) => (
              <div
                key={food.product_id || food.id || food.name}
                onClick={() => handleBookingClick('food')}
                style={{
                  cursor: 'pointer',
                  background: C.white,
                  border: `1px solid ${C.seafoamBorder}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 12px 32px -24px rgba(6,80,90,.5)',
                  display: 'flex',
                }}
              >
                <div style={{width: 118, flexShrink: 0, fontSize: 30, ...placeholder}}>
                  {food.imageUrl ? (
                    <img src={food.imageUrl} alt={food.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : (
                    '🍜'
                  )}
                </div>
                <div style={{padding: '16px 18px', flex: 1, minWidth: 0}}>
                  <div style={{fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 12}}>{food.name}</div>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 800, fontSize: 16, color: C.teal}}>{food.price?.toLocaleString()} ₭</span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: C.tealDark,
                        background: C.seafoam,
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      {food.available ? 'ພ້ອມສັ່ງ' : 'ສິນຄ້າໝົດ'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{textAlign: 'center', color: C.muted, padding: '40px 0'}}>ບໍ່ມີອາຫານ ກະລຸນາກັບມາໃນພາຍຫຼັງ</div>
        )}
      </section>

      {/* CTA */}
      <section style={{position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg,#06525f,#0891b2 70%,#0ea5b5)'}}>
        <div style={{maxWidth: 840, margin: '0 auto', padding: '80px 32px', textAlign: 'center'}}>
          <h2 style={{fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-.01em'}}>
            ພ້ອມເລີ່ມການເດີນທາງແບບໃໝ່ບໍ?
          </h2>
          <p style={{fontSize: 17, color: '#d2f0f3', margin: '0 auto 32px', maxWidth: 600}}>
            ຈອງເຮືອ ແລະ ສັ່ງອາຫານໄດ້ທັນທີ
          </p>

          {isLoggedIn ? (
            <div style={{display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap'}}>
              <button onClick={() => handleBookingClick('ship')} style={{...btnPrimary, padding: '16px 32px'}}>
                ຈອງເຮືອ
              </button>
              <button
                onClick={() => handleBookingClick('food')}
                style={{
                  fontFamily: FONT,
                  cursor: 'pointer',
                  border: '1.5px solid rgba(255,255,255,.5)',
                  background: 'rgba(255,255,255,.08)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 16,
                  padding: '16px 30px',
                  borderRadius: 14,
                }}
              >
                ສັ່ງອາຫານ
              </button>
            </div>
          ) : (
            <div style={{display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap'}}>
              <button onClick={() => navigate('/auth/login')} style={{...btnPrimary, padding: '16px 32px'}}>
                ເຂົ້າສູ່ລະບົບ
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background: C.deep, color: '#bcd9dd'}}>
        <div
          style={{
            ...container,
            padding: '60px 32px 28px',
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
            gap: 40,
          }}
        >
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14}}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: 'linear-gradient(140deg,#0891b2,#06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                JV
              </div>
              <span style={{fontWeight: 700, fontSize: 17, color: '#fff'}}>JoVa ທະເລລາວ</span>
            </div>
            <p style={{fontSize: 14, color: '#8fb9bf', maxWidth: 300, margin: 0, lineHeight: 1.6}}>
              ບໍລິການທ່ອງທ່ຽວທາງນ້ຳ ແລະ ອາຫານຄັດສັນທີ່ສະອາດ ແລະ ທັນສະໄໝ.
            </p>
          </div>

          {[
            {h: 'ບໍລິການ', items: ['ຈອງເຮືອ', 'ສັ່ງອາຫານ', 'ແພັກເກດທ່ອງທ່ຽວ']},
            {h: 'ຂໍ້ມູນ', items: ['ກ່ຽວກັບເຮົາ', 'ຕິດຕໍ່', 'ນະໂຍບາຍ']},
            {h: 'ຕິດຕໍ່', items: ['📍 ວຽງຈັນ, ລາວ', '📞 +856 20 55588558', '✉️ info@laosea.la']},
          ].map((col) => (
            <div key={col.h}>
              <h4
                style={{
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  margin: '0 0 14px',
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                }}
              >
                {col.h}
              </h4>
              <div style={{display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14}}>
                {col.items.map((it) => (
                  <a key={it} href='#' style={{color: '#9ec4c9', textDecoration: 'none'}}>
                    {it}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{borderTop: '1px solid rgba(255,255,255,.1)'}}>
          <div style={{...container, padding: '20px 32px', fontSize: 13, color: '#7da6ac'}}>
            © 2025 JoVa ທະເລລາວ. ສະຫງວນລິຂະສິດ.
          </div>
        </div>
      </footer>
    </div>
  )
}

export {LandingPageShipsFoodsPage}
