// resources/js/pages/Workers/NearbyMap.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ===== Icono forzado (a prueba de balas) =====
// Opción con imports (Vite empaca las imágenes)
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker1x from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  popupAnchor: [1, -34],
});

// Helpers
function classNames(...c) { return c.filter(Boolean).join(' '); }
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function explainGeoError(err) {
  if (!err || typeof err.code !== 'number') return 'No pudimos obtener tu ubicación.';
  switch (err.code) {
    case 1: return 'Permiso de ubicación denegado. Habilítalo en los permisos del sitio.';
    case 2: return 'Posición no disponible. Activa GPS/servicios de ubicación e inténtalo de nuevo.';
    case 3: return 'Tiempo de espera agotado al obtener la ubicación.';
    default: return 'No pudimos obtener tu ubicación.';
  }
}

export default function NearbyMap({ auth, specialties = [] }) {
  const { props } = usePage();

  // Paleta (colores del logo)
  const brand = {
    light: '#BFE7FF',
    dark: '#1B4B6B',
    mid: '#2F6F94',
    accent: '#F39A1A',
  };

  // Estado
  const [center, setCenter] = useState({ lat: 18.4861, lng: -69.9312 }); // Santo Domingo por defecto
  const [radiusKm, setRadiusKm] = useState(5);
  const [radiusInput, setRadiusInput] = useState('5'); // input editable
  const [specId, setSpecId] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Refs Leaflet
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const userMarkerRef = useRef(null);
  const circleRef = useRef(null);

  // Inicializa mapa una vez
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map(mapEl.current, {
      center: [center.lat, center.lng],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    circleRef.current = L.circle([center.lat, center.lng], {
      radius: radiusKm * 1000,
      color: brand.mid,
      fillColor: brand.mid,
      fillOpacity: 0.08,
      weight: 1,
    }).addTo(map);

    userMarkerRef.current = L.marker([center.lat, center.lng], {
      title: 'Tu ubicación',
      icon: defaultIcon, // forzado
    }).addTo(map);

    loadWorkers(center.lat, center.lng, radiusKm, specId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantén sincronizado el input visible cuando cambie el valor real
  useEffect(() => {
    setRadiusInput(String(radiusKm));
  }, [radiusKm]);

  // Debounce de lo que escribe el usuario (0.1–100 km)
  useEffect(() => {
    const id = setTimeout(() => {
      const raw = radiusInput.replace(',', '.').trim();
      const val = Number(raw);
      if (!Number.isFinite(val)) return;
      const clamped = clamp(val, 0.1, 100);
      if (clamped !== radiusKm) setRadiusKm(clamped);
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusInput]);

  // Reaccionar a cambios de centro/radio/especialidad
  useEffect(() => {
    if (!mapRef.current) return;

    userMarkerRef.current?.setLatLng([center.lat, center.lng]);
    circleRef.current?.setLatLng([center.lat, center.lng]);
    circleRef.current?.setRadius(radiusKm * 1000);

    mapRef.current.setView([center.lat, center.lng], radiusKm <= 3 ? 14 : 13);
    loadWorkers(center.lat, center.lng, radiusKm, specId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, radiusKm, specId]);

  // Cargar trabajadores cercanos
  const loadWorkers = async (lat, lng, rKm, spec) => {
    setLoading(true);
    setErr('');
    try {
      const qs = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius_km: String(rKm),
        ...(spec ? { specialty_id: String(spec) } : {}),
      });

      // URL absoluta al mismo origen
      const url = new URL('/api/workers/nearby', window.location.origin);
      url.search = qs.toString();

      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin',
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${msg}`);
      }

      const data = await res.json();

      if (!markersRef.current) {
        markersRef.current = L.layerGroup().addTo(mapRef.current);
      } else {
        markersRef.current.clearLayers();
      }

      const mapped = (Array.isArray(data) ? data : (data.data || [])).map((w) => {
        const id = w.worker_id ?? w.id;
        const first = w.user?.first_name ?? w.first_name ?? '';
        const last = w.user?.last_name ?? w.last_name ?? '';
        const name = `${first} ${last}`.trim() || 'Especialista';
        const latW = w.lat ?? w.latitude;
        const lngW = w.lng ?? w.longitude;
        const dist = typeof w.distance_km !== 'undefined' ? Number(w.distance_km) : null;
        const specN = w.specialty?.name ?? w.specialty_name ?? '';
        return { id, name, lat: latW, lng: lngW, distance_km: dist, specialty_name: specN };
      });

      setWorkers(mapped);

      mapped.forEach((w) => {
        if (w.lat == null || w.lng == null) return;
        const mk = L.marker([w.lat, w.lng], { icon: defaultIcon }).addTo(markersRef.current);
        const profileUrl = route('workers.show', w.id);
        mk.bindPopup(`
          <div style="min-width:180px">
            <div style="font-weight:600;color:${brand.dark}">${escapeHtml(w.name)}</div>
            ${w.specialty_name ? `<div style="font-size:12px;color:#475569">${escapeHtml(w.specialty_name)}</div>` : ''}
            ${w.distance_km != null ? `<div style="font-size:12px;color:#475569;margin-top:4px">A ${w.distance_km.toFixed(1)} km</div>` : ''}
            <div style="margin-top:8px">
              <a href="${profileUrl}" style="background:${brand.accent};color:#fff;padding:6px 10px;border-radius:8px;text-decoration:none;">Ver perfil</a>
            </div>
          </div>
        `);
      });
    } catch (e) {
      console.error('loadWorkers error:', e);
      setErr('No se pudieron cargar los trabajadores cercanos.');
    } finally {
      setLoading(false);
    }
  };

  // Usar ubicación del navegador
  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setErr('Tu navegador no soporta geolocalización.');
      return;
    }
    setErr('');
    setIsLocating(true); // <-- empieza animación

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCenter({ lat: latitude, lng: longitude });
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 14, { animate: true });
          userMarkerRef.current?.setLatLng([latitude, longitude]);
          circleRef.current?.setLatLng([latitude, longitude]);
        }
        setIsLocating(false); // <-- termina animación (éxito)
      },
      (error) => {
        setErr(explainGeoError(error));
        console.error('Geolocation error:', error);
        setIsLocating(false); // <-- termina animación (error)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };


  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Mapa de especialistas" />

      {/* Encabezado */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            background: `radial-gradient(1200px 600px at -5% -10%, ${brand.light} 0%, transparent 60%),
                         radial-gradient(900px 500px at 110% -20%, ${brand.accent}33 0%, transparent 60%)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: brand.dark }}>Especialistas cerca de ti</h1>
            <p className="text-gray-700">Usa tu ubicación y filtra por especialidad para ver opciones cercanas.</p>
            {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
          </div>
          <Link
            href={route('dashboard')}
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg font-semibold text-white shadow hover:shadow-md transition"
            style={{ backgroundColor: brand.accent }}
          >
            Ir al dashboard
          </Link>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 flex flex-wrap items-center gap-3">
          <button
            onClick={useMyLocation}
            disabled={isLocating}
            className={classNames(
              "px-4 py-2 rounded-lg font-semibold text-white flex items-center",
              isLocating && "opacity-80 cursor-wait"
            )}
            style={{ backgroundColor: brand.accent }}
          >
            {isLocating ? (
              <>
                <svg className="h-4 w-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                </svg>
                Buscando...
              </>
            ) : (
              "Usar mi ubicación"
            )}
          </button>


          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: brand.mid }}>Radio</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9.,]*"
                className="w-24 border rounded-lg px-3 py-2 text-sm"
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
                onBlur={() => {
                  const raw = radiusInput.replace(',', '.').trim();
                  const val = Number(raw);
                  if (Number.isFinite(val)) {
                    const clamped = clamp(val, 0.1, 100);
                    setRadiusInput(String(clamped));
                    setRadiusKm(clamped);
                  } else {
                    setRadiusInput(String(radiusKm));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
                placeholder="km"
                aria-label="Radio en kilómetros"
              />
              <span className="text-sm text-gray-600">km</span>
            </div>
            <span className="text-xs text-gray-400">(0.1–100)</span>
          </div>

          {specialties.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium" style={{ color: brand.mid }}>Especialidad</label>
              <select
                className="border rounded-lg px-3 py-2 text-sm"
                value={specId}
                onChange={(e) => setSpecId(e.target.value)}
              >
                <option value="">Todas</option>
                {specialties.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {loading && <span className="text-sm text-gray-600">Cargando…</span>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Mapa */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div ref={mapEl} id="map" style={{ height: 520 }} />
            </div>
          </div>

          {/* Lista */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold" style={{ color: brand.dark }}>Cercanos</div>
                <div className="text-sm text-gray-600">{workers.length} resultado(s)</div>
              </div>

              {workers.length === 0 ? (
                <div className="text-sm text-gray-500">No encontramos especialistas con estos filtros.</div>
              ) : (
                <ul className="space-y-3">
                  {workers.map((w) => (
                    <li key={w.id} className="border rounded-lg p-3 hover:shadow-sm transition">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-gray-900">{w.name}</div>
                          {w.specialty_name && (
                            <div className="text-xs text-gray-600">{w.specialty_name}</div>
                          )}
                          {w.distance_km != null && (
                            <div className="text-xs text-gray-500 mt-1">A {w.distance_km.toFixed(1)} km</div>
                          )}
                        </div>
                        <Link
                          href={route('workers.show', w.id)}
                          className="text-sm px-3 py-1 rounded-lg font-semibold text-white"
                          style={{ backgroundColor: brand.accent }}
                        >
                          Ver perfil
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
