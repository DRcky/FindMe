import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Profile({ auth, worker }) {
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title={`Perfil de ${worker.user.first_name}`} />

      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">
          {worker.user.first_name} {worker.user.last_name}
        </h1>
        {worker.specialty && (
          <p className="text-gray-700 mb-2">
            Especialidad: <span className="font-medium">{worker.specialty.name}</span>
          </p>
        )}
        {worker.user.city && (
          <p className="text-gray-700 mb-2">
            Ubicación: {worker.user.city}, {worker.user.province}
          </p>
        )}
        {worker.user.phone && (
          <p className="text-gray-700 mb-2">
            Teléfono: {worker.user.phone}
          </p>
        )}
        {worker.user.email && (
          <p className="text-gray-700 mb-4">
            Email: {worker.user.email}
          </p>
        )}

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
