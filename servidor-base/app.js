// Importa el framework Express.
const express = require("express");

//Usa la configuración de dotnev para leer las variables de entorno
require('dotenv').config();

// Importa el módulo 'os' incluido en Node.js.
// Se utilizará para obtener el nombre interno del contenedor.
const os = require("os");

// Crea la aplicación web.
const app = express();

// Define el puerto interno en el que escuchará el servidor.
// Si existe la variable de entorno PORT, usa ese valor.
const PORT = process.env.PUERTO_NODOS;

// Obtiene el nombre lógico del nodo desde una variable de entorno.
// Docker Compose proporcionará y sobreescribirá valores como:
// "Nodo 1", "Nodo 2" y "Nodo 3".
const NODE_NAME = process.env.NODE_NAME;

// Contador local de solicitudes.
// Cada contenedor mantiene su propio contador.
// Esto permitirá observar cuántas solicitudes recibió cada nodo.
let requestCount = 0;

// Desactiva el encabezado que identifica a Express.
// No es indispensable para el laboratorio, pero evita exponer
// información innecesaria sobre la tecnología utilizada.
app.disable("x-powered-by");

// Middleware que se ejecuta antes de cada ruta.
//
// Agrega encabezados para evitar que el navegador guarde
// la respuesta en caché. Así, cada vez que el estudiante
// actualice la página, se generará una nueva solicitud
// que deberá pasar nuevamente por el balanceador.
app.use((request, response, next) => {
  response.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  // Continúa con la siguiente función.
  next();
});

// Ruta principal del servidor.
//
// Cuando se accede a "/", el servidor incrementa su contador
// y devuelve información que permite identificar qué nodo
// atendió la solicitud.
app.get("/", (request, response) => {
  // Incrementa el contador propio de este nodo.
  requestCount++;

  // Envía una respuesta en formato JSON.
  response.json({
    mensaje: "Solicitud procesada correctamente",

    // Nombre lógico definido en Docker Compose.
    nodo: NODE_NAME,

    // Nombre interno asignado al contenedor.
    contenedor: os.hostname(),

    // Número de solicitudes procesadas por este nodo.
    solicitudesProcesadas: requestCount,

    // Fecha y hora exactas de la respuesta.
    fechaHora: new Date().toISOString(),

    // Dirección IP desde la que llegó la solicitud.
    // En este laboratorio normalmente será la dirección
    // del contenedor NGINX.
    cliente: request.ip,
  });
});

// Ruta de verificación.
//
// Permite comprobar que el nodo está funcionando.
// Más adelante podría utilizarse para implementar
// verificaciones de salud más avanzadas.
app.get("/health", (request, response) => {
  response.status(200).json({
    estado: "OK",
    nodo: NODE_NAME,
    contenedor: os.hostname(),
  });
});

// Inicia el servidor.
//
// "0.0.0.0" permite que la aplicación acepte conexiones
// procedentes de otros contenedores de la red Docker.
// Usar únicamente "localhost" impediría el acceso desde NGINX.
app.listen(PORT, "0.0.0.0", () => {
  console.log("======================================");
  console.log(`Servidor iniciado: ${NODE_NAME}`);
  console.log(`Contenedor: ${os.hostname()}`);
  console.log(`Puerto interno: ${PORT}`);
  console.log("======================================");
});