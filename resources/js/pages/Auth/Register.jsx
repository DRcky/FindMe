import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        // ubicación inline
        country: '',
        province: '',
        city: '',
        latitude: '',
        longitude: '',
        accuracy_m: '',
    });

    const [locLoading, setLocLoading] = useState(false);
    const [locMsg, setLocMsg] = useState('');

    const handleUseMyLocation = () => {
        setLocMsg('');
        if (!navigator.geolocation) {
            setLocMsg('Tu navegador no soporta geolocalización.');
            return;
        }
        setLocLoading(true);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                setData('latitude', latitude);
                setData('longitude', longitude);
                setData('accuracy_m', Math.round(accuracy * 100) / 100);
                setLocMsg(`Punto capturado: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)} m)`);
                setLocLoading(false);
            },
            (err) => {
                setLocMsg('No se pudo obtener la ubicación (permiso denegado o error).');
                setLocLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-6">
                {/* Nombre */}
                <div>
                    <InputLabel htmlFor="first_name" value="Nombre" />
                    <TextInput
                        id="first_name"
                        name="first_name"
                        value={data.first_name}
                        className="mt-1 block w-full"
                        autoComplete="given-name"
                        onChange={(e) => setData('first_name', e.target.value)}
                        required
                    />
                    <InputError message={errors.first_name} className="mt-2" />
                </div>

                {/* Apellido */}
                <div>
                    <InputLabel htmlFor="last_name" value="Apellido" />
                    <TextInput
                        id="last_name"
                        name="last_name"
                        value={data.last_name}
                        className="mt-1 block w-full"
                        autoComplete="family-name"
                        onChange={(e) => setData('last_name', e.target.value)}
                    />
                    <InputError message={errors.last_name} className="mt-2" />
                </div>

                {/* Teléfono */}
                <div>
                    <InputLabel htmlFor="phone" value="Teléfono" />
                    <TextInput
                        id="phone"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <InputLabel htmlFor="password" value="Contraseña" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirmación */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* Ubicación textual (opcional editable) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <InputLabel htmlFor="country" value="País" />
                        <TextInput
                            id="country"
                            name="country"
                            value={data.country}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('country', e.target.value)}
                        />
                        <InputError message={errors.country} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="province" value="Provincia/Estado" />
                        <TextInput
                            id="province"
                            name="province"
                            value={data.province}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('province', e.target.value)}
                        />
                        <InputError message={errors.province} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="city" value="Ciudad" />
                        <TextInput
                            id="city"
                            name="city"
                            value={data.city}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('city', e.target.value)}
                        />
                        <InputError message={errors.city} className="mt-2" />
                    </div>
                </div>

                {/* Botón para capturar coordenadas exactas */}
                <div className="space-y-2">
                    <PrimaryButton type="button" onClick={handleUseMyLocation} disabled={locLoading}>
                        {locLoading ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
                    </PrimaryButton>
                    {locMsg && <p className="text-sm text-gray-600">{locMsg}</p>}
                    {(data.latitude && data.longitude) && (
                        <p className="text-sm text-gray-700">
                            Coordenadas: {Number(data.latitude).toFixed(6)}, {Number(data.longitude).toFixed(6)}
                            {data.accuracy_m && ` (±${data.accuracy_m} m)`}
                        </p>
                    )}
                    <InputError message={errors.latitude || errors.longitude} className="mt-2" />
                </div>

                {/* Hidden inputs (Inertia envía el estado, pero los dejamos por claridad si renderizas sin JS) */}
                <input type="hidden" name="latitude" value={data.latitude ?? ''} readOnly />
                <input type="hidden" name="longitude" value={data.longitude ?? ''} readOnly />
                <input type="hidden" name="accuracy_m" value={data.accuracy_m ?? ''} readOnly />

                <div className="flex items-center justify-end">
                    <PrimaryButton disabled={processing}>
                        Crear cuenta
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
