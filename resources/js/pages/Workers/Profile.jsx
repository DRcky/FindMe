// resources/js/pages/Workers/Profile.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';

// --- Componentes de estrellas ---
function Stars({ value = 0, size = 16 }) {
  return (
    <div className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          className={(i <= value ? 'text-yellow-500' : 'text-gray-300') + ' fill-current me-1'}
        >
          <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.562-.954L10 0l2.95 5.956 6.562.954-4.756 4.635 1.122 6.545z" />
        </svg>
      ))}
    </div>
  );
}

function StarsInput({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          type="button"
          key={i}
          onClick={() => onChange(i)}
          className="focus:outline-none"
          title={`${i} estrella(s)`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 20 20"
            className={(i <= value ? 'text-yellow-500' : 'text-gray-300') + ' fill-current'}
          >
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.562-.954L10 0l2.95 5.956 6.562.954-4.756 4.635 1.122 6.545z" />
          </svg>
        </button>
      ))}
      <span className="text-sm text-gray-600 ms-1">{value}/5</span>
    </div>
  );
}

// --- Página de Perfil ---
export default function Profile({ auth, worker, stats, reviews, isOwner }) {
  const { props } = usePage();

  // Si no pasaste isOwner desde el backend, lo calculamos aquí
  const computedIsOwner = typeof isOwner === 'boolean' ? isOwner : auth?.user?.id === worker?.user_id;

  // Form para reseña
  const { data, setData, post, processing, errors, reset } = useForm({
    rating: 0,
    comment: '',
  });

  const submitReview = (e) => {
    e.preventDefault();
    post(route('reviews.store', worker.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset('comment');
        setData('rating', 0);
      },
    });
  };

  const hireWorker = () => {
    router.post(route('hires.store', worker.id));
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title={`Perfil de ${worker.user.first_name}`} />

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header del perfil */}
        <div className="bg-white rounded shadow p-5">
          <h1 className="text-2xl font-bold">
            {worker.user.first_name} {worker.user.last_name || ''}
          </h1>

          {worker.specialty && (
            <p className="text-gray-700">
              Especialidad: <span className="font-medium">{worker.specialty.name}</span>
            </p>
          )}

          {(worker.user.city || worker.user.province) && (
            <p className="text-gray-700">
              Ubicación: {worker.user.city}
              {worker.user.province ? `, ${worker.user.province}` : ''}
            </p>
          )}

          {worker.user.phone && <p className="text-gray-700">Tel: {worker.user.phone}</p>}
          {worker.user.email && <p className="text-gray-700">Email: {worker.user.email}</p>}

          <div className="mt-3 flex items-center gap-2">
            <Stars value={Math.round(stats?.avg_rating ?? 0)} />
            <span className="text-sm text-gray-600">
              {stats?.avg_rating ? `${stats.avg_rating} / 5` : 'Sin calificaciones'} · {stats?.total ?? 0} reseña(s)
            </span>
          </div>

          {/* Botón CONTRATAR: solo si NO eres el dueño del perfil */}
          {!computedIsOwner && (
            <button
              onClick={hireWorker}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Contratar
            </button>
          )}

          {props.flash?.status && <div className="mt-3 text-sm text-green-700">{props.flash.status}</div>}
        </div>

        {/* Escribir reseña (evitar que el propio especialista se reseñe) */}
        {!computedIsOwner && (
          <div className="bg-white rounded shadow p-5">
            <h2 className="text-lg font-semibold mb-3">Escribir una reseña</h2>
            <form onSubmit={submitReview} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Calificación</label>
                <StarsInput value={data.rating} onChange={(v) => setData('rating', v)} />
                {errors.rating && <div className="text-sm text-red-600 mt-1">{errors.rating}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Comentario (opcional)</label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[90px]"
                  value={data.comment}
                  onChange={(e) => setData('comment', e.target.value)}
                  placeholder="Cuéntanos tu experiencia…"
                  maxLength={2000}
                />
                {errors.comment && <div className="text-sm text-red-600 mt-1">{errors.comment}</div>}
              </div>

              <button
                type="submit"
                disabled={processing || data.rating < 1}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
                title={data.rating < 1 ? 'Selecciona al menos 1 estrella' : 'Enviar reseña'}
              >
                {processing ? 'Enviando…' : 'Enviar reseña'}
              </button>
            </form>
          </div>
        )}

        {/* Reseñas */}
        <div className="bg-white rounded shadow p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Reseñas</h2>
          </div>

          {reviews.data.length === 0 ? (
            <p className="text-gray-500 text-sm">Este especialista aún no tiene reseñas.</p>
          ) : (
            <ul className="divide-y">
              {reviews.data.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Stars value={r.rating} />
                      {r.author && <div className="text-sm text-gray-700 mt-1">{r.author}</div>}
                      {r.created_at && <div className="text-xs text-gray-500">{r.created_at}</div>}
                    </div>
                  </div>
                  {r.comment && <p className="text-gray-800 mt-2">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}

          {/* Paginación */}
          {reviews.links && reviews.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {reviews.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.url || '#'}
                  className={
                    'px-3 py-1 rounded border text-sm ' +
                    (link.active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50')
                  }
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </div>

        <Link
          href={route('workers.map')}
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Volver al mapa
        </Link>
      </div>
    </AuthenticatedLayout>
  );
}
