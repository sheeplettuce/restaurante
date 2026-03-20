import { Injectable, signal, computed, effect } from '@angular/core';

export interface ItemCarrito {
  id: number;
  nombre: string;
  imagen: string;
  precio: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  // =============================
  // ESTADO
  // =============================

  private readonly carrito = signal<ItemCarrito[]>([]);
  readonly items = this.carrito.asReadonly();

  // Envío
  readonly envio = signal<number>(0);

  // =============================
  // CÁLCULOS
  // =============================

  readonly subtotal = computed(() =>
    this.carrito().reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    )
  );

  readonly iva = computed(() =>
    this.subtotal() * 0.16
  );

  readonly total = computed(() =>
    this.subtotal() + this.iva() + this.envio()
  );

  // =============================
  // CONSTRUCTOR
  // =============================

  constructor() {

    const datos = localStorage.getItem('carrito');

    if (datos) {
      try {
        this.carrito.set(JSON.parse(datos));
      } catch {}
    }

    effect(() => {
      localStorage.setItem(
        'carrito',
        JSON.stringify(this.carrito())
      );
    });

  }

  // =============================
  // MÉTODOS
  // =============================

  agregarItem(item: {
    nombre: string,
    imagen: string,
    precio: number
  }) {

    this.carrito.update(lista => {

      const existente =
        lista.find(p => p.nombre === item.nombre);

      if (existente) {
        return lista.map(p =>
          p.nombre === item.nombre
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }

      return [
        ...lista,
        {
          id: Date.now(),
          nombre: item.nombre,
          imagen: item.imagen,
          precio: item.precio,
          cantidad: 1
        }
      ];

    });

  }

  actualizarCantidad(id: number, cantidad: number) {

    if (cantidad <= 0) {
      return this.eliminarItem(id);
    }

    this.carrito.update(lista =>
      lista.map(p =>
        p.id === id
          ? { ...p, cantidad }
          : p
      )
    );

  }

  eliminarItem(id: number) {

    this.carrito.update(lista =>
      lista.filter(p => p.id !== id)
    );

  }

  vaciarCarrito() {
    this.carrito.set([]);
  }

  // 🔥 Método para UbicacionComponent
  setEnvio(monto: number): void {
    this.envio.set(Math.max(0, Math.round(monto)));
  }

}

