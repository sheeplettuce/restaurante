# Los Primos y el Aceite

**Plataforma de pedidos y entregas a domicilio*

![Angular](https://img.shields.io/badge/Angular_17-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe_Checkout-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)

---

## Descripcion del proyecto

Los Primos y el Aceite es una aplicacion web de pedidos a domicilio especializada en comida mexicana. El cliente puede explorar el menu, agregar platillos al carrito, ver su ubicacion en un mapa interactivo con la distancia al restaurante, calcular el costo de envio de forma dinamica y pagar en linea mediante Stripe Checkout.

| Capa | Tecnologia |
|---|---|
| Frontend | Angular 17 (standalone components, signals) |
| Backend | Node.js + Express |
| Pagos | Stripe Checkout (modo test) |
| Mapas | Leaflet + OpenStreetMap |
| Geolocalizacion | Geolocation API del navegador |

---

## Requisitos previos

- Node.js >= 18 (incluye npm)
- Angular CLI >= 17 — `npm install -g @angular/cli`
- Una cuenta de Stripe con modo test activado
- Stripe CLI instalada — [descargar aqui](https://docs.stripe.com/stripe-cli)
- Git (opcional, para clonar el repositorio)

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/sheeplettuce/restaurante.git
cd los-primos-y-el-aceite
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd server
npm install
cd ..
```

---

## Configuracion del archivo .env

En la raiz del proyecto hay un archivo llamado `.env`. Abrelo y reemplaza los valores de Stripe con tus llaves propias:

```properties
PORT=4242
FRONTEND_BASE_URL=http://localhost:4200

# Reemplaza con tu llave secreta de Stripe
STRIPE_SECRET_KEY=CLAVE

# Reemplaza con tu secreto de webhook de Stripe
STRIPE_WEBHOOK_SECRET=CLAVE
```

| Variable | Descripcion |
|---|---|
| `PORT` | Puerto del servidor Express (default: 4242) |
| `FRONTEND_BASE_URL` | URL del frontend Angular (default: http://localhost:4200) |
| `STRIPE_SECRET_KEY` | Llave secreta de Stripe — empieza con `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe — empieza con `whsec_...` |

> **Importante:** no subas el archivo `.env` a un repositorio publico. Ya esta incluido en el `.gitignore` del proyecto.

---

## Correr el proyecto

Necesitas tres terminales abiertas al mismo tiempo.

### Terminal 1 — Backend (servidor Express + Stripe)

```bash
cd server
node index.js
```

Si todo esta bien veras en consola:

```
[dotenv] injecting env (4) from .env
Stripe inicializado correctamente
Servidor corriendo en http://localhost:4242
```

### Terminal 2 — Frontend (Angular)

```bash
npm start
```

O de forma equivalente:

```bash
ng serve
```

El frontend queda disponible en `http://localhost:4200`.

### Terminal 3 — Stripe CLI (escuchar webhooks en local)

Para que los eventos de pago lleguen a tu servidor local, la Stripe CLI debe estar corriendo y redirigiendo los webhooks:

```bash
stripe listen --forward-to localhost:4242/api/pago/stripe-webhook
```

Al arrancar, la CLI imprime un signing secret temporal:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxx
```

> **Importante:** ese valor debe coincidir con `STRIPE_WEBHOOK_SECRET` en tu `.env`. Si la CLI genera uno nuevo, actualiza el `.env` y reinicia el backend.

Sin este comando corriendo, el pedido no se guardara aunque el pago sea exitoso.

---

## Flujo de uso

1. Abre el navegador en `http://localhost:4200`
2. Explora el menu y agrega platillos al carrito
3. En la seccion de ubicacion, el mapa detectara tu posicion y calculara el costo de envio automaticamente
4. Haz clic en **Pagar con Stripe** para ser redirigido a la pagina de pago
5. Usa la tarjeta de prueba de Stripe: `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC
6. Al completar el pago seras redirigido a la pantalla de confirmacion

---

## Estructura del proyecto

```
PRACTICA2.4/
|-- src/                   # Codigo fuente de Angular
|   |-- app/
|   |   |-- components/    # Componentes (carrito, ubicacion, menu...)
|   |   |-- services/      # Servicios (carrito, pago, geolocalizacion)
|-- server/                # Backend Node.js
|   |-- index.js           # Servidor Express + endpoints Stripe
|   |-- data/pedidos/      # Pedidos pagados (JSON por sesion)
|   |-- package.json
|-- .env                   # Variables de entorno (NO subir a Git)
|-- angular.json
|-- package.json
```

---

## Endpoints del backend

| Metodo | Ruta | Descripcion |
|---|---|---|
| `POST` | `/api/pago/crear-checkout-session` | Crea una sesion de Stripe Checkout y devuelve la URL de pago |
| `POST` | `/api/pago/stripe-webhook` | Recibe eventos de Stripe y guarda el pedido cuando el pago es exitoso |
| `GET` | `/api/pago/session/:sessionId` | Consulta los datos de un pedido pagado por su session ID |

---

## Notas adicionales

- El calculo de envio es dinamico: $18 MXN por km, minimo $25, maximo $120
- El proyecto usa modo test de Stripe — ningun cobro real es procesado
- Los pedidos pagados se guardan como archivos JSON en `server/data/pedidos/`
- Si el mapa no detecta tu ubicacion, presiona el boton **Reintentar** en el componente de ubicacion

---

*Santiago Delgado*
