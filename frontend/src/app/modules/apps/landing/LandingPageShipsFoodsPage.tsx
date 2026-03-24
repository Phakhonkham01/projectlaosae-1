import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/core/Auth'
import { getShips } from '../create-ships/users-list/core/ship_requests'
import { getUsers } from '../addFood/users-list/core/_requests'

/* ─────────────────────────────────────────────
   Metronic-style Blue & White Landing Page
   ───────────────────────────────────────────── */

const BLUE = '#1B84FF'
const BLUE_DARK = '#056EE9'
const BLUE_LIGHT = '#EEF6FF'
const BLUE_GRADIENT = 'linear-gradient(135deg, #1B84FF 0%, #056EE9 100%)'
const NAVY = '#071437'

const styles = `

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'Google Sans', 'Noto Serif Lao', sans-serif; font-optical-sizing: auto; font-variation-settings: 'GRAD' 0; }

  .lp-root { font-family: 'Google Sans', 'Noto Serif Lao', sans-serif; font-optical-sizing: auto; font-variation-settings: 'GRAD' 0; background: #fff; color: #071437; }

  /* ── Navbar ── */
  .lp-navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(27,132,255,0.12);
    padding: 0 2rem;
    height: 68px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 2px 24px rgba(27,132,255,0.08);
    transition: all 0.3s;
  }
  .lp-navbar-brand {
    display: flex; align-items: center; gap: 0.75rem; text-decoration: none;
  }
  .lp-navbar-logo {
    width: 42px; height: 42px; border-radius: 12px;
    background: ${BLUE_GRADIENT};
    display: flex; align-items: center; justify-content: center;
    font-size: 1.35rem;
    box-shadow: 0 4px 14px rgba(27,132,255,0.35);
  }
  .lp-navbar-title {
    font-size: 1.15rem; font-weight: 700; color: ${NAVY};
    letter-spacing: -0.02em;
  }
  .lp-navbar-subtitle { font-size: 0.7rem; color: #78829D; font-weight: 500; }
  .lp-navbar-actions { display: flex; gap: 0.75rem; align-items: center; }
  .lp-btn-primary {
    background: ${BLUE_GRADIENT};
    color: #fff; border: none; border-radius: 10px;
    padding: 0.6rem 1.4rem; font-size: 0.875rem; font-weight: 600;
    cursor: pointer; transition: all 0.25s;
    box-shadow: 0 4px 14px rgba(27,132,255,0.3);
    font-family: 'Google Sans', sans-serif;
  }
  .lp-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(27,132,255,0.4);
  }
  .lp-btn-outline {
    background: transparent; color: ${BLUE};
    border: 1.5px solid ${BLUE}; border-radius: 10px;
    padding: 0.6rem 1.4rem; font-size: 0.875rem; font-weight: 600;
    cursor: pointer; transition: all 0.25s;
    font-family: 'Google Sans', sans-serif;
  }
  .lp-btn-outline:hover { background: ${BLUE_LIGHT}; }

  /* ── Hero ── */
  .lp-hero {
    min-height: 100vh; position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  .lp-hero-slide {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
    transition: opacity 1.2s ease-in-out;
  }
  .lp-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(135deg,
      rgba(7,20,55,0.75) 0%,
      rgba(27,132,255,0.45) 50%,
      rgba(7,20,55,0.65) 100%
    );
  }
  .lp-hero-content {
    position: relative; z-index: 10;
    text-align: center; padding: 8rem 1.5rem 4rem;
    max-width: 860px; margin: 0 auto;
  }
  .lp-hero-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(27,132,255,0.25); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 50px; padding: 0.4rem 1.1rem;
    color: #93C5FD; font-size: 0.8rem; font-weight: 600;
    letter-spacing: 0.05em; text-transform: uppercase;
    margin-bottom: 1.5rem; animation: fadeInDown 0.8s ease-out both;
  }
  .lp-hero-h1 {
    font-size: clamp(2.2rem, 5vw, 4rem);
    font-weight: 800; color: #fff; line-height: 1.15;
    letter-spacing: -0.03em; margin-bottom: 1rem;
    animation: fadeInUp 0.9s ease-out 0.2s both;
  }
  .lp-hero-h1 span {
    background: linear-gradient(90deg, #60A5FA, #93C5FD);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .lp-hero-desc {
    font-size: 1.1rem; color: rgba(255,255,255,0.75);
    line-height: 1.7; max-width: 560px; margin: 0 auto 2.5rem;
    animation: fadeInUp 0.9s ease-out 0.35s both;
  }
  .lp-hero-actions {
    display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
    margin-bottom: 3rem; animation: fadeInUp 0.9s ease-out 0.5s both;
  }
  .lp-hero-btn-main {
    background: ${BLUE_GRADIENT};
    color: #fff; border: none; border-radius: 14px;
    padding: 0.9rem 2.2rem; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: all 0.3s;
    box-shadow: 0 8px 30px rgba(27,132,255,0.45);
    display: flex; align-items: center; gap: 0.6rem;
    font-family: 'Google Sans', sans-serif;
  }
  .lp-hero-btn-main:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(27,132,255,0.55);
  }
  .lp-hero-btn-ghost {
    background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
    color: #fff; border: 1.5px solid rgba(255,255,255,0.35);
    border-radius: 14px; padding: 0.9rem 2.2rem;
    font-size: 1rem; font-weight: 600;
    cursor: pointer; transition: all 0.3s;
    display: flex; align-items: center; gap: 0.6rem;
    font-family: 'Google Sans', sans-serif;
  }
  .lp-hero-btn-ghost:hover {
    background: rgba(255,255,255,0.22);
    transform: translateY(-3px);
  }

  /* Glass info card */
  .lp-hero-glass {
    background: rgba(255,255,255,0.12); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px; padding: 1.5rem 2rem;
    max-width: 400px; margin: 0 auto 2rem;
    animation: fadeInUp 0.9s ease-out 0.65s both;
  }
  .lp-hero-glass h3 {
    color: #fff; font-size: 1.3rem; font-weight: 700; margin-bottom: 0.3rem;
  }
  .lp-hero-glass p { color: #BFDBFE; font-size: 0.9rem; }

  /* Slide dots */
  .lp-dots {
    position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
    z-index: 20; display: flex; gap: 0.6rem;
  }
  .lp-dot {
    height: 8px; border-radius: 50px; border: none; cursor: pointer;
    transition: all 0.35s; background: rgba(255,255,255,0.45);
  }
  .lp-dot.active { width: 28px; background: #fff; }
  .lp-dot:not(.active) { width: 8px; }

  /* Arrow buttons */
  .lp-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    z-index: 20; background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px); border: 1.5px solid rgba(255,255,255,0.25);
    border-radius: 50%; width: 48px; height: 48px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; cursor: pointer; transition: all 0.3s;
  }
  .lp-arrow:hover { background: rgba(27,132,255,0.55); border-color: transparent; }
  .lp-arrow.left { left: 1.5rem; }
  .lp-arrow.right { right: 1.5rem; }

  /* ── Stats bar ── */
  .lp-stats {
    background: ${NAVY};
    padding: 2rem 2rem;
  }
  .lp-stats-inner {
    max-width: 960px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem; text-align: center;
  }
  .lp-stat-num { font-size: 2rem; font-weight: 800; color: ${BLUE}; }
  .lp-stat-label { font-size: 0.8rem; color: #78829D; font-weight: 500; margin-top: 0.2rem; }

  /* ── Features ── */
  .lp-features { background: ${BLUE_LIGHT}; padding: 5rem 2rem; }
  .lp-section-label {
    display: inline-block; background: rgba(27,132,255,0.12);
    color: ${BLUE}; border-radius: 50px;
    padding: 0.35rem 1rem; font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem;
  }
  .lp-section-title {
    font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 800;
    color: ${NAVY}; letter-spacing: -0.03em; margin-bottom: 0.75rem;
  }
  .lp-section-sub { font-size: 1rem; color: #78829D; max-width: 480px; line-height: 1.65; }
  .lp-features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem; margin-top: 3rem;
  }
  .lp-feature-card {
    background: #fff; border-radius: 20px;
    padding: 2rem 1.75rem; border: 1px solid #E9F0FF;
    transition: all 0.3s; cursor: default;
    box-shadow: 0 2px 12px rgba(27,132,255,0.06);
  }
  .lp-feature-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(27,132,255,0.14);
    border-color: rgba(27,132,255,0.2);
  }
  .lp-feature-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: ${BLUE_GRADIENT};
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; margin-bottom: 1.25rem;
    box-shadow: 0 6px 18px rgba(27,132,255,0.3);
  }
  .lp-feature-card h3 {
    font-size: 1rem; font-weight: 700; color: ${NAVY}; margin-bottom: 0.5rem;
  }
  .lp-feature-card p { font-size: 0.875rem; color: #78829D; line-height: 1.6; }

  /* ── Ships / Foods sections ── */
  .lp-ships-section { background: #fff; padding: 5rem 2rem; }
  .lp-foods-section { background: #F8FAFF; padding: 5rem 2rem; }
  .lp-section-header { text-align: center; margin-bottom: 3rem; }
  .lp-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 1.75rem; max-width: 1100px; margin: 0 auto;
  }

  /* Ship card */
  .lp-card {
    background: #fff; border-radius: 20px; overflow: hidden;
    border: 1px solid #E9F0FF;
    box-shadow: 0 2px 16px rgba(27,132,255,0.07);
    transition: all 0.3s; cursor: pointer;
  }
  .lp-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(27,132,255,0.18);
    border-color: rgba(27,132,255,0.25);
  }
  .lp-card-img {
    height: 188px; overflow: hidden; position: relative;
    display: flex; align-items: center; justify-content: center;
    font-size: 3.5rem;
  }
  .lp-card-img img { width: 100%; height: 100%; object-fit: cover; }
  .lp-card-img-ship { background: linear-gradient(135deg, #1B84FF 0%, #0040A0 100%); }
  .lp-card-img-food { background: linear-gradient(135deg, #13C2C2 0%, #006D75 100%); }
  .lp-card-body { padding: 1.5rem; }
  .lp-card-title { font-size: 1.05rem; font-weight: 700; color: ${NAVY}; margin-bottom: 0.35rem; }
  .lp-card-meta { font-size: 0.825rem; color: #78829D; margin-bottom: 1rem; }
  .lp-card-footer { display: flex; align-items: center; justify-content: space-between; }
  .lp-card-price { font-size: 1.3rem; font-weight: 800; color: ${BLUE}; }
  .lp-badge {
    font-size: 0.7rem; font-weight: 700; padding: 0.3rem 0.75rem;
    border-radius: 50px;
  }
  .lp-badge-success { background: #E6FFF8; color: #00A88A; }
  .lp-badge-danger  { background: #FFF1F0; color: #D9363E; }

  /* ── CTA Section ── */
  .lp-cta {
    background: ${BLUE_GRADIENT};
    padding: 5rem 2rem; text-align: center; position: relative; overflow: hidden;
  }
  .lp-cta::before {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .lp-cta h2 {
    font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; color: #fff;
    letter-spacing: -0.03em; margin-bottom: 1rem; position: relative;
  }
  .lp-cta p {
    color: rgba(255,255,255,0.8); font-size: 1.05rem;
    max-width: 520px; margin: 0 auto 2.5rem; line-height: 1.7; position: relative;
  }
  .lp-cta-btn {
    background: #fff; color: ${BLUE}; border: none; border-radius: 14px;
    padding: 1rem 2.5rem; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: all 0.3s;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    font-family: 'Google Sans', sans-serif; position: relative;
  }
  .lp-cta-btn:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.22); }

  /* ── Footer ── */
  .lp-footer { background: ${NAVY}; padding: 3rem 2rem 2rem; }
  .lp-footer-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; gap: 2rem; flex-wrap: wrap; justify-content: space-between;
    padding-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 1.5rem;
  }
  .lp-footer-brand p { color: #78829D; font-size: 0.85rem; margin-top: 0.75rem; max-width: 220px; line-height: 1.6; }
  .lp-footer-links h4 { color: #fff; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: 0.05em; text-transform: uppercase; }
  .lp-footer-links ul { list-style: none; }
  .lp-footer-links li { margin-bottom: 0.5rem; }
  .lp-footer-links a { color: #78829D; text-decoration: none; font-size: 0.875rem; transition: color 0.2s; }
  .lp-footer-links a:hover { color: ${BLUE}; }
  .lp-footer-copy { color: #4B5675; font-size: 0.8rem; text-align: center; }

  /* ── Divider ── */
  .lp-divider {
    height: 4px; background: ${BLUE_GRADIENT};
    border-radius: 4px; width: 56px; margin: 0.75rem 0 1.25rem;
  }
  .lp-divider.center { margin: 0.75rem auto 1.25rem; }

  /* ── Login required prompt ── */
  .lp-login-prompt {
    background: ${BLUE_LIGHT}; border: 1.5px solid rgba(27,132,255,0.2);
    border-radius: 20px; padding: 2.5rem 2rem; text-align: center;
    max-width: 420px; margin: 0 auto 2rem;
    animation: fadeInUp 0.9s ease-out 0.5s both;
  }
  .lp-login-prompt p { color: #3F4254; font-size: 1rem; margin-bottom: 1.25rem; line-height: 1.6; }

  /* ── Loading ── */
  .lp-loading {
    text-align: center; padding: 3rem;
    color: #78829D; font-size: 1rem;
    display: flex; align-items: center; justify-content: center; gap: 0.75rem;
  }
  .lp-spinner {
    width: 24px; height: 24px; border: 3px solid ${BLUE_LIGHT};
    border-top-color: ${BLUE}; border-radius: 50%; animation: spin 0.8s linear infinite;
  }

  /* ── Animations ── */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
`

