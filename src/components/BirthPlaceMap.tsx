import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  lat: number
  lon: number
  /** Fired when the querent drops or drags the pin, or clicks the map. */
  onPick: (lat: number, lon: number) => void
}

// A self-contained SVG pin as a divIcon — avoids Leaflet's default marker asset
// paths, which break under a bundler without extra copy-plugin wiring.
const pin = L.divIcon({
  className: 'vedin-map-pin',
  html:
    '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 22s7-6.2 7-12A7 7 0 0 0 5 10c0 5.8 7 12 7 12Z" fill="#a855f7" stroke="#facc15" stroke-width="1.4"/>' +
    '<circle cx="12" cy="10" r="2.6" fill="#facc15"/></svg>',
  iconSize: [30, 30],
  iconAnchor: [15, 28],
})

/** Keep the view centred on the resolved coordinates (e.g. after a city search). */
function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true })
  }, [lat, lon]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

/** Clicking anywhere on the map drops the pin there. */
function ClickToPick({ onPick }: { onPick: Props['onPick'] }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

/**
 * Birth-place map (CARTO dark tiles, no API token) with a draggable pin. Lazy-loaded
 * so Leaflet (~150 kB + CSS) only enters the bundle on the "Where" step. The exact
 * lat/lon it emits is what drives the timezone via tz-lookup in the parent.
 */
export default function BirthPlaceMap({ lat, lon, onPick }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/12">
      <MapContainer center={[lat, lon]} zoom={9} scrollWheelZoom={false} style={{ height: '16rem', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <Marker
          position={[lat, lon]}
          icon={pin}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng()
              onPick(p.lat, p.lng)
            },
          }}
        />
        <Recenter lat={lat} lon={lon} />
        <ClickToPick onPick={onPick} />
      </MapContainer>
    </div>
  )
}
