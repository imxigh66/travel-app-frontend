import { useEffect, useRef, useState } from 'react'
import styles from './PlacesMap.module.css'

// Динамически грузим Leaflet через CDN — без npm install
function useLeaflet() {
  const [ready, setReady] = useState(!!window.L)

  useEffect(() => {
    if (window.L) { setReady(true); return }

    // CSS
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [])

  return ready
}

export function PlacesMap({ places, activeId, onMarkerClick }) {
  const mapRef      = useRef(null)   // DOM node
  const leafletRef  = useRef(null)   // L.Map instance
  const markersRef  = useRef({})     // { placeId: L.Marker }
  const leafletReady = useLeaflet()

  // Инициализация карты
  useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletRef.current) return

    const L = window.L

    leafletRef.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(leafletRef.current)

    return () => {
      leafletRef.current?.remove()
      leafletRef.current = null
    }
  }, [leafletReady])

  // Обновляем маркеры при смене places
  useEffect(() => {
    if (!leafletReady || !leafletRef.current) return
    const L   = window.L
    const map = leafletRef.current

    // Убираем старые маркеры
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    const withCoords = places.filter(p => p.latitude && p.longitude)
    if (withCoords.length === 0) return

    withCoords.forEach(place => {
      const isActive = place.placeId === activeId

      // Кастомная иконка — пин с обложкой или цветной круг
      const icon = L.divIcon({
        className: '',
        html: `
          <div class="lf-marker ${isActive ? 'lf-marker--active' : ''}">
            ${place.coverImageUrl
              ? `<img src="${place.coverImageUrl}" class="lf-marker__img" />`
              : `<span class="lf-marker__fallback">${getCategoryEmoji(place.category)}</span>`
            }
          </div>`,
        iconSize:   [isActive ? 48 : 38, isActive ? 48 : 38],
        iconAnchor: [isActive ? 24 : 19, isActive ? 24 : 19],
      })

      const marker = L.marker([place.latitude, place.longitude], { icon })
        .addTo(map)
        .on('click', () => onMarkerClick?.(place))

      // Tooltip с названием
      marker.bindTooltip(place.name, {
        direction: 'top',
        offset: [0, -20],
        className: 'lf-tooltip',
      })

      markersRef.current[place.placeId] = marker
    })

    // Подгоняем viewport под все маркеры
    const bounds = L.latLngBounds(withCoords.map(p => [p.latitude, p.longitude]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })

  }, [leafletReady, places])

  // Подсвечиваем активный маркер при hover в списке
  useEffect(() => {
    if (!leafletReady || !leafletRef.current) return
    const L = window.L

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const place    = places.find(p => p.placeId === Number(id))
      const isActive = Number(id) === activeId

      const icon = L.divIcon({
        className: '',
        html: `
          <div class="lf-marker ${isActive ? 'lf-marker--active' : ''}">
            ${place?.coverImageUrl
              ? `<img src="${place.coverImageUrl}" class="lf-marker__img" />`
              : `<span class="lf-marker__fallback">${getCategoryEmoji(place?.category)}</span>`
            }
          </div>`,
        iconSize:   [isActive ? 48 : 38, isActive ? 48 : 38],
        iconAnchor: [isActive ? 24 : 19, isActive ? 24 : 19],
      })
      marker.setIcon(icon)

      if (isActive) {
        leafletRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.4 })
      }
    })
  }, [activeId, leafletReady])

  return (
    <div className={styles.mapWrap}>
      {!leafletReady && (
        <div className={styles.mapLoading}>
          <div className={styles.mapSpinner} />
          <span>Загрузка карты…</span>
        </div>
      )}
      <div ref={mapRef} className={styles.map} />
    </div>
  )
}

// Вспомогательная — категория → эмодзи
function getCategoryEmoji(category) {
  const map = { 0: '🍜', 1: '🏨', 2: '🏛', 3: '🌿', 4: '🎭', 5: '🛍', 6: '🚉', 7: '🏦' }
  return map[category] ?? '📍'
}