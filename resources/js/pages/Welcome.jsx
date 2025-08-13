// resources/js/pages/Welcome.jsx
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, logoUrl = '/images/logo.png' }) {
  // Paleta desde el logo
  const brand = {
    light: '#BFE7FF',      // celeste claro fondo
    dark:  '#1B4B6B',      // azul profundo
    mid:   '#2F6F94',      // azul medio
    accent:'#F39A1A',      // naranja casco
  };

  return (
    <>
      <Head title="FindMe — Encuentra especialistas cerca de ti" />
      <div className="min-h-screen flex flex-col bg-[#E8F5FF]">
        {/* Header */}
        <header
          className="w-full"
          style={{
            background: `linear-gradient(90deg, ${brand.light} 0%, #E8F5FF 60%, #FFFFFF 100%)`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="FindMe"
                className="w-12 h-12 rounded-full shadow-sm"
              />
              <span
                className="text-xl font-bold"
                style={{ color: brand.dark }}
              >
                FindMe
              </span>
            </div>

            <nav className="flex items-center gap-3">
              <Link
                href={route('login')}
                className="px-4 py-2 rounded-md border"
                style={{ borderColor: brand.mid, color: brand.mid }}
              >
                Iniciar sesión
              </Link>
              <Link
                href={route('register')}
                className="px-4 py-2 rounded-md font-semibold text-white"
                style={{ backgroundColor: brand.accent }}
              >
                Crear cuenta
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* fondo decorativo */}
          <div
            className="absolute inset-0 -z-10 opacity-20"
            style={{
              background: `radial-gradient(1000px 600px at 10% -10%, ${brand.light} 0%, transparent 60%),
                           radial-gradient(900px 500px at 110% -20%, ${brand.accent}33 0%, transparent 60%)`,
            }}
          />
          <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1
                className="text-4xl lg:text-5xl font-extrabold leading-tight"
                style={{ color: brand.dark }}
              >
                Encuentra al especialista ideal
                <span className="block" style={{ color: brand.mid }}>
                  cerca de ti, hoy.
                </span>
              </h1>
              <p className="mt-4 text-lg text-gray-700 max-w-xl">
                Electricistas, plomeros, técnicos, manitas y más. Explora perfiles con
                <span className="font-semibold"> reseñas reales</span>, contrata en un clic y
                coordina directo desde la plataforma.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={route('register')}
                  className="px-6 py-3 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition"
                  style={{ backgroundColor: brand.accent }}
                >
                  Comenzar ahora
                </Link>
                <Link
                  href="#como-funciona"
                  className="px-6 py-3 rounded-lg font-semibold border hover:bg-white transition"
                  style={{ borderColor: brand.mid, color: brand.mid }}
                >
                  Ver cómo funciona
                </Link>
              </div>

              {/* Sellos/Confianza */}
              <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand.accent }} />
                  Reseñas verificadas
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand.accent }} />
                  Cerca de tu ubicación
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand.accent }} />
                  Contratación segura
                </div>
              </div>
            </div>

            {/* Lado derecho: ilustración con el logo */}
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-72 h-72 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: brand.accent }} />
              <div className="absolute -bottom-10 -right-8 w-80 h-80 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: brand.mid }} />
              <div className="relative bg-white/60 backdrop-blur rounded-2xl p-6 shadow-lg">
                <img
                  src={logoUrl}
                  alt="FindMe logo"
                  className="w-full h-auto"
                />
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg p-3 bg-white shadow-sm">
                    <div className="text-2xl font-bold" style={{ color: brand.dark }}>10k+</div>
                    <div className="text-xs text-gray-600">Usuarios</div>
                  </div>
                  <div className="rounded-lg p-3 bg-white shadow-sm">
                    <div className="text-2xl font-bold" style={{ color: brand.dark }}>4.8★</div>
                    <div className="text-xs text-gray-600">Promedio reseñas</div>
                  </div>
                  <div className="rounded-lg p-3 bg-white shadow-sm">
                    <div className="text-2xl font-bold" style={{ color: brand.dark }}>2k+</div>
                    <div className="text-xs text-gray-600">Especialistas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-center" style={{ color: brand.dark }}>
              ¿Cómo funciona?
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Tres pasos y listo.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: '1) Regístrate',
                  desc: 'Crea tu cuenta en segundos: correo y contraseña. Sin complicaciones.',
                },
                {
                  title: '2) Busca cerca de ti',
                  desc: 'Activa tu ubicación y descubre especialistas disponibles en tu zona.',
                },
                {
                  title: '3) Contrata en un clic',
                  desc: 'Revisa reseñas, envía solicitud y confirma cuando el trabajo esté completado.',
                },
              ].map((f, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                       style={{ backgroundColor: brand.accent }}>
                    {i + 1}
                  </div>
                  <h3 className="mt-3 font-semibold" style={{ color: brand.mid }}>{f.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href={route('register')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition"
                style={{ backgroundColor: brand.accent }}
              >
                Crear cuenta gratis
              </Link>
              <span className="block mt-2 text-xs text-gray-500">
                ¿Ya tienes cuenta? <Link href={route('login')} className="underline" style={{ color: brand.mid }}>Inicia sesión</Link>
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} FindMe. Todos los derechos reservados.
            </div>
            <div className="text-sm text-gray-600 flex gap-4">
              <a href="#" className="hover:underline">Términos</a>
              <a href="#" className="hover:underline">Privacidad</a>
              <a href="#" className="hover:underline">Contacto</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
