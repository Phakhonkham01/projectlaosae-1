import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../auth/core/Auth'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'

const LandingPageShipsFoodsPage = () => {
  const navigate = useNavigate()
  const {auth, currentUser} = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [ships, setShips] = useState<any[]>([])
  const [foods, setFoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Image carousel data
  const images = [
    {
      url: '/images/view.jpg',
      title: 'ເຮືອທ່ອງທ່ຽວຫຼູຫຼາ',
      description: 'ປະສົບການທ່ອງທ່ຽວທີ່ສະດວກສະບາຍ',
    },
    {
      url: '/images/view1.jpg',
      title: 'ທິວທັດທະເລສາບ',
      description: 'ຊົມວິວທິວທັດອັນງົດງາມ',
    },
    {
      url: '/images/view2.jpg',
      title: 'ການບໍລິການສຸດພິເສດ',
      description: 'ທີມງານມືອາຊີບຄອຍດູແລທ່ານ',
    },
    {
      url: '/images/view3.jpg',
      title: 'ອາຫານທະເລສົດໃໝ່',
      description: 'ລິ້ມລອງອາຫານທ້ອງຖິ່ນແສນອຮ່ອຍ',
    },
  ]

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Handle booking button click with login check
  const handleBookingClick = (type: 'ship' | 'food') => {
    if (!auth || !auth.token || !currentUser) {
      // Not logged in - redirect to login
      navigate('/auth/login', {state: {returnTo: `/apps/booking-management/booking-${type}s`}})
      return
    }
    // Logged in - proceed to booking
    if (type === 'ship') {
      navigate('/apps/booking-management/booking-ships/booking-ships')
    } else {
      navigate('/apps/booking-management/booking-foods')
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <div className='d-flex flex-column flex-root'>
      {/* Hero Section with Carousel */}
      <div className='min-h-screen bg-dark' style={{position: 'relative', overflow: 'hidden'}}>
        {/* Carousel Background */}
        <div style={{position: 'absolute', inset: 0}}>
          {images.map((image, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${image.url}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: currentImageIndex === index ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.4), rgba(0,0,0,0.6))',
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Content Overlay */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{maxWidth: '56rem', margin: '0 auto', textAlign: 'center'}}>
            {/* Logo & Brand */}
            <div style={{marginBottom: '2rem', animation: 'fadeInUp 1s ease-out'}}>
              <div
                style={{
                  width: '5rem',
                  height: '5rem',
                  background: 'linear-gradient(to bottom right, #3b82f6, #9333ea)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <svg width='40' height='40' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <circle cx='12' cy='12' r='9' stroke='white' strokeWidth='1.5' />
                </svg>
              </div>
              <h1 style={{fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
                🚢{' '}
                <span style={{background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  ທີ່ຢູ່ທະເລລາວ
                </span>
              </h1>
              <p style={{fontSize: '1.25rem', color: '#bfdbfe', marginBottom: '0.5rem'}}>
                ຍິນດີຕ້ອນຮັບສູ່ການຜະຈົນໄພທີ່ບໍ່ລືມ
              </p>
              <p style={{fontSize: '1.125rem', color: '#d1d5db', maxWidth: '42rem', margin: '0 auto'}}>
                ຄົ້ນພົບຄວາມງາມຂອງທະເລລາວດ້ວຍບໍລິການເຮືອນຳທ່ຽວທີ່ມີຄຸນນະພາບສູງ
              </p>
            </div>

            {/* Current Image Info */}
            <div style={{marginBottom: '2rem', animation: 'fadeInUp 1s ease-out 0.3s both'}}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '1.5rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  maxWidth: '28rem',
                  margin: '0 auto',
                }}
              >
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  {images[currentImageIndex].title}
                </h3>
                <p style={{color: '#bfdbfe'}}>{images[currentImageIndex].description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '2rem',
                animation: 'fadeInUp 1s ease-out 0.6s both',
              }}
              className='flex-sm-row'
            >
              <button
                onClick={() => handleBookingClick('ship')}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '1rem',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  minWidth: '200px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <svg width='20' height='20' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <span>ຈອງເຮືອຂະນຶ່ງ</span>
              </button>

              <button
                onClick={() => handleBookingClick('food')}
                style={{
                  padding: '1rem 2rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  minWidth: '200px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <svg width='20' height='20' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m2-1l-2-1m2 1v2.5' />
                </svg>
                <span>ຈອງອາຫານ</span>
              </button>
            </div>

            {/* Features */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                animation: 'fadeInUp 1s ease-out 0.9s both',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '1.5rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-0.5rem)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🏖️</div>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  ສະຖານທີ່ສວຍງາມ
                </h3>
                <p style={{color: '#bfdbfe', fontSize: '0.875rem'}}>ສຳຫຼວດທະເລສາບແລະແຫຼ່ງທ່ອງທ່ຽວທີ່ງາມທີ່ສຸດ</p>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '1.5rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-0.5rem)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⭐</div>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  ບໍລິການດີເລິດ
                </h3>
                <p style={{color: '#bfdbfe', fontSize: '0.875rem'}}>ທີມງານມືອາຊີບພ້ອມໃຫ້ບໍລິການຕະຫຼອດການເດີນທາງ</p>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '1.5rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-0.5rem)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{fontSize: '2rem', marginBottom: '1rem'}}>💰</div>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  ລາຄາສົມເຫດສົມຜົນ
                </h3>
                <p style={{color: '#bfdbfe', fontSize: '0.875rem'}}>ແພັກເກດທ່ອງທ່ຽວຫຼາກຫຼາຍໃນລາຄາທີ່ເໝາະສົມ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={previousImage}
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            borderRadius: '50%',
            padding: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
          }}
        >
          <svg width='24' height='24' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
          </svg>
        </button>

        <button
          onClick={nextImage}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            borderRadius: '50%',
            padding: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
          }}
        >
          <svg width='24' height='24' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
          </svg>
        </button>

        {/* Image Indicators */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              style={{
                width: index === currentImageIndex ? '1.5rem' : '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                background: index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        {/* Floating Elements */}
        <div
          style={{
            position: 'absolute',
            top: '5rem',
            left: '5rem',
            width: '8rem',
            height: '8rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '50%',
            filter: 'blur(2rem)',
            animation: 'pulse 3s infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export {LandingPageShipsFoodsPage}
