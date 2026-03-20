import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

export interface PlatilloCarrito {
  id?: number;
  nombre: string;
  imagen?: string;
  precio: number;
  cantidad: number;
}

export interface CrearCheckoutPayload {
  descripcion: string;
  items: PlatilloCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export interface CrearCheckoutResponse {
  url: string;
}

export interface PagoExitosoInfo {
  sessionId: string;
  folio: string;
  platillos: PlatilloCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  fechaHora: string;
  estado: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private readonly http = inject(HttpClient);

  // Ajusta este valor si levantas el API en otro puerto.
  private readonly apiBaseUrl = 'http://localhost:4242';

  crearCheckoutSession(payload: CrearCheckoutPayload): Observable<CrearCheckoutResponse> {
    return this.http.post<CrearCheckoutResponse>(
      `${this.apiBaseUrl}/api/pago/crear-checkout-session`,
      payload
    );
  }

  pagarConStripe(payload: CrearCheckoutPayload): Observable<void> {
    return this.crearCheckoutSession(payload).pipe(
      tap((res) => window.location.href = res.url),
      map(() => undefined)
    );
  }

  obtenerPago(sessionId: string): Observable<PagoExitosoInfo> {
    return this.http.get<PagoExitosoInfo>(`${this.apiBaseUrl}/api/pago/session/${sessionId}`);
  }
}

