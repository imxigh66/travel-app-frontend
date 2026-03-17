import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './PlaceDetailMap.module.css'

function useLeaflet() {
  const [ready, setReady] = useState(!!window.L)
  useEffect(() => {
    if (window.L) { setReady(true); return }
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [])
  return ready
}

function MapInstance({ place, scrollWheel }) {
  const mapRef     = useRef(null)
  const leafletRef = useRef(null)
  const leafletReady = useLeaflet()

  const lat = place?.latitude
  const lng = place?.longitude

  useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletRef.current) return
    if (!lat || !lng) return

    const L = window.L

    leafletRef.current = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: scrollWheel ?? false,
      dragging: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(leafletRef.current)

    const icon = L.divIcon({
      className: '',
      html: `
        <div class="lf-marker lf-marker--active">
          ${place.coverImageUrl
            ? `<img src="${place.coverImageUrl}" class="lf-marker__img" />`
            : `<span class="lf-marker__fallback">📍</span>`
          }
        </div>`,
      iconSize:   [48, 48],
      iconAnchor: [24, 24],
    })

    L.marker([lat, lng], { icon })
      .addTo(leafletRef.current)
      .bindPopup(
        `<div style="font-size:13px;font-weight:700;color:#3d3530;min-width:120px">${place.name}</div>
         <div style="font-size:11px;color:#9e9690;margin-top:2px">${place.address ?? place.city}</div>`,
        { offset: [0, -20] }
      )
      .openPopup()

    return () => {
      leafletRef.current?.remove()
      leafletRef.current = null
    }
  }, [leafletReady, lat, lng, scrollWheel])

  return (
    <>
      {!leafletReady && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      )}
      <div ref={mapRef} className={styles.map} />
    </>
  )
}

export function PlaceDetailMap({ place }) {
  const [expanded, setExpanded] = useState(false)

  const lat = place?.latitude
  const lng = place?.longitude

  if (!lat || !lng) return null

  return (
    <>
      {/* Миниатюра */}
      <div className={styles.wrap} onClick={() => setExpanded(true)}>
        <MapInstance place={place} scrollWheel={false} />

        {/* Оверлей с подсказкой */}
        <div className={styles.expandHint}>
          <ExpandIcon />
          <span>Развернуть</span>
        </div>
      </div>

      {/* Полноэкранный модал */}
      {expanded && (
        <div className={styles.modal} onClick={() => setExpanded(false)}>
          <div className={styles.modalInner} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setExpanded(false)}>
              <CloseIcon />
            </button>
            <div className={styles.modalTitle}>
              <PinIcon /> {place.name}
            </div>
            <div className={styles.modalMap}>
              <MapInstance place={place} scrollWheel={true} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="15 3 21 3 21 9"/>
      <polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}