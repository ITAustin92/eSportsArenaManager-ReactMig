// URL base del API Gateway (Spring Cloud Gateway, puerto 8080).
// Se define con VITE_API_URL en el archivo .env (local) o en las variables del hosting.
// El frontend NUNCA llama directo a un microservicio: todo pasa por el gateway.
const url = import.meta.env?.VITE_API_URL ?? (import.meta.env?.PROD ? '' : 'http://localhost:8080')

export const API_URL = url.replace(/\/$/, '')
