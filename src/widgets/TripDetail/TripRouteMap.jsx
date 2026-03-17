import { useEffect, useRef, useState } from 'react'
import styles from './TripRouteMap.module.css'

function useLeaflet() {
  const [ready, setReady] = useState(!!window.L)
  useEffect(() => {
    if (window.L) { setReady(true); return }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [])
  return ready
}

export function TripRouteMap({ places }) {
  const mapRef     = useRef(null)
  const leafletRef = useRef(null)
  const leafletReady = useLeaflet()

  const withCoords = places.filter(p => p.latitude && p.longitude)

  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    if (withCoords.length === 0) return

    // Пересоздаём карту при изменении мест
    if (leafletRef.current) {
      leafletRef.current.remove()
      leafletRef.current = null
    }

    const L = window.L

    leafletRef.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(leafletRef.current)

    // Маркеры с номерами
    withCoords.forEach((place, idx) => {
      const orderNum = places.indexOf(place) + 1

      const icon = L.divIcon({
        className: '',
        html: `<div class="tr-marker">${orderNum}</div>`,
        iconSize:   [32, 32],
        iconAnchor: [16, 16],
      })

      L.marker([place.latitude, place.longitude], { icon })
        .addTo(leafletRef.current)
        .bindTooltip(place.name, {
          direction: 'top',
          offset: [0, -18],
          className: 'lf-tooltip',
        })
    })

    // Пунктирная линия между точками
    if (withCoords.length > 1) {
      const latlngs = withCoords.map(p => [p.latitude, p.longitude])
      L.polyline(latlngs, {
        color: '#fdb3a4',
        weight: 2.5,
        opacity: 0.85,
        dashArray: '8, 6',
      }).addTo(leafletRef.current)
    }

    // Подгоняем viewport
    const bounds = L.latLngBounds(withCoords.map(p => [p.latitude, p.longitude]))
    leafletRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })

    return () => {
      leafletRef.current?.remove()
      leafletRef.current = null
    }
  }, [leafletReady, JSON.stringify(withCoords.map(p => p.placeId))])

  if (withCoords.length === 0) return null

  return (
    <div className={styles.wrap}>
      {!leafletReady && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Загрузка карты…</span>
        </div>
      )}
      <div ref={mapRef} className={styles.map} />
    </div>
  )
}