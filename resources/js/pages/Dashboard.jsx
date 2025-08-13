// resources/js/pages/Dashboard.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';

function classNames(...c) { return c.filter(Boolean).join(' '); }

export default function Dashboard({
  auth,
  logoUrl = '/images/logo.png',
  metrics = {},
  isWorker = false,
}) {
  const { props } = usePage();

  // Paleta (colores del logo)
  const brand = {
    light: '#BFE7FF',
    dark:  '#1B4B6B',
    mid:   '#2F6F94',
    accent:'#F39A1A',
  };

  // Métricas con defaults
  const m = {
    myPending:   metrics.myPending ?? 0,
    myAccepted:  metrics.myAccepted ?? 0,
    myCompleted: metrics.myCompleted ?? 0,
    toMePending: metrics.toMePending ?? 0,
    myReviews:   metrics.myReviews ?? 0,
  };

  // Notificaciones (si tu middleware las pasa en props)
  const unread = props.notifications?.unread_count ?? 0;
  const latest = props.notifications?.latest ?? [];

  // Helpers Ziggy: evita errores si la ruta no existe
  const hasRoute = (name) =>
    typeof route === 'function' && route().has && route().has(name);

  const markAllRead = () => {
    const r = hasRoute('notifications.readAll') ? route('notifications.readAll') : null;
    if (!r) return;
    router.post(r, {}, { preserveScroll: true });
  };

  const goMap = () => router.visit(hasRoute('workers.map') ? route('workers.map') : '/workers/map');
  const goHires = () => router.visit(hasRoute('hires.index') ? route('hires.index') : '/hires');
  const goProfile = () => router.visit(hasRoute('profile.edit') ? route('profile.edit') : '/profile');
  const goBecome = () => router.visit(hasRoute('workers.become') ? route('workers.become') : '/workers/become');

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Dashboard" />

      {/* Encabezado / Hero */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            background: `radial-gradient(1200px 600px at -5% -10%, ${brand.light} 0%, transparent 60%),
                         radial-gradient(900px 500px at 110% -20%, ${brand.accent}33 0%, transparent 60%)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="FindMe" className="w-11 h-11 rounded-full shadow-sm" />
                <span className="text-base font-semibold" style={{ color: brand.mid }}>FindMe</span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold" style={{ color: brand.dark }}>
                Hola, {auth?.user?.first_name || auth?.user?.name || '¡bienvenido!'} 👋
              </h1>
              <p className="mt-1 text-gray-700">
                Gestiona tus contrataciones, explora especialistas cercanos y revisa tus notificaciones.
              </p>
            </div>
            <div className="hidden sm:block">
              <button
                onClick={goMap}
                className="inline-flex items-center px-5 py-3 rounded-lg font-semibold text-white shadow hover:shadow-lg transition"
                style={{ backgroundColor: brand.accent }}
              >
                Explorar mapa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <button
            onClick={goMap}
            className="text-left bg-white rounded-xl border hover:shadow-md transition p-4"
          >
            <div className="text-sm text-gray-600">Buscar</div>
            <div className="mt-1 font-semibold" style={{ color: brand.mid }}>Especialistas cercanos</div>
            <div className="mt-2 text-xs text-gray-500">Mapa con filtros por especialidad y radio</div>
          </button>

          <button
            onClick={goHires}
            className="text-left bg-white rounded-xl border hover:shadow-md transition p-4"
          >
            <div className="text-sm text-gray-600">Contrataciones</div>
            <div className="mt-1 font-semibold" style={{ color: brand.mid }}>Mis solicitudes</div>
            <div className="mt-2 text-xs text-gray-500">Revisa estados: pendiente, aceptado, completado</div>
          </button>

          <button
            onClick={goProfile}
            className="text-left bg-white rounded-xl border hover:shadow-md transition p-4"
          >
            <div className="text-sm text-gray-600">Perfil</div>
            <div className="mt-1 font-semibold" style={{ color: brand.mid }}>Editar mis datos</div>
            <div className="mt-2 text-xs text-gray-500">Nombre, contacto y ubicación</div>
          </button>

          {!isWorker ? (
            <button
              onClick={goBecome}
              className="text-left bg-white rounded-xl border hover:shadow-md transition p-4"
            >
              <div className="text-sm text-gray-600">¿Eres especialista?</div>
              <div className="mt-1 font-semibold" style={{ color: brand.mid }}>Publica tus servicios</div>
              <div className="mt-2 text-xs text-gray-500">Elige especialidad y empieza a recibir solicitudes</div>
            </button>
          ) : (
            <button
              onClick={goHires}
              className="text-left bg-white rounded-xl border hover:shadow-md transition p-4"
            >
              <div className="text-sm text-gray-600">Como especialista</div>
              <div className="mt-1 font-semibold" style={{ color: brand.mid }}>Solicitudes para mí</div>
              <div className="mt-2 text-xs text-gray-500">Acepta, rechaza o completa trabajos</div>
            </button>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Mis solicitudes (pendientes)" value={m.myPending} color={brand.mid} />
          <MetricCard title="Mis contrataciones aceptadas" value={m.myAccepted} color={brand.accent} />
          <MetricCard title="Trabajos completados" value={m.myCompleted} color={brand.dark} />
          <MetricCard title="Solicitudes para mí" value={m.toMePending} color={brand.mid} subtitle="(si eres especialista)" />
        </div>
      </div>

      {/* Notificaciones + Siguientes pasos */}
      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notificaciones */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold" style={{ color: brand.dark }}>Notificaciones</div>
              <div className="text-xs text-gray-500">{unread} sin leer</div>
            </div>
            {hasRoute('notifications.readAll') && (
              <button
                onClick={markAllRead}
                className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
                style={{ borderColor: brand.mid, color: brand.mid }}
              >
                Marcar como leídas
              </button>
            )}
          </div>
          <div className="divide-y">
            {latest.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No hay notificaciones recientes.</div>
            ) : latest.map((n) => (
              <div key={n.id} className="p-4 text-sm">
                <div className="font-medium text-gray-800">
                  {n.data?.message ?? 'Notificación'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {n.data?.type === 'hire.requested' && 'Nueva solicitud de contratación'}
                  {n.data?.type === 'hire.accepted' && 'Tu solicitud fue aceptada'}
                  {n.data?.type === 'hire.rejected' && 'Tu solicitud fue rechazada'}
                  {n.data?.type === 'hire.completed' && 'Trabajo marcado como completado'}
                </div>
                <div className="text-xs text-gray-400 mt-1">{n.created_at}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Siguientes pasos */}
        <aside className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-2" style={{ color: brand.dark }}>Siguientes pasos</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="mt-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand.accent }} />
              <span>
                Activa tu ubicación en el mapa para ver <span className="font-medium">especialistas cercanos</span>.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand.accent }} />
              <span>
                Completa tu <button onClick={goProfile} className="underline" style={{ color: brand.mid }}>perfil</button> con teléfono y ciudad.
              </span>
            </li>
            {isWorker ? (
              <li className="flex gap-2">
                <span className="mt-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand.accent }} />
                <span>Revisa <button onClick={goHires} className="underline" style={{ color: brand.mid }}>solicitudes pendientes</button> y marca trabajos como <span className="font-medium">completados</span>.</span>
              </li>
            ) : (
              <li className="flex gap-2">
                <span className="mt-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand.accent }} />
                <span>¿Eres especialista? <button onClick={goBecome} className="underline" style={{ color: brand.mid }}>Publica tus servicios</button> y empieza a recibir contrataciones.</span>
              </li>
            )}
          </ul>
          <div className="mt-4">
            <button
              onClick={goMap}
              className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-white shadow hover:shadow-md transition"
              style={{ backgroundColor: brand.accent }}
            >
              Ir al mapa
            </button>
          </div>
        </aside>
      </div>

      <div className="h-6" />
    </AuthenticatedLayout>
  );
}

function MetricCard({ title, value, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-3xl font-extrabold" style={{ color }}>{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}
