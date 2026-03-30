import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { tripApi } from '../../entities/trip/api/tripApi'
import { getVisitedCountries, addVisitedCountry, removeVisitedCountry, syncCountriesFromTrips } from '../../entities/user/api/userApi'
import { VisitedCountries } from '../VisitedCountries/VisitedCountries'
import styles from './TravelDiary.module.css'

const FILTER_TYPES = [
  { id: 'world',    label: 'Весь мир',    icon: <GlobeIcon /> },
  { id: 'country',  label: 'По странам',  icon: <PinIcon /> },
  { id: 'city',     label: 'По городам',  icon: <CityIcon /> },
]

export function TravelDiary({ userId, isOwnProfile, trips = [] }) {
  const navigate   = useNavigate()
  const mapRef     = useRef(null)
  const leafletRef = useRef(null)
  const [filter,   setFilter]   = useState('world')
  const [countries, setCountries] = useState([])
  const [stats,    setStats]    = useState({ places: 0, countries: 0, cities: 0 })

  // Загружаем посещённые страны
  useEffect(() => {
    getVisitedCountries(userId)
      .then(data => {
        setCountries(data ?? [])
      })
      .catch(() => {})
  }, [userId])

  // Считаем статистику из доступных данных
  useEffect(() => {
    const allPlaces    = trips.reduce((s, t) => s + (t.placesCount ?? 0), 0)

    // Уникальные страны из trips + destinations
    const ccSet = new Set()
    trips.forEach(t => {
      if (t.countryCode) ccSet.add(t.countryCode)
      ;(t.destinations ?? []).forEach(d => { if (d.countryCode) ccSet.add(d.countryCode) })
    })

    // Уникальные города из trips + destinations
    const citySet = new Set()
    trips.forEach(t => {
      if (t.city) citySet.add(t.city)
      ;(t.destinations ?? []).forEach(d => { if (d.city) citySet.add(d.city) })
    })

    setStats({
      places:    allPlaces,
      countries: ccSet.size,
      cities:    citySet.size,
    })
  }, [trips])

  // Инициализируем Leaflet карту
  useEffect(() => {
    if (!mapRef.current) return

    const init = () => {
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
      }

      const L = window.L
      if (!L) return

      const map = L.map(mapRef.current, {
        center: [20, 10],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      leafletRef.current = map
      renderMarkers(map, trips, countries, filter)
    }

    if (window.L) {
      init()
    } else {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = init
      document.head.appendChild(script)
    }

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
      }
    }
  }, [trips, countries, filter])

  const renderMarkers = (map, trips, countries, filterType) => {
    const L = window.L
    if (!L || !map) return

    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer)
    })

    // Координаты стран (приблизительный центр)
    const COUNTRY_COORDS = {
      MD:[47.0,28.9], RO:[45.9,24.9], DE:[51.2,10.4], FR:[46.2,2.2],
      IT:[41.8,12.5], ES:[40.4,-3.7], CZ:[49.8,15.5], AT:[47.5,14.6],
      PL:[51.9,19.1], HU:[47.2,19.5], GB:[55.4,-3.4], NL:[52.1,5.3],
      BE:[50.5,4.5],  PT:[39.4,-8.2], GR:[39.1,21.8], TR:[38.9,35.2],
      UA:[49.0,31.2], RU:[61.5,105.3],US:[37.1,-95.7], CA:[56.1,-106.3],
      MX:[23.6,-102.6],BR:[14.2,-51.9],AR:[38.4,-63.6],JP:[36.2,138.2],
      CN:[35.9,104.2], IN:[20.6,78.9], AU:[25.3,133.8], NZ:[40.9,174.9],
      ZA:[30.6,22.9],  EG:[26.8,30.8], MA:[31.8,-7.1],  AE:[23.4,53.8],
      TH:[15.9,100.9], SG:[1.4,103.8], MY:[4.2,108.0],  ID:[0.8,113.9],
    }

    const markers = []

    if (filterType === 'country' || filterType === 'world') {
      // Маркеры из посещённых стран
      countries.forEach(c => {
        const coords = COUNTRY_COORDS[c.countryCode]
        if (!coords) return
        markers.push({ lat: coords[0], lng: coords[1], label: c.city || c.countryCode })
      })

      // Также из destinations поездок
      trips.forEach(t => {
        ;(t.destinations ?? []).forEach(d => {
          const coords = COUNTRY_COORDS[d.countryCode]
          if (!coords) return
          const exists = markers.find(m => Math.abs(m.lat - coords[0]) < 0.5)
          if (!exists) markers.push({ lat: coords[0], lng: coords[1], label: d.city || d.countryCode })
        })
        if (!t.destinations?.length && t.countryCode) {
          const coords = COUNTRY_COORDS[t.countryCode]
          if (coords) markers.push({ lat: coords[0], lng: coords[1], label: t.city || t.countryCode })
        }
      })
    }

    markers.forEach(({ lat, lng, label }) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:14px;height:14px;
          background:#5B8DEF;border:2.5px solid #fff;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(91,141,239,0.6);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<div style="font-family:system-ui;font-weight:700;font-size:13px;padding:2px 4px;">${label}</div>`, { closeButton: false })
    })

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 })
    }
  }

  // Уникальные страны для фильтра по странам
  const uniqueCountries = [...new Set(trips.map(t => t.countryCode).filter(Boolean))]

  return (
    <div className={styles.wrap}>

      {/* Статистика */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <PersonIcon />
          <div className={styles.statNum}>{stats.places}</div>
          <div className={styles.statLabel}>мест</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <GlobeIcon />
          <div className={styles.statNum}>{stats.countries}</div>
          <div className={styles.statLabel}>стран</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <CityIcon />
          <div className={styles.statNum}>{stats.cities}</div>
          <div className={styles.statLabel}>городов</div>
        </div>
      </div>

      {/* Фильтры */}
      <div className={styles.filterCard}>
        <div className={styles.filterLabel}>Тип фильтра</div>
        <div className={styles.filterBtns}>
          {FILTER_TYPES.map(f => (
            <button
              key={f.id}
              className={`${styles.filterBtn} ${filter === f.id ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
        <div className={styles.filterCount}>
          <PinIcon /> Показано {stats.places} из {stats.places} мест
        </div>
      </div>

      {/* Карта */}
      <div className={styles.mapWrap}>
        <div ref={mapRef} className={styles.map} />
      </div>

      {/* Посещённые страны */}
      <VisitedCountries userId={userId} isOwnProfile={isOwnProfile} />

    </div>
  )
}

// Icons
function GlobeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
}
function PinIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function CityIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="9" width="18" height="12" rx="1"/><path d="M8 9V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4"/><line x1="12" y1="12" x2="12" y2="15"/></svg>
}
function PersonIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}