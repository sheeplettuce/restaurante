import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PagoService, PagoExitosoInfo } from '../../services/pago';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './pago-exitoso.html',
  styleUrl: './pago-exitoso.css'
})
export class PagoExitosoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly pago = inject(PagoService);

  cargando = true;
  error: string | null = null;
  info: PagoExitosoInfo | null = null;

  get folio(): string {
    return this.info?.folio ?? '';
  }

  get totalPagado(): number {
    return this.info?.total ?? 0;
  }

  get platillos(): string {
    const items = this.info?.platillos ?? [];
    return items.map((i) => `${i.cantidad}x ${i.nombre}`).join(', ');
  }

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const sessionId = params.get('session_id');
      if (!sessionId) {
        this.cargando = false;
        this.error = 'No se recibió la información del pago.';
        return;
      }

      this.cargando = true;
      this.error = null;
      this.pago.obtenerPago(sessionId).subscribe({
        next: (data) => {
          this.info = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error(err);
          this.cargando = false;
          this.error = 'No se pudo confirmar el pago. Intenta nuevamente.';
        }
      });
    });
  }
}

