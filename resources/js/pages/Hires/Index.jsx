import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, asClient = [], asWorker = [] }) {
  const accept = (id) => router.post(route('hires.accept', id));
  const reject = (id) => router.post(route('hires.reject', id));
  const complete = (id) => router.post(route('hires.complete', id));

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Mis contrataciones" />

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Solicitudes para mí (especialista) */}
        <div className="bg-white rounded shadow p-5">
          <h2 className="text-xl font-semibold mb-3">Solicitudes para mí (como especialista)</h2>
          {asWorker.length === 0 ? (
            <p className="text-sm text-gray-500">No tienes solicitudes.</p>
          ) : (
            <ul className="divide-y">
              {asWorker.map(h => (
                <li key={h.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Cliente: {h.client.first_name} {h.client.last_name ?? ''}</div>
                    <div className="text-sm text-gray-600">Estado: {h.status}</div>
                    {h.completed_at && (
                      <div className="text-xs text-emerald-700">Completado: {h.completed_at}</div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {h.status === 'pending' && (
                      <>
                        <button onClick={()=>accept(h.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Aceptar</button>
                        <button onClick={()=>reject(h.id)} className="px-3 py-1 bg-red-600 text-white rounded">Rechazar</button>
                      </>
                    )}

                    {h.status === 'accepted' && (
                      <button
                        onClick={() => complete(h.id)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        title="Marcar como completado"
                      >
                        Completar trabajo
                      </button>
                    )}

                    {h.status === 'completed' && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded">Completado ✔</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mis solicitudes (cliente) */}
        <div className="bg-white rounded shadow p-5">
          <h2 className="text-xl font-semibold mb-3">Mis solicitudes (como cliente)</h2>
          {asClient.length === 0 ? (
            <p className="text-sm text-gray-500">No has contratado a nadie aún.</p>
          ) : (
            <ul className="divide-y">
              {asClient.map(h => (
                <li key={h.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        Especialista: {h.worker.user.first_name} {h.worker.user.last_name ?? ''}
                      </div>
                      <div className="text-sm text-gray-600">Estado: {h.status}</div>
                      {h.completed_at && (
                        <div className="text-xs text-emerald-700">Completado: {h.completed_at}</div>
                      )}
                    </div>
                    <Link href={route('workers.show', h.worker_id)} className="text-sm text-indigo-600 underline">
                      Ver perfil
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
