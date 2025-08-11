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

export default function NearbyMap({ auth }) {
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersIndexRef = useRef(new Map()); // worker_id -> marker

  const [center, setCenter] = useState({ lat: 18.4861, lng: -69.9312 });
  const [radiusKm, setRadiusKm] = useState(5);
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

    map.on('click', (e) => {
      setCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Reaccionar a cambios de centro/radio
  useEffect(() => {
    if (!mapRef.current) return;

    // mover marcador del usuario
    userMarkerRef.current?.setLatLng([center.lat, center.lng]);
    // actualizar círculo
    circleRef.current?.setLatLng([center.lat, center.lng]).setRadius(radiusKm * 1000);
    // centrar
    mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom(), { animate: true });

    // cargar trabajadores
    fetchWorkers(center.lat, center.lng, radiusKm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, radiusKm]);

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

  const fetchWorkers = async (lat, lng, rKm) => {
    setLoadingData(true);
    setError('');
    try {
      const res = await fetch(`/api/nearby-workers?lat=${lat}&lng=${lng}&radius=${rKm}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = await res.json();

      // limpiar markers anteriores
      markersLayerRef.current.clearLayers();
      markersIndexRef.current.clear();

      // ordenar por distancia y guardar
      data.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      setWorkers(data);

      // pintar markers y llenar índice (worker_id -> marker)
      data.forEach((w) => {
        if (w.latitude == null || w.longitude == null) return;
        const m = L.marker([w.latitude, w.longitude]);
        const html = `
          <div style="font-size: 12px; line-height: 1.2;">
            <div style="font-weight: 600;">${(w.first_name ?? '')} ${(w.last_name ?? '')}</div>
            ${w.specialty ? `<div>${w.specialty}</div>` : ''}
            ${w.city ? `<div style="color:#555;">${w.city}${w.province ? ', ' + w.province : ''}</div>` : ''}
            ${w.distance != null ? `<div>Distancia: ${Number(w.distance).toFixed(2)} km</div>` : ''}
            ${w.phone ? `<div>Tel: ${w.phone}</div>` : ''}
          </div>
        `;
        m.bindPopup(html);
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

          <span className="text-sm text-gray-600">
            {loadingData ? 'Cargando…' : `${workers.length} resultados`}
          </span>

          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>

      {/* Layout: mapa izquierda, lista derecha */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mapa (ocupa 2/3 en desktop) */}
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
                            {w.city}{w.province ? `, ${w.province}` : ''}
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
