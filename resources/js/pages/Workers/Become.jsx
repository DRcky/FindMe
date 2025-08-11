import { useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

export default function Become({ specialties = [] }) {
  const { data, setData, post, processing, errors } = useForm({ specialty_id: '' });

  const submit = (e) => {
    e.preventDefault();
    post(route('workers.become.store'));
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-4">Convertirme en trabajador</h1>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Especialidad (opcional)</label>
          <select
            value={data.specialty_id}
            onChange={(e) => setData('specialty_id', e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">— Selecciona —</option>
            {specialties.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <InputError message={errors.specialty_id} className="mt-2" />
        </div>

        <div className="flex items-center gap-3">
          <PrimaryButton disabled={processing}>Confirmar</PrimaryButton>
          <Link href={route('dashboard')} className="text-sm text-gray-600 hover:underline">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
