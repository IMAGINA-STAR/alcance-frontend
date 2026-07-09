# Alcance — Frontend

App en React que se conecta al backend de Alcance (login, catálogo de espacios, solicitudes, etc.)

## Requisitos

- Node.js 18+ (el mismo que ya instalaste para el backend)
- El backend de Alcance corriendo en `http://localhost:4000` (ver el proyecto `alcance-backend`)

## Instalación

```bash
npm install
cp .env.example .env
```

El `.env` ya trae la URL correcta por defecto (`http://localhost:4000/api`), no necesitas cambiar nada si el backend corre en su puerto normal.

## Correr la app

```bash
npm run dev
```

Te va a dar una URL como `http://localhost:5173` — ábrela en tu navegador.

**Importante:** el backend debe estar corriendo al mismo tiempo (en otra terminal, con `npm run dev` dentro de la carpeta `alcance-backend`), o vas a ver un mensaje de "no se pudo conectar con el servidor".

## Cómo probarlo de principio a fin

1. Entra a la app → te manda a `/login`
2. Clic en "Regístrate" → crea una cuenta de tipo **Influencer** (con categoría y seguidores)
3. Ya adentro, en el dashboard, publica un espacio (ej. "Post en feed", Q300)
4. Cierra sesión y regístrate de nuevo, ahora como **Anunciante**
5. En el catálogo vas a ver el espacio que publicaste — mándale una solicitud
6. Cierra sesión, vuelve a entrar con la cuenta de influencer, y en "Solicitudes recibidas" acéptala o recházala

Con eso confirmas que todo el flujo real (base de datos incluida) está funcionando.

## Estructura

```
src/
  api.js                  → cliente que habla con el backend
  context/AuthContext.jsx → sesión (login/registro/logout, guarda el token)
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    CatalogPage.jsx       → vista anunciante
    DashboardPage.jsx     → vista influencer
  components/
    Topbar.jsx
    Toast.jsx
```