/* ─── Sub-components ─────────────────────────── */

const FeatureCard = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div className='lp-feature-card'>
    <div className='lp-feature-icon'>{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
)

/* ─── Main Component ─────────────────────────── */

const LandingPageShipsFoodsPage = () => {
  const navigate = useNavigate()
  const { auth, currentUser } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [ships, setShips] = useState<any[]>([])
  const [foods, setFoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Inject Google Fonts <link> tags into <head>
  useEffect(() => {
    const links: HTMLLinkElement[] = []

    const addLink = (attrs: Record<string, string>) => {
      const el = document.createElement('link')
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
      document.head.appendChild(el)
      links.push(el)
    }

    addLink({ rel: 'preconnect', href: 'https://fonts.googleapis.com' })
    addLink({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' })
    addLink({
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Noto+Serif+Lao:wght@100..900&display=swap',
    })

    return () => links.forEach((el) => el.remove())
  }, [])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const shipsData = await getShips()
        setShips(shipsData.slice(0, 6))
        const productsResponse = await getUsers('')
        setFoods(productsResponse.data?.slice(0, 6) || [])
      } catch (error) {
        console.error('❌ Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Image carousel data
  const images = [
    { url: '/images/view.jpg', title: 'ເຮືອທ່ອງທ່ຽວຫຼູຫຼາ', description: 'ປະສົບການທ່ອງທ່ຽວທີ່ສະດວກສະບາຍ' },
    { url: '/images/view1.jpg', title: 'ທິວທັດທີ່ສວຍງາມ', description: 'ຊົມວິວທິວທັດອັນງົດງາມ' },
    { url: '/images/view2.jpg', title: 'ການບໍລິການລະດັບ 5 ດາວ', description: 'ທີມງານມືອາຊີບຄອຍດູແລທ່ານ' },
    { url: '/images/view3.jpg', title: 'ອາຫານທະເລສົດໃໝ່', description: 'ລິ້ມລອງອາຫານທ້ອງຖິ່ນແສນອຮ່ອຍ' },
  ]

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))

  const handleBookingClick = (type: 'ship' | 'food') => {
    if (!auth || !auth.token || !currentUser) {
      navigate('/auth/login', { state: { returnTo: `/apps/booking-management/booking-${type}s` } })
      return
    }
    if (type === 'ship') {
      navigate('/apps/booking-management/booking-ships/booking-ships')
    } else {
      navigate('/apps/booking-management/booking-foods')
    }
  }

  const isLoggedIn = !!(auth?.token && currentUser)

  return (
    <div className='lp-root'>
      <style>{styles}</style>

      {/* ── Navbar ── */}
      <nav className='lp-navbar'>
        <a className='lp-navbar-brand' href='/'>
          <div className='lp-navbar-logo'>🚢</div>
          <div>
            <div className='lp-navbar-title'>ທີ່ຢູ່ທະເລລາວ</div>
            <div className='lp-navbar-subtitle'>Cruise &amp; Dining Experience</div>
          </div>
        </a>
        <div className='lp-navbar-actions'>
          {isLoggedIn ? (
            <>
              <button className='lp-btn-outline' onClick={() => handleBookingClick('food')}>🍜 ຈອງອາຫານ</button>
              <button className='lp-btn-primary' onClick={() => handleBookingClick('ship')}>🚢 ຈອງເຮືອ</button>
            </>
          ) : (
            <>
              <button className='lp-btn-outline' onClick={() => navigate('/auth/login')}>ເຂົ້າສູ່ລະບົບ</button>
              <button className='lp-btn-primary' onClick={() => navigate('/auth/registration')}>ສະໝັກໃຊ້</button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Carousel ── */}
      <div className='lp-hero'>
        {images.map((img, i) => (
          <div
            key={i}
            className='lp-hero-slide'
            style={{
              backgroundImage: `url('${img.url}')`,
              opacity: currentImageIndex === i ? 1 : 0,
            }}
          >
            <div className='lp-hero-overlay' />
          </div>
        ))}

        <div className='lp-hero-content'>
          <div className='lp-hero-badge'>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA', display: 'inline-block' }} />
            ລາວຄຣູ້ສ &amp; ທ່ອງທ່ຽວ
          </div>

          <h1 className='lp-hero-h1'>
            ຄົ້ນພົບ<br />
            <span>ທີ່ຢູ່ທະເລລາວ</span>
          </h1>
          <p className='lp-hero-desc'>
            ຄົ້ນພົບຄວາມງາມຂອງທຳມະຊາດດ້ວຍບໍລິການເຮືອນຳທ່ຽວ ແລະ ອາຫານທ້ອງຖິ່ນຄຸນນະພາບສູງ
          </p>

          {isLoggedIn ? (
            <div className='lp-hero-actions'>
              <button className='lp-hero-btn-main' onClick={() => handleBookingClick('ship')}>
                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72' />
                </svg>
                ຈອງເຮືອຕອນນີ້
              </button>
              <button className='lp-hero-btn-ghost' onClick={() => handleBookingClick('food')}>
                🍜 ສັ່ງອາຫານ
              </button>
            </div>
          ) : (
            <div className='lp-login-prompt'>
              <p>🔐 ກະລຸນາ <strong>ເຂົ້າສູ່ລະບົບ</strong> ເພື່ອໃຊ້ບໍລິການຈອງເຮືອ ແລະ ສັ່ງອາຫານ</p>
              <button className='lp-hero-btn-main' style={{ margin: '0 auto' }} onClick={() => navigate('/auth/login')}>
                ເຂົ້າສູ່ລະບົບ →
              </button>
            </div>
          )}

          {/* Slide info glass card */}
          <div className='lp-hero-glass'>
            <h3>{images[currentImageIndex].title}</h3>
            <p>{images[currentImageIndex].description}</p>
          </div>
        </div>

        {/* Arrows */}
        <button className='lp-arrow left' onClick={prevImage} aria-label='Previous'>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
            <polyline points='15 18 9 12 15 6' />
          </svg>
        </button>
        <button className='lp-arrow right' onClick={nextImage} aria-label='Next'>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
            <polyline points='9 18 15 12 9 6' />
          </svg>
        </button>

        {/* Dots */}
        <div className='lp-dots'>
          {images.map((_, i) => (
            <button
              key={i}
              className={`lp-dot${i === currentImageIndex ? ' active' : ''}`}
              onClick={() => setCurrentImageIndex(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className='lp-stats'>
        <div className='lp-stats-inner'>
          {[
            { num: '50+', label: 'ເຮືອທ່ອງທ່ຽວ' },
            { num: '200+', label: 'ເມນູອາຫານ' },
            { num: '5,000+', label: 'ລູກຄ້າພໍໃຈ' },
            { num: '10+', label: 'ປີໃຫ້ບໍລິການ' },
          ].map((s, i) => (
            <div key={i}>
              <div className='lp-stat-num'>{s.num}</div>
              <div className='lp-stat-label'>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div className='lp-features'>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <span className='lp-section-label'>ທຳໄມຕ້ອງເລືອກເຮົາ</span>
            <div className='lp-divider center' />
            <h2 className='lp-section-title'>ການບໍລິການທີ່ທ່ານໄວ້ວາງໃຈ</h2>
            <p className='lp-section-sub' style={{ margin: '0 auto' }}>ເຮົາສະໜອງປະສົບການທ່ອງທ່ຽວທາງນ້ຳດ້ວຍຄຸນນະພາບລະດັບສາກົນ</p>
          </div>
          <div className='lp-features-grid'>
            <FeatureCard icon='🏖️' title='ສະຖານທີ່ສວຍງາມ' desc='ສຳຫຼວດທຳມະຊາດ ແລະ ແຫຼ່ງທ່ອງທ່ຽວທີ່ງາມທີ່ສຸດໃນລາວ' />
            <FeatureCard icon='⭐' title='ບໍລິການ 5 ດາວ' desc='ທີມງານມືອາຊີບພ້ອມໃຫ້ບໍລິການຕະຫຼອດການເດີນທາງ' />
            <FeatureCard icon='💰' title='ລາຄາທີ່ດີທີ່ສຸດ' desc='ແພັກເກດທ່ອງທ່ຽວຫຼາກຫຼາຍໃນລາຄາທີ່ເໝາະສົມ' />
            <FeatureCard icon='🛡️' title='ຄວາມປອດໄພ' desc='ເຮືອໄດ້ຮັບການກວດກາ ແລະ ຮັກສາຄວາມປອດໄພຕາມມາດຕະຖານ' />
          </div>
        </div>
      </div>

      {/* ── Ships Section ── */}
      <div className='lp-ships-section'>
        <div className='lp-section-header'>
          <span className='lp-section-label'>ເຮືອຂອງເຮົາ</span>
          <div className='lp-divider center' />
          <h2 className='lp-section-title'>🚢 ເລືອກເຮືອທ່ອງທ່ຽວ</h2>
          <p className='lp-section-sub' style={{ margin: '0 auto', textAlign: 'center' }}>
            ເຮືອທຸກລຳໄດ້ຮັບການດູແລ ແລະ ຮັກສາໃຫ້ພ້ອມໃຫ້ບໍລິການ
          </p>
        </div>

        {loading ? (
          <div className='lp-loading'>
            <div className='lp-spinner' /> ກຳລັງໂຫຼດຂໍ້ມູນ...
          </div>
        ) : ships.length > 0 ? (
          <div className='lp-cards-grid'>
            {ships.map((ship) => (
              <div
                key={ship.id}
                className='lp-card'
                onClick={() => handleBookingClick('ship')}
              >
                <div className='lp-card-img lp-card-img-ship'>
                  {ship.image_url
                    ? <img src={ship.image_url} alt={ship.ship_name || ship.name} />
                    : '🚢'
                  }
                </div>
                <div className='lp-card-body'>
                  <div className='lp-card-title'>{ship.ship_name || ship.name}</div>
                  <div className='lp-card-meta'>👥 ຄວາມຈຸ: {ship.capacity} ຄົນ</div>
                  <div className='lp-card-footer'>
                    <span className='lp-card-price'>{ship.price?.toLocaleString()} ₭</span>
                    <span className={`lp-badge ${ship.status === 'Active' ? 'lp-badge-success' : 'lp-badge-danger'}`}>
                      {ship.status === 'Active' ? '✓ ພ້ອມໃຫ້ບໍລິການ' : '✗ ບໍ່ວ່າງ'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='lp-loading'>📭 ບໍ່ມີເຮືອ ກະລຸນາກັບມາໃນພາຍຫຼັງ</div>
        )}
      </div>

      {/* ── Foods Section ── */}
      <div className='lp-foods-section'>
        <div className='lp-section-header'>
          <span className='lp-section-label'>ອາຫານ</span>
          <div className='lp-divider center' />
          <h2 className='lp-section-title'>🍜 ເມນູອາຫານ</h2>
          <p className='lp-section-sub' style={{ margin: '0 auto', textAlign: 'center' }}>
            ລິ້ມລອງຄວາມໄຈ້ຂອງອາຫານທ້ອງຖິ່ນ ແລະ ອາຫານສາກົນ
          </p>
        </div>

        {loading ? (
          <div className='lp-loading'>
            <div className='lp-spinner' /> ກຳລັງໂຫຼດຂໍ້ມູນ...
          </div>
        ) : foods.length > 0 ? (
          <div className='lp-cards-grid'>
            {foods.map((food) => (
              <div
                key={food.product_id}
                className='lp-card'
                onClick={() => handleBookingClick('food')}
              >
                <div className='lp-card-img lp-card-img-food'>
                  {food.image
                    ? <img src={food.image} alt={food.name} />
                    : '🍜'
                  }
                </div>
                <div className='lp-card-body'>
                  <div className='lp-card-title'>{food.name}</div>
                  <div className='lp-card-meta'>🏷️ ປະເພດ: {food.category_id || 'ທົ່ວໄປ'}</div>
                  <div className='lp-card-footer'>
                    <span className='lp-card-price' style={{ color: '#13C2C2' }}>{food.price?.toLocaleString()} ₭</span>
                    <span className={`lp-badge ${food.availability ? 'lp-badge-success' : 'lp-badge-danger'}`}>
                      {food.availability ? '✓ ມີ' : '✗ ໝົດ'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='lp-loading'>📭 ບໍ່ມີອາຫານ ກະລຸນາກັບມາໃນພາຍຫຼັງ</div>
        )}
      </div>

      {/* ── CTA ── */}
      <div className='lp-cta'>
        <h2>ພ້ອມຈະເລີ່ມການຜະຈົນໄພບໍ?</h2>
        <p>ຈອງເຮືອ ແລະ ສັ່ງອາຫານໄດ້ທັນທີ ດ້ວຍລະບົບອອນລາຍທີ່ງ່າຍດາຍ</p>
        {isLoggedIn ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <button className='lp-cta-btn' onClick={() => handleBookingClick('ship')}>🚢 ຈອງເຮືອ</button>
            <button className='lp-cta-btn' style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)' }} onClick={() => handleBookingClick('food')}>🍜 ສັ່ງອາຫານ</button>
          </div>
        ) : (
          <button className='lp-cta-btn' onClick={() => navigate('/auth/login')}>
            ເລີ່ມຕ້ອນນີ້ →
          </button>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className='lp-footer'>
        <div className='lp-footer-inner'>
          <div className='lp-footer-brand'>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div className='lp-navbar-logo' style={{ width: 36, height: 36, fontSize: '1.1rem' }}>🚢</div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>ທີ່ຢູ່ທະເລລາວ</span>
            </div>
            <p>ບໍລິການທ່ອງທ່ຽວທາງນ້ຳ ແລະ ອາຫານທ້ອງຖິ່ນຄຸນນະພາບສູງ</p>
          </div>
          <div className='lp-footer-links'>
            <h4>ການບໍລິການ</h4>
            <ul>
              <li><a href='#'>ຈອງເຮືອ</a></li>
              <li><a href='#'>ສັ່ງອາຫານ</a></li>
              <li><a href='#'>ທ່ອງທ່ຽວ</a></li>
            </ul>
          </div>
          <div className='lp-footer-links'>
            <h4>ຂໍ້ມູນ</h4>
            <ul>
              <li><a href='#'>ກ່ຽວກັບເຮົາ</a></li>
              <li><a href='#'>ຕິດຕໍ່</a></li>
              <li><a href='#'>ນະໂຍບາຍ</a></li>
            </ul>
          </div>
          <div className='lp-footer-links'>
            <h4>ຕິດຕໍ່</h4>
            <ul>
              <li><a href='#'>📍 ວຽງຈັນ, ລາວ</a></li>
              <li><a href='#'>📞 +856 20 XXXX</a></li>
              <li><a href='#'>✉️ info@laosea.la</a></li>
            </ul>
          </div>
        </div>
        <div className='lp-footer-copy'>
          © 2025 ທີ່ຢູ່ທະເລລາວ. ສະຫງວນລິຂະສິດ.
        </div>
      </footer>
    </div>
  )
}

export { LandingPageShipsFoodsPage }
