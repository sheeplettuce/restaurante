const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4242;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:4200';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  throw new Error(' STRIPE_SECRET_KEY no configurado');
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

console.log(' Stripe inicializado correctamente');

const pedidosDir = path.join(__dirname, 'data', 'pedidos');
fs.mkdirSync(pedidosDir, { recursive: true });

app.use(cors());
app.use(express.json());

/* =========================================================
   UTILIDADES
========================================================= */

function toCents(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) throw new Error('Monto inválido');
  return Math.round(num * 100);
}

function normalizarItem(it) {
  const nombre = it.nombre || it.name;
  const precio = it.precio ?? it.price;
  const cantidad = it.cantidad ?? it.quantity;

  if (!nombre) throw new Error('Item sin nombre');
  if (!precio || isNaN(precio)) throw new Error('Precio inválido');
  if (!cantidad || !Number.isInteger(Number(cantidad))) throw new Error('Cantidad inválida');

  return {
    nombre,
    precio: Number(precio),
    cantidad: Number(cantidad)
  };
}

/* =========================================================
   CREAR CHECKOUT SESSION
========================================================= */

app.post('/api/pago/crear-checkout-session', async (req, res) => {
  try {
    console.log('BODY RECIBIDO:', req.body);

    const { descripcion, items, subtotal, iva, envio, total } = req.body;

    if (!descripcion) {
      return res.status(400).json({ error: 'Descripción requerida' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items inválidos' });
    }

    const itemsNormalizados = items.map(normalizarItem);

    const lineItems = itemsNormalizados.map((it) => {
      console.log('ITEM PROCESADO:', it);

      return {
        price_data: {
          currency: 'mxn',
          unit_amount: toCents(it.precio),
          product_data: {
            name: it.nombre
          }
        },
        quantity: it.cantidad
      };
    });

    // IVA
    if (iva && Number(iva) > 0) {
      lineItems.push({
        price_data: {
          currency: 'mxn',
          unit_amount: toCents(iva),
          product_data: { name: 'IVA (16%)' }
        },
        quantity: 1
      });
    }

    // ENVÍO
    if (envio && Number(envio) > 0) {
      lineItems.push({
        price_data: {
          currency: 'mxn',
          unit_amount: toCents(envio),
          product_data: { name: 'Envío' }
        },
        quantity: 1
      });
    }

    const folio = uuidv4();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${FRONTEND_BASE_URL}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_BASE_URL}/pago-cancelado`,
      metadata: {
        folio,
        descripcion,
        subtotal: String(subtotal || 0),
        iva: String(iva || 0),
        envio: String(envio || 0),
        total: String(total || 0),
        items: JSON.stringify(itemsNormalizados)
      }
    });

    console.log('Sesión creada:', session.id);

    res.json({ url: session.url });

  } catch (err) {
    console.error('ERROR STRIPE:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   WEBHOOK
========================================================= */

app.post('/api/pago/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.payment_status === 'paid') {
        const metadata = session.metadata || {};

        const pedido = {
          sessionId: session.id,
          folio: metadata.folio,
          descripcion: metadata.descripcion,
          platillos: JSON.parse(metadata.items || '[]'),
          subtotal: Number(metadata.subtotal),
          iva: Number(metadata.iva),
          envio: Number(metadata.envio),
          total: session.amount_total / 100,
          fechaHora: new Date().toISOString(),
          estado: 'Pagado (Stripe Test)'
        };

        const filePath = path.join(pedidosDir, `${session.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(pedido, null, 2));

        console.log('Pedido guardado:', session.id);
      }
    }

    res.json({ received: true });

  } catch (err) {
    console.error('WEBHOOK ERROR:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

/* =========================================================
   CONSULTAR PAGO
========================================================= */

app.get('/api/pago/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  const filePath = path.join(pedidosDir, `${sessionId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
});

/* =========================================================
   START
========================================================= */

app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});