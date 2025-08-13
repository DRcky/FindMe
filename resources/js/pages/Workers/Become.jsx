import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Become({ auth, specialties = [] }) {
  const { data, setData, post, processing, errors } = useForm({ specialty_id: '' });
  const submit = (e) => {
    e.preventDefault();
    post(route('workers.become.store'));
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Convertirme en especialista" />
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Publicar mis servicios</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Especialidad</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={data.specialty_id}
              onChange={(e) => setData('specialty_id', e.target.value)}
            >
              <option value="">Selecciona…</option>
              {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.specialty_id && <div className="text-red-600 text-sm mt-1">{errors.specialty_id}</div>}
          </div>
          <button
            type="submit"
            disabled={processing || !data.specialty_id}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            Guardar
          </button>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
