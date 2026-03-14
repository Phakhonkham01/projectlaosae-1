// ShipCardGrid.tsx
import React from 'react'
import { ShipData } from '../../core/ship_models'
import { ShipCard } from './Shipcard'

interface ShipCardGridProps {
  data: ShipData[]
}

/**
 * Responsive card grid using Metronic/Bootstrap grid classes + custom CSS:
 *
 *  < 576px   → 1 card  (col-12)
 *  576–1449px → 2 cards (col-sm-6)
 *  ≥ 1450px  → 4 cards (custom .col-ship-4)
 *  ≥ 2000px  → 4 cards, wider gutters / larger cards (custom .col-ship-xl-4)
 *
 * The two custom breakpoints (1450px and 2000px) are handled via the
 * <style> block below, since Bootstrap's xxl tops out at 1400px.
 */
const ShipCardGrid: React.FC<ShipCardGridProps> = ({ data }) => {
  return (
    <>
      {/* ── Custom responsive overrides ─────────────────────────── */}
      <style>{`
        /* Base: 2 columns from sm (576px) */
        .ship-card-grid .ship-card-col {
          width: 50%;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }

        /* 1 column on xs */
        @media (max-width: 575.98px) {
          .ship-card-grid .ship-card-col {
            width: 100%;
          }
        }

        /* 4 columns at ≥ 1450px */
        @media (min-width: 1450px) {
          .ship-card-grid .ship-card-col {
            width: 25%;
          }
        }

        /* At 2000px+ keep 4 columns but increase gutter for breathing room */
        @media (min-width: 2000px) {
          .ship-card-grid {
            --bs-gutter-x: 2rem;
          }
          .ship-card-grid .ship-card-col {
            width: 25%;
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      <div className='row g-5 ship-card-grid'>
        {data.length === 0 ? (
          <div className='col-12'>
            <div className='d-flex text-center w-100 align-content-center justify-content-center py-10'>
              <span className='text-muted fs-5'>No ships found</span>
            </div>
          </div>
        ) : (
          data.map((ship, index) => (
            <div key={ship.id} className='ship-card-col'>
              <ShipCard ship={ship} index={index} />
            </div>
          ))
        )}
      </div>
    </>
  )
}

export { ShipCardGrid }