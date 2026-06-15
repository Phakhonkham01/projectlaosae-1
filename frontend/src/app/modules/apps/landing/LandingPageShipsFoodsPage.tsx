import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Swal from 'sweetalert2'
import {useAuth} from '../../auth/core/Auth'
import {getUsers} from '../addFood/users-list/core/_requests'
import {getShips} from '../create-ships/users-list/core/ship_requests'

const BLUE = '#1677FF'
const BLUE_DARK = '#0F4FC8'
const BLUE_LIGHT = '#EDF5FF'
const MINT = '#1FC7B6'
const MINT_DARK = '#129D93'
const NAVY = '#081A35'
const BLUE_GRADIENT = 'linear-gradient(135deg, #1677FF 0%, #0F4FC8 100%)'

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Google Sans', 'Noto Serif Lao', sans-serif; background: #F5FAFF; }
  .lp-root { font-family: 'Google Sans', 'Noto Serif Lao', sans-serif; color: ${NAVY}; background: linear-gradient(180deg, #f7fbff00 0%, #ffffff00 30%, #f7fbff00 100%); }
  .lp-navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; height: 78px; padding: 0 1.25rem; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.88); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(22,119,255,0.08); box-shadow: 0 14px 34px rgba(8,26,53,0.06); }
  .lp-navbar-brand { display: flex; align-items: center; gap: 1rem; text-decoration: none; }
  .lp-navbar-logo { width: 58px; height: 58px; border-radius: 18px; overflow: hidden; background: linear-gradient(135deg, rgba(22,119,255,0.18), rgba(31,199,182,0.2)); box-shadow: 0 16px 34px rgba(22,119,255,0.16); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .lp-navbar-title { font-size: 1.05rem; font-weight: 800; color: ${NAVY}; }
  .lp-navbar-subtitle { font-size: 0.72rem; color: #6B7A90; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .lp-navbar-actions { display: flex; align-items: center; gap: 0.75rem; }
  .lp-btn-primary, .lp-btn-outline, .lp-hero-btn-main, .lp-hero-btn-ghost, .lp-cta-btn { font-family: 'Google Sans', sans-serif; transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease; }
  .lp-btn-primary, .lp-hero-btn-main { border: none; border-radius: 14px; background: ${BLUE_GRADIENT}; color: #fff; padding: 0.9rem 1.55rem; font-size: 0.92rem; font-weight: 800; cursor: pointer; box-shadow: 0 18px 38px rgba(22,119,255,0.22); }
  .lp-btn-primary:hover, .lp-hero-btn-main:hover, .lp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 24px 44px rgba(22,119,255,0.28); }
  .lp-btn-outline { border: 1px solid rgba(22,119,255,0.16); border-radius: 14px; background: #fff; color: ${BLUE}; padding: 0.9rem 1.45rem; font-size: 0.92rem; font-weight: 800; cursor: pointer; box-shadow: 0 10px 26px rgba(8,26,53,0.05); }
  .lp-btn-outline:hover, .lp-hero-btn-ghost:hover { background: ${BLUE_LIGHT}; border-color: rgba(22,119,255,0.24); transform: translateY(-2px); }
  .lp-hero { position: relative; overflow: hidden; min-height: 100vh; padding: 8.5rem 1.5rem 4rem; display: flex; align-items: center; }
  .lp-hero-slide { position: absolute; inset: 0; background-size: cover; background-position: center center; transition: opacity 1.2s ease-in-out, transform 7s ease-out; transform: scale(1.045); }
  .lp-hero-slide.is-active { transform: scale(1); }
  .lp-hero-overlay { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(5,16,36,0.34) 0%, rgba(5,16,36,0.08) 36%, rgba(5,16,36,0) 62%); }
  .lp-hero-content { position: relative; z-index: 10; width: 100%; max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: minmax(0,1.12fr) minmax(320px,0.88fr); gap: 2rem; align-items: center; }
  .lp-hero-main { max-width: 690px; }
  .lp-hero-chip { display: inline-flex; align-items: center; gap: 0.7rem; padding: 0.62rem 1.05rem; border-radius: 999px; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.26); box-shadow: 0 16px 34px rgba(5, 16, 36, 0.28); color: #EAF3FF; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.4rem; backdrop-filter: blur(12px); }
  .lp-hero-chip-dot { width: 10px; height: 10px; border-radius: 999px; background: ${MINT}; box-shadow: 0 0 0 6px rgba(31,199,182,0.12); }
  .lp-hero-h1 { font-size: clamp(2.8rem, 6vw, 5rem); line-height: 1.02; letter-spacing: -0.05em; color: #ffffff; font-weight: 900; margin-bottom: 1rem; text-shadow: 0 2px 12px rgba(5,16,36,0.35); }
  .lp-hero-h1 span { color: #4FE6D4; }
  .lp-hero-desc { font-size: 1.06rem; color: rgba(240,246,255,0.92); line-height: 1.85; margin-bottom: 2rem; max-width: 620px; text-shadow: 0 1px 8px rgba(5,16,36,0.35); }
  .lp-hero-actions { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.65rem; }
  .lp-hero-btn-main, .lp-hero-btn-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 0.65rem; padding: 1rem 1.85rem; border-radius: 16px; font-size: 0.98rem; }
  .lp-hero-btn-ghost { border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.12); color: #fff; box-shadow: 0 14px 30px rgba(5,16,36,0.25); cursor: pointer; backdrop-filter: blur(10px); }
  .lp-hero-btn-ghost:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.45); }
  .lp-hero-metrics { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; }
  .lp-hero-metric { padding: 1.15rem 1.2rem; border-radius: 20px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 18px 38px rgba(5,16,36,0.22); backdrop-filter: blur(12px); }
  .lp-hero-metric-value { color: #ffffff; font-size: 1.55rem; font-weight: 900; margin-bottom: 0.2rem; }
  .lp-hero-metric-label { color: rgba(233,241,252,0.78); font-size: 0.8rem; font-weight: 700; }
  .lp-hero-side { display: flex; flex-direction: column; gap: 1rem; }
  .lp-hero-panel, .lp-hero-glass { background: rgba(255,255,255,0.74); border: 1px solid rgba(255,255,255,0.45); border-radius: 24px; box-shadow: 0 22px 50px rgba(8,26,53,0.1); backdrop-filter: blur(14px); }
  .lp-hero-panel { padding: 1.6rem; }
  .lp-hero-panel-label { display: inline-flex; align-items: center; gap: 0.45rem; margin-bottom: 0.8rem; color: ${BLUE_DARK}; font-size: 0.76rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
  .lp-hero-panel-title { color: ${NAVY}; font-size: 1.4rem; font-weight: 800; line-height: 1.3; margin-bottom: 0.45rem; }
  .lp-hero-panel-text { color: #62748B; line-height: 1.75; font-size: 0.94rem; }
  .lp-hero-panel-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 0.9rem; margin-top: 1.25rem; }
  .lp-hero-panel-item { border-radius: 18px; padding: 1rem; background: linear-gradient(180deg, #FFFFFF 0%, #F4FAFF 100%); border: 1px solid rgba(22,119,255,0.08); }
  .lp-hero-panel-item strong { display: block; color: ${NAVY}; font-size: 1.1rem; margin-bottom: 0.2rem; }
  .lp-hero-panel-item span { color: #7B8DA5; font-size: 0.8rem; font-weight: 700; }
  .lp-hero-glass { padding: 1.35rem 1.45rem; }
  .lp-hero-glass h3 { color: ${NAVY}; font-size: 1.12rem; font-weight: 800; margin-bottom: 0.3rem; }
  .lp-hero-glass p { color: #62748B; font-size: 0.92rem; line-height: 1.7; }
  .lp-dots { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 20; display: flex; gap: 0.6rem; }
  .lp-dot { width: 10px; height: 10px; border: none; border-radius: 999px; background: rgba(22,119,255,0.22); cursor: pointer; transition: all 0.3s ease; }
  .lp-dot.active { width: 30px; background: linear-gradient(90deg, ${BLUE}, ${MINT}); }
  .lp-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 20; width: 52px; height: 52px; border-radius: 50%; border: 1px solid rgba(22,119,255,0.12); background: rgba(255,255,255,0.82); color: ${NAVY}; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 18px 34px rgba(8,26,53,0.08); transition: all 0.25s ease; }
  .lp-arrow:hover { transform: translateY(-50%) translateY(-2px); background: #fff; color: ${BLUE_DARK}; }
  .lp-arrow.left { left: 1.5rem; }
  .lp-arrow.right { right: 1.5rem; }
  .lp-stats { position: relative; z-index: 12; margin-top: -2rem; padding: 0 1.5rem; }
  .lp-stats-inner { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 1rem; background: rgba(255,255,255,0.94); border: 1px solid rgba(22,119,255,0.1); border-radius: 28px; box-shadow: 0 26px 52px rgba(8,26,53,0.08); padding: 1.25rem; }
  .lp-stat-card { border-radius: 20px; padding: 1.2rem 1rem; text-align: center; background: linear-gradient(180deg, #FFFFFF 0%, #F4FAFF 100%); border: 1px solid rgba(22,119,255,0.08); }
  .lp-stat-num { color: ${NAVY}; font-size: 2rem; font-weight: 900; }
  .lp-stat-label { color: #71829A; font-size: 0.82rem; font-weight: 700; margin-top: 0.25rem; }
  .lp-features, .lp-ships-section, .lp-foods-section { padding: 5.5rem 1.5rem; }
  .lp-foods-section { background: linear-gradient(180deg, #F6FBFF 0%, #FFFFFF 100%); }
  .lp-section-shell { max-width: 1180px; margin: 0 auto; }
  .lp-section-header { text-align: center; margin-bottom: 3rem; }
  .lp-section-label { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.55rem 1rem; border-radius: 999px; background: rgba(22,119,255,0.08); color: ${BLUE_DARK}; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
  .lp-divider { width: 64px; height: 4px; border-radius: 999px; background: linear-gradient(90deg, ${BLUE}, ${MINT}); margin: 1rem 0 1.25rem; }
  .lp-divider.center { margin-left: auto; margin-right: auto; }
  .lp-section-title { font-size: clamp(2rem, 4vw, 3.15rem); font-weight: 900; color: ${NAVY}; line-height: 1.1; letter-spacing: -0.04em; margin-bottom: 0.85rem; }
  .lp-section-sub { max-width: 620px; color: #66778F; font-size: 1rem; line-height: 1.8; }
  .lp-features-grid, .lp-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.35rem; }
  .lp-card, .lp-feature-card { background: rgba(255,255,255,0.96); border: 1px solid rgba(22,119,255,0.1); border-radius: 26px; box-shadow: 0 22px 44px rgba(8,26,53,0.07); transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease; }
  .lp-card:hover, .lp-feature-card:hover { transform: translateY(-8px); border-color: rgba(22,119,255,0.2); box-shadow: 0 30px 56px rgba(8,26,53,0.12); }
  .lp-feature-card { padding: 2rem 1.75rem; }
  .lp-feature-icon { width: 58px; height: 58px; border-radius: 18px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(22,119,255,0.14), rgba(31,199,182,0.2)); color: ${BLUE_DARK}; font-size: 1.55rem; margin-bottom: 1.1rem; }
  .lp-feature-card h3 { color: ${NAVY}; font-size: 1.08rem; font-weight: 800; margin-bottom: 0.45rem; }
  .lp-feature-card p { color: #6D7E95; font-size: 0.92rem; line-height: 1.75; }
  .lp-card { cursor: pointer; overflow: hidden; }
  .lp-card-img { position: relative; height: 220px; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; overflow: hidden; }
  .lp-card-img::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 68%, rgba(8,26,53,0.08) 100%); }
  .lp-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s ease; }
  .lp-card:hover .lp-card-img img { transform: scale(1.05); }
  .lp-card-img-ship { background: linear-gradient(135deg, #D7EAFF 0%, #B6D4FF 100%); }
  .lp-card-img-food { background: linear-gradient(135deg, #DCF9F4 0%, #BAF0E6 100%); }
  .lp-card-body { padding: 1.4rem 1.4rem 1.5rem; }
  .lp-card-title { color: ${NAVY}; font-size: 1.08rem; font-weight: 800; margin-bottom: 0.4rem; }
  .lp-card-meta { color: #71829A; font-size: 0.9rem; line-height: 1.75; }
  .lp-card-footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-top: 1.1rem; }
  .lp-card-price { color: ${BLUE_DARK}; font-size: 1.38rem; font-weight: 900; letter-spacing: -0.02em; }
  .lp-card-price.mint { color: ${MINT_DARK}; }
  .lp-badge { display: inline-flex; align-items: center; justify-content: center; padding: 0.45rem 0.8rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; white-space: nowrap; }
  .lp-badge-success { background: #E9FCF8; color: ${MINT_DARK}; }
  .lp-badge-danger { background: #FFF1F0; color: #D9363E; }
  .lp-loading { min-height: 140px; display: flex; align-items: center; justify-content: center; gap: 0.75rem; color: #6B7A90; font-size: 1rem; padding: 3rem; }
  .lp-spinner { width: 24px; height: 24px; border: 3px solid ${BLUE_LIGHT}; border-top-color: ${BLUE}; border-radius: 50%; animation: spin 0.8s linear infinite; }
  .lp-cta { padding: 2rem 1.5rem 5.5rem; }
  .lp-cta-shell { max-width: 1180px; margin: 0 auto; padding: 3rem; border-radius: 32px; position: relative; overflow: hidden; background: linear-gradient(135deg, #0B3D91 0%, #1677FF 50%, #1FC7B6 100%); box-shadow: 0 30px 64px rgba(15,79,200,0.24); text-align: center; }
  .lp-cta-shell::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 30%), linear-gradient(180deg, transparent, rgba(255,255,255,0.06)); }
  .lp-cta h2, .lp-cta p, .lp-cta-actions { position: relative; z-index: 1; }
  .lp-cta h2 { color: #fff; font-size: clamp(2rem, 4vw, 3.15rem); font-weight: 900; letter-spacing: -0.04em; margin-bottom: 0.9rem; }
  .lp-cta p { max-width: 640px; margin: 0 auto 2rem; color: rgba(255,255,255,0.84); font-size: 1rem; line-height: 1.85; }
  .lp-cta-actions { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
  .lp-cta-btn { border: none; border-radius: 16px; padding: 1rem 2rem; background: #fff; color: ${BLUE_DARK}; font-size: 0.98rem; font-weight: 800; cursor: pointer; }
  .lp-cta-btn.lp-cta-btn-alt { background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.34); box-shadow: none; }
  .lp-footer { background: ${NAVY}; padding: 4rem 1.5rem 2rem; }
  .lp-footer-inner { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1.15fr repeat(3, minmax(0,1fr)); gap: 2rem; padding-bottom: 2rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .lp-footer-brand p { max-width: 280px; margin-top: 0.9rem; color: rgba(214,224,238,0.74); font-size: 0.92rem; line-height: 1.8; }
  .lp-footer-links h4 { color: #fff; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem; }
  .lp-footer-links ul { list-style: none; }
  .lp-footer-links li { margin-bottom: 0.65rem; }
  .lp-footer-links a { color: rgba(214,224,238,0.72); text-decoration: none; font-size: 0.92rem; transition: color 0.2s ease; }
  .lp-footer-links a:hover { color: #fff; }
  .lp-footer-copy { color: #8FA6C0; font-size: 0.82rem; text-align: center; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 1100px) { .lp-hero-content { grid-template-columns: 1fr; } .lp-hero-main { max-width: 100%; } .lp-stats-inner { grid-template-columns: repeat(2, minmax(0,1fr)); } .lp-footer-inner { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  @media (max-width: 767px) { .lp-navbar { height: auto; padding-top: 0.9rem; padding-bottom: 0.9rem; flex-direction: column; gap: 0.9rem; } .lp-navbar-brand, .lp-navbar-actions { width: 100%; justify-content: center; flex-wrap: wrap; } .lp-hero { padding-top: 10.5rem; } .lp-hero-actions, .lp-cta-actions { flex-direction: column; } .lp-btn-primary, .lp-btn-outline, .lp-hero-btn-main, .lp-hero-btn-ghost, .lp-cta-btn { width: 100%; } .lp-hero-metrics, .lp-hero-panel-grid, .lp-stats-inner, .lp-footer-inner { grid-template-columns: 1fr; } .lp-arrow { display: none; } .lp-cta-shell { padding: 2rem 1.35rem; border-radius: 24px; } }
`

const FeatureCard = ({icon, title, desc}: {icon: string; title: string; desc: string}) => (
  <div className='lp-feature-card'>
    <div className='lp-feature-icon'>{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
)

const LandingPageShipsFoodsPage = () => {
  const navigate = useNavigate()
  const {auth, currentUser} = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [ships, setShips] = useState<any[]>([])
  const [foods, setFoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const links: HTMLLinkElement[] = []
    const addLink = (attrs: Record<string, string>) => {
      const element = document.createElement('link')
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
      document.head.appendChild(element)
      links.push(element)
    }

    addLink({rel: 'preconnect', href: 'https://fonts.googleapis.com'})
    addLink({rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: ''})
    addLink({
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Noto+Serif+Lao:wght@100..900&display=swap',
    })

    return () => links.forEach((element) => element.remove())
  }, [])

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

  return (
    <div className='lp-root'>
      <style>{styles}</style>

      <nav className='lp-navbar'>
        <a className='lp-navbar-brand' href='/'>
          <div className='lp-navbar-logo'>
            <img src='media/logos/sys.jpeg' alt='Logo' style={{width: '100%', height: '100%'}} />
          </div>
          <div>
            <div className='lp-navbar-title'>JoVa ທະເລລາວ</div>
            <div className='lp-navbar-subtitle'>Cruise &amp; Dining Experience</div>
          </div>
        </a>

        <div className='lp-navbar-actions'>
          {isLoggedIn ? (
            <>
              <button className='lp-btn-outline' onClick={() => handleBookingClick('food')}>
                ຈອງອາຫານ
              </button>
              <button className='lp-btn-primary' onClick={() => handleBookingClick('ship')}>
                ຈອງເຮືອ
              </button>
            </>
          ) : (
            <>
              <button className='lp-btn-outline' onClick={() => navigate('/auth/login')}>
                ເຂົ້າສູ່ລະບົບ
              </button>
              <button className='lp-btn-primary' onClick={() => navigate('/auth/registration')}>
                ສະໝັກໃຊ້
              </button>
            </>
          )}
        </div>
      </nav>

      <section className='lp-hero'>
        {images.map((image, index) => (
          <div
            key={image.url}
            className={`lp-hero-slide${currentImageIndex === index ? ' is-active' : ''}`}
            style={{
              backgroundImage: `url('${image.url}')`,
              opacity: currentImageIndex === index ? 1 : 0,
            }}
          >
            <div className='lp-hero-overlay' />
          </div>
        ))}

        <div className='lp-hero-content'>
          <div className='lp-hero-main'>
            <div className='lp-hero-chip'>
              <span className='lp-hero-chip-dot' />
              JOVA Cruise Collection
            </div>

            <h1 className='lp-hero-h1'>
              ທ່ອງທ່ຽວ
              <br />
              <span>ທະເລລາວ</span>
            </h1>

            <p className='lp-hero-desc'>
              ພົບກັບປະສົບການລ່ອງເຮືອ ແລະ ການຮັບປະທານອາຫານໃນບັນຍາກາດທີ່ສະອາດ,
              ທັນສະໄໝ ແລະ ເປັນມືອາຊີບ ດ້ວຍທີມງານທີ່ພ້ອມດູແລທຸກລາຍລະອຽດ.
            </p>

            {isLoggedIn ? (
              <div className='lp-hero-actions'>
                <button className='lp-hero-btn-main' onClick={() => handleBookingClick('ship')}>
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M3 20h18' />
                    <path d='M6 16l2-9h8l2 9' />
                    <path d='M9 7V4h6v3' />
                  </svg>
                  ຈອງເຮືອຕອນນີ້
                </button>
                <button className='lp-hero-btn-ghost' onClick={() => handleBookingClick('food')}>
                  ສັ່ງອາຫານ
                </button>
              </div>
            ) : (
              <div className='lp-hero-actions'>
                <button className='lp-hero-btn-main' onClick={() => navigate('/auth/login')}>
                  ເຂົ້າສູ່ລະບົບ
                </button>
                <button className='lp-hero-btn-ghost' onClick={() => navigate('/auth/registration')}>
                  ສ້າງບັນຊີ
                </button>
              </div>
            )}

            <div className='lp-hero-metrics'>
              {heroStats.map((item) => (
                <div key={item.label} className='lp-hero-metric'>
                  <div className='lp-hero-metric-value'>{item.value}</div>
                  <div className='lp-hero-metric-label'>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className='lp-hero-side'>
            <div className='lp-hero-panel'>
              <div className='lp-hero-panel-label'>Featured Experience</div>
              <div className='lp-hero-panel-title'>{images[currentImageIndex].title}</div>
              <div className='lp-hero-panel-text'>{images[currentImageIndex].description}</div>

              <div className='lp-hero-panel-grid'>
                <div className='lp-hero-panel-item'>
                  <strong>Premium</strong>
                  <span>ບັນຍາກາດດີ ແລະ ອອກແບບການເດີນທາງເປັນລະບົບ</span>
                </div>
                <div className='lp-hero-panel-item'>
                  <strong>Fresh Menu</strong>
                  <span>ອາຫານທ້ອງຖິ່ນ ແລະ ເມນູທັນສະໄໝໃນໂທນ mint</span>
                </div>
              </div>
            </div>

            <div className='lp-hero-glass'>
              <h3>{isLoggedIn ? 'ພ້ອມສຳລັບການຈອງ' : 'ເລີ່ມຕົ້ນໄດ້ທັນທີ'}</h3>
              <p>
                {isLoggedIn
                  ? 'ເລືອກເຮືອ ຫຼື ເລືອກອາຫານໄດ້ເລີຍ ດ້ວຍຂັ້ນຕອນຈອງທີ່ຊັດເຈນ.'
                  : 'ເຂົ້າສູ່ລະບົບເພື່ອຈອງເຮືອ, ສັ່ງອາຫານ ແລະ ຈັດການການເດີນທາງຂອງທ່ານ.'}
              </p>
            </div>
          </div>
        </div>

        <button className='lp-arrow left' onClick={prevImage} aria-label='Previous'>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'>
            <polyline points='15 18 9 12 15 6' />
          </svg>
        </button>
        <button className='lp-arrow right' onClick={nextImage} aria-label='Next'>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'>
            <polyline points='9 18 15 12 9 6' />
          </svg>
        </button>

        <div className='lp-dots'>
          {images.map((_, index) => (
            <button
              key={index}
              className={`lp-dot${index === currentImageIndex ? ' active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className='lp-stats'>
        <div className='lp-stats-inner'>
          {platformStats.map((item) => (
            <div key={item.label} className='lp-stat-card'>
              <div className='lp-stat-num'>{item.num}</div>
              <div className='lp-stat-label'>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className='lp-features'>
        <div className='lp-section-shell'>
          <div className='lp-section-header'>
            <span className='lp-section-label'>ເປັນຫຍັງຕ້ອງເລືອກເຮົາ</span>
            <div className='lp-divider center' />
            <h2 className='lp-section-title'>ບໍລິການທີ່ເປັນມືອາຊີບ</h2>
            <p className='lp-section-sub' style={{margin: '0 auto'}}>
              ປະສົບການທ່ອງທ່ຽວທາງນ້ຳທີ່ຖືກຈັດລະບຽບດີ ແລະ ມີມາດຕະຖານການບໍລິການຊັດເຈນ.
            </p>
          </div>

          <div className='lp-features-grid'>
            <FeatureCard
              icon='🏝️'
              title='ສະຖານທີ່ສວຍງາມ'
              desc='ລ່ອງເຮືອຜ່ານບັນຍາກາດທີ່ສະຫງົບ ແລະ ຈຸດທ່ອງທ່ຽວສຳຄັນ.'
            />
            <FeatureCard
              icon='⭐'
              title='ບໍລິການລະດັບພຣີເມຍມ'
              desc='ທີມງານມືອາຊີບຄອຍແລການຈອງ, ການຂຶ້ນເຮືອ ແລະ ການໃຫ້ບໍລິການ.'
            />
            <FeatureCard
              icon='💠'
              title='ໂທນທັນສະໄໝ'
              desc='ອອກແບບການໃຊ້ງານໃຫ້ອ່ານງ່າຍ ສະອາດ ແລະ ດູນ່າເຊື່ອຖື.'
            />
            <FeatureCard
              icon='🛡️'
              title='ຄວາມປອດໄພ'
              desc='ເຮືອ ແລະ ຂັ້ນຕອນບໍລິການຖືກຈັດການໃຫ້ມີຄວາມພ້ອມໃນທຸກທຣິບ.'
            />
          </div>
        </div>
      </section>

      <section className='lp-ships-section'>
        <div className='lp-section-shell'>
          <div className='lp-section-header'>
            <span className='lp-section-label'>ເຮືອຂອງເຮົາ</span>
            <div className='lp-divider center' />
            <h2 className='lp-section-title'>ເລືອກເຮືອທ່ອງທ່ຽວ</h2>
            <p className='lp-section-sub' style={{margin: '0 auto', textAlign: 'center'}}>
              ເຮືອທຸກລຳຖືກຈັດວາງຂໍ້ມູນໃຫ້ເຫັນຊັດ ເພື່ອໃຫ້ຕັດສິນໃຈໄດ້ໄວ ແລະ ແມ່ນຍຳ.
            </p>
          </div>

          {loading ? (
            <div className='lp-loading'>
              <div className='lp-spinner' /> ກຳລັງໂຫຼດຂໍ້ມູນ...
            </div>
          ) : ships.length > 0 ? (
            <div className='lp-cards-grid'>
              {ships.map((ship) => (
                <div key={ship.id} className='lp-card' onClick={() => handleBookingClick('ship')}>
                  <div className='lp-card-img lp-card-img-ship'>
                    {ship.image_url ? (
                      <img src={ship.image_url} alt={ship.ship_name || ship.name} />
                    ) : (
                      '🚢'
                    )}
                  </div>

                  <div className='lp-card-body'>
                    <div className='lp-card-title'>{ship.ship_name || ship.name}</div>
                    <div className='lp-card-meta'>ຄວາມຈຸ {ship.capacity} ຄົນ</div>
                    <div className='lp-card-footer'>
                      <span className='lp-card-price'>{ship.price?.toLocaleString()} ₭</span>
                      <span
                        className={`lp-badge ${
                          ship.status === 'Active' ? 'lp-badge-success' : 'lp-badge-danger'
                        }`}
                      >
                        {ship.status === 'Active' ? 'ພ້ອມໃຫ້ບໍລິການ' : 'ບໍ່ວ່າງ'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='lp-loading'>ບໍ່ມີເຮືອ ກະລຸນາກັບມາໃນພາຍຫຼັງ</div>
          )}
        </div>
      </section>

      <section className='lp-foods-section'>
        <div className='lp-section-shell'>
          <div className='lp-section-header'>
            <span className='lp-section-label'>ອາຫານ</span>
            <div className='lp-divider center' />
            <h2 className='lp-section-title'>ເມນູອາຫານ</h2>
            <p className='lp-section-sub' style={{margin: '0 auto', textAlign: 'center'}}>
              ເມນູອາຫານທ້ອງຖິ່ນ ແລະ ຊີຟູ້ດສົດໃໝ່ ພ້ອມສັ່ງຄວບຄູ່ກັບການລ່ອງເຮືອ.
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
                  key={food.product_id || food.id || food.name}
                  className='lp-card'
                  onClick={() => handleBookingClick('food')}
                >
                  <div className='lp-card-img lp-card-img-food'>
                    {food.image ? <img src={food.image} alt={food.name} /> : '🍜'}
                  </div>

                  <div className='lp-card-body'>
                    <div className='lp-card-title'>{food.name}</div>
                    <div className='lp-card-meta'>ປະເພດ {food.category_id || 'ທົ່ວໄປ'}</div>
                    <div className='lp-card-footer'>
                      <span className='lp-card-price mint'>{food.price?.toLocaleString()} ₭</span>
                      <span
                        className={`lp-badge ${
                          food.availability ? 'lp-badge-success' : 'lp-badge-danger'
                        }`}
                      >
                        {food.availability ? 'ພ້ອມສັ່ງ' : 'ສິນຄ້າໝົດ'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='lp-loading'>ບໍ່ມີອາຫານ ກະລຸນາກັບມາໃນພາຍຫຼັງ</div>
          )}
        </div>
      </section>

      <section className='lp-cta'>
        <div className='lp-cta-shell'>
          <h2>ພ້ອມເລີ່ມການເດີນທາງແບບໃໝ່ບໍ?</h2>
          <p>
            ຈອງເຮືອ ແລະ ສັ່ງອາຫານໄດ້ທັນທີ ດ້ວຍໜ້າຈໍທີ່ຈັດວາງຊັດເຈນ ແລະ
            ພ້ອມສຳລັບການໃຊ້ງານຈິງ.
          </p>

          {isLoggedIn ? (
            <div className='lp-cta-actions'>
              <button className='lp-cta-btn' onClick={() => handleBookingClick('ship')}>
                ຈອງເຮືອ
              </button>
              <button
                className='lp-cta-btn lp-cta-btn-alt'
                onClick={() => handleBookingClick('food')}
              >
                ສັ່ງອາຫານ
              </button>
            </div>
          ) : (
            <div className='lp-cta-actions'>
              <button className='lp-cta-btn' onClick={() => navigate('/auth/login')}>
                ເຂົ້າສູ່ລະບົບ
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className='lp-footer'>
        <div className='lp-footer-inner'>
          <div className='lp-footer-brand'>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <div className='lp-navbar-logo' style={{width: 40, height: 40}}>
                <span style={{fontSize: '1.05rem'}}>🚢</span>
              </div>
              <span style={{color: '#fff', fontWeight: 800, fontSize: '1rem'}}>JoVa ທະເລລາວ</span>
            </div>
            <p>ບໍລິການທ່ອງທ່ຽວທາງນ້ຳ ແລະ ອາຫານຄັດສັນທີ່ສະອາດ ແລະ ທັນສະໄໝ.</p>
          </div>

          <div className='lp-footer-links'>
            <h4>ບໍລິການ</h4>
            <ul>
              <li><a href='#'>ຈອງເຮືອ</a></li>
              <li><a href='#'>ສັ່ງອາຫານ</a></li>
              <li><a href='#'>ແພັກເກດທ່ອງທ່ຽວ</a></li>
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
              <li><a href='#'>ວຽງຈັນ, ລາວ</a></li>
              <li><a href='#'>+856 20 55588558</a></li>
              <li><a href='#'>info@laosea.la</a></li>
            </ul>
          </div>
        </div>

        <div className='lp-footer-copy'>© 2025 JoVa ທະເລລາວ. ສະຫງວນລິຂະສິດ.</div>
      </footer>
    </div>
  )
}

export {LandingPageShipsFoodsPage}
