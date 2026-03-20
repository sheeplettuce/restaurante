# API de Pagos (Node.js + Express + Stripe)

## Variables de entorno
Copia `server/.env.example` a `server/.env` y completa las llaves de Stripe.

## Levantar el servidor
1. `cd server`
2. `npm install`
3. `npm start`

El servidor escuchará en `http://localhost:4242`.

## Endpoints
- `POST /api/pago/crear-checkout-session`
  - Recibe: `descripcion`, `items`, `subtotal`, `iva`, `envio`, `total`
  - Regresa: `{ url }` (Stripe Checkout Session URL)

- `POST /api/pago/stripe-webhook`
  - Recibe eventos de Stripe y guarda el pedido en `server/data/pedidos/<sessionId>.json`

- `GET /api/pago/session/:sessionId`
  - Regresa el JSON guardado para mostrarlo en `/pago-exitoso`

## Evidencia JSON
La evidencia real se guarda al recibir `checkout.session.completed` con `payment_status=paid`.
Existe un archivo `evidencia-pago-stripe-test.json` como ejemplo de estructura.

