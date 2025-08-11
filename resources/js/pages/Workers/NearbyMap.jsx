// resources/js/Pages/Workers/NearbyMap.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix de iconos Leaflet (Vite)
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: marker2x, iconUrl: marker, shadowUrl: shadow });

export default function NearbyMap({ auth, specialties = [] }) {
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersIndexRef = useRef(new Map()); // worker_id -> marker

  const [center, setCenter] = useState({ lat: 18.4861, lng: -69.9312 }); // Santo Domingo por defecto
  const [radiusKm, setRadiusKm] = useState(5);
  const [specialtyId, setSpecialtyId] = useState(''); // '' = todas
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [workers, setWorkers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Inicializa el mapa una sola vez
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('nearby-map').setView([center.lat, center.lng], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    circleRef.current = L.circle([center.lat, center.lng], {
      radius: radiusKm * 1000,
      color: '#3388ff',
    }).addTo(map);

    userMarkerRef.current = L.marker([center.lat, center.lng]).addTo(map).bindPopup('Estás aquí');

    // Permitir cambiar el centro con click
    map.on('click', (e) => {
      setCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Reaccionar a cambios de centro y radio
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Mover marcador de usuario
    userMarkerRef.current?.setLatLng([center.lat, center.lng]);

    // Actualizar círculo
    circleRef.current?.setLatLng([center.lat, center.lng]).setRadius(radiusKm * 1000);

    // Centrar
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });

    // Cargar trabajadores
    fetchWorkers(center.lat, center.lng, radiusKm, specialtyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, radiusKm]);

  // Reaccionar a cambios de especialidad
  useEffect(() => {
    if (!mapRef.current) return;
    fetchWorkers(center.lat, center.lng, radiusKm, specialtyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialtyId]);

  // Geolocalizar
  const useMyLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingLoc(false);
      },
      () => {
        setError('Permiso denegado o error al obtener ubicación.');
        setLoadingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Traer workers y pintarlos
  const fetchWorkers = async (lat, lng, rKm, specId) => {
    setLoadingData(true);
    setError('');
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius: String(rKm),
      });
      if (specId) params.set('specialty_id', specId);

      const res = await fetch(`/api/nearby-workers?${params.toString()}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = await res.json();

      // Limpiar markers anteriores
      markersLayerRef.current.clearLayers();
      markersIndexRef.current.clear();

      // Ordenar y setear lista
      data.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      setWorkers(data);

      // Pintar markers y llenar índice
      data.forEach((w) => {
        if (w.latitude == null || w.longitude == null) return;

        const popupHtml = `
          <div style="font-size: 12px; line-height: 1.2;">
            <div style="font-weight: 600;">${(w.first_name ?? '')} ${(w.last_name ?? '')}</div>
            ${w.specialty ? `<div>${w.specialty}</div>` : ''}
            ${w.city ? `<div style="color:#555;">${w.city}${w.province ? ', ' + w.province : ''}</div>` : ''}
            ${w.distance != null ? `<div>Distancia: ${Number(w.distance).toFixed(2)} km</div>` : ''}
            ${w.phone ? `<div>Tel: ${w.phone}</div>` : ''}
          </div>
        `;

        const m = L.marker([w.latitude, w.longitude]).bindPopup(popupHtml);
        m.addTo(markersLayerRef.current);
        markersIndexRef.current.set(w.worker_id, m);
      });
    } catch (e) {
      setError(e.message || 'Error al cargar trabajadores');
    } finally {
      setLoadingData(false);
    }
  };

  const focusWorker = (w) => {
    setSelectedId(w.worker_id);
    const marker = markersIndexRef.current.get(w.worker_id);
    if (marker && mapRef.current) {
      mapRef.current.setView([w.latitude, w.longitude], 16, { animate: true });
      marker.openPopup();
    }
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Trabajadores cercanos" />

      {/* Controles arriba */}
      <div className="px-4 py-3 border-b bg-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={loadingLoc}
            className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {loadingLoc ? 'Ubicando…' : 'Usar mi ubicación'}
          </button>

          <label className="text-sm">
            Radio (km):
            <input
              type="number"
              min={1}
              max={100}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Math.max(1, Number(e.target.value || 1)))}
              className="ml-2 w-20 border rounded px-2 py-1"
            />
          </label>

          <label className="text-sm">
            Especialidad:
            <select
              className="ml-2 border rounded px-2 py-1"
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value)}
            >
              <option value="">Todas</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <span className="text-sm text-gray-600">
            {loadingData ? 'Cargando…' : `${workers.length} resultados`}
          </span>

          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>

      {/* Layout: mapa izquierda, lista derecha */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mapa (2/3 en desktop) */}
          <div className="lg:col-span-2">
            <div
              id="nearby-map"
              style={{ height: '70vh', width: '100%' }}
              className="rounded shadow overflow-hidden bg-white"
            />
          </div>

          {/* Lista (1/3 en desktop) */}
          <div className="bg-white rounded shadow h-[70vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b font-semibold">Trabajadores</div>
            <div className="overflow-auto">
              {workers.length === 0 && (
                <div className="p-4 text-sm text-gray-500">No hay trabajadores en este radio.</div>
              )}

              <ul className="divide-y">
                {workers.map((w) => (
                  <li
                    key={w.worker_id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedId === w.worker_id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => focusWorker(w)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">
                          {w.first_name} {w.last_name || ''}
                        </div>
                        {w.specialty && (
                          <div className="text-sm text-gray-700">{w.specialty}</div>
                        )}
                        {(w.city || w.province) && (
                          <div className="text-xs text-gray-500">
                            {w.city}
                            {w.province ? `, ${w.province}` : ''}
                          </div>
                        )}
                      </div>
                      {w.distance != null && (
                        <div className="text-xs text-gray-600 whitespace-nowrap">
                          {Number(w.distance).toFixed(1)} km
                        </div>
                      )}
                    </div>

                    {w.phone && (
                      <div className="text-xs text-gray-600 mt-1">Tel: {w.phone}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
