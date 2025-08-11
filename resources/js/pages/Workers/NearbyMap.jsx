import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix de iconos
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: marker2x, iconUrl: marker, shadowUrl: shadow });

export default function NearbyMap({ auth }) {
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [center, setCenter] = useState({ lat: 18.4861, lng: -69.9312 });
  const [radiusKm, setRadiusKm] = useState(5);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('nearby-map').setView([center.lat, center.lng], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
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

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([center.lat, center.lng]);
    }
    if (circleRef.current) {
      circleRef.current.setLatLng([center.lat, center.lng]);
      circleRef.current.setRadius(radiusKm * 1000);
    }

    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });

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
    if (!mapRef.current) return;
    setLoadingData(true);
    setError('');

    try {
      const res = await fetch(`/api/nearby-workers?lat=${lat}&lng=${lng}&radius=${rKm}`);
      if (!res.ok) throw new Error('No se pudieron cargar los trabajadores cercanos');
      const data = await res.json();

      setCount(data.length);
      const group = markersRef.current;
      group.clearLayers();

      data.forEach((w) => {
        if (w.latitude == null || w.longitude == null) return;
        const m = L.marker([w.latitude, w.longitude]);
        const html = `
          <div style="font-size: 12px;">
            <div style="font-weight: 600;">${(w.first_name ?? '')} ${(w.last_name ?? '')}</div>
            ${w.specialty ? `<div>${w.specialty}</div>` : ''}
            ${w.city ? `<div>${w.city}${w.province ? ', ' + w.province : ''}</div>` : ''}
            ${w.distance != null ? `<div>Distancia: ${Number(w.distance).toFixed(2)} km</div>` : ''}
            ${w.phone ? `<div>Tel: ${w.phone}</div>` : ''}
          </div>
        `;
        m.bindPopup(html);
        group.addLayer(m);
      });
    } catch (e) {
      setError(e.message || 'Error desconocido');
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Trabajadores cercanos" />

      <div className="max-w-6xl mx-auto p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
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
            {loadingData ? 'Cargando…' : `${count} resultados`}
          </span>

          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>

        <div
          id="nearby-map"
          style={{ height: '70vh', width: '100%' }}
          className="rounded shadow overflow-hidden"
        />
      </div>
    </AuthenticatedLayout>
  );
}
