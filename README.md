Guía paso a paso para ejecutar el proyecto FindMe:

Requisitos previos para correr el proyecto:
Instalar en el equipo:
-Node JS
-Laragon
-Composer

Una vez todo instalado:
Paso 1: descargar el proyecto .zip y extraerlo en la ubicacion C:\laragon\www
Paso 2: ejecutar cmd como administrador, luego utilizar el comando cd y pegar la ubicacion del proyecto para ubicarnos en la carpeta del proyecto.
Paso 3: ulitizar el comando *npm install* dentro de la terminal, una vez terminado el proceso, utilizar el comando *composer install*.
Paso 4: Ejecutar laragon, y ejecutar todos los servicios.
Paso 5: Click derecho en la interfaz de Laragon, ejecutar Mysql>phpMyAdmin6. (En caso de no tener instalado el phpMyAdmin, Laragon lo llevará a una página para instalar. En caso de error, puede usar el gestor de base de datos MySql de su preferencia.
Paso 6: Crear una base de datos en blanco llamada *findmedb* (Utilizando el gestor anteriormente mencionado).
Paso 7: Ejecutar en la terminal (Como administrador), el comando *npm run dev*.
Paso 8: Ejecutar otra terminal, y ubicandonos en la carpeta del proyecto, ejecutar el comando *php artisan serve* (Opcional. Pero necesario para utilizar funciones de Geolocalización).
Paso 9: Este ultimo paso dará como respuesta una URL que llevará directo al proyecto. Ingrese mediante el navegador, y el proyecto debería funcionar correctamente.
