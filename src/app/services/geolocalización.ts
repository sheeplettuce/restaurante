import { Injectable, signal, computed } from '@angular/core';
import { CarritoService } from './car'; 

export interface Coordenadas {
  latitud: number;
  longitud: number;
  precision?: number;
}

@Injectable({ providedIn: 'root' })
export class GeolocalizacionService {

  constructor(private carrito: CarritoService) {}

  // Ubicación del restaurante (Centro de Aguascalientes aprox.)
  readonly restaurante: Coordenadas = {
    latitud: 21.89758303983576,
    longitud: -102.29813101828508
  };

  // Señales de estado
  private readonly _ubicacionUsuario = signal<Coordenadas | null>(null);
  readonly ubicacionUsuario = this._ubicacionUsuario.asReadonly();

  private readonly _errorGeolocalizacion = signal<string | null>(null);
  readonly errorGeolocalizacion = this._errorGeolocalizacion.asReadonly();

  // Distancia Haversine en km
  readonly distanciaKm = computed(() => {
    const u = this._ubicacionUsuario();
    if (!u) return null;

    const R = 6371;
    const aRad = (g: number) => g * Math.PI / 180;

    const dLat = aRad(this.restaurante.latitud - u.latitud);
    const dLng = aRad(this.restaurante.longitud - u.longitud);

    const lat1 = aRad(u.latitud);
    const lat2 = aRad(this.restaurante.latitud);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return +(R * c).toFixed(2);
  });

  // COSTO DEL CARRITO + ENVÍO
  readonly costomasenvio = computed(() => {
    return this.carrito.total() + this.carrito.envio();
  });

  private idObservacion: number | null = null;

  async obtenerUbicacionUnaVez(): Promise<void> {
    this._errorGeolocalizacion.set(null);

    if (!('geolocation' in navigator)) {
      this._errorGeolocalizacion.set('La geolocalización no es compatible en este navegador.');
      return;
    }

    return new Promise<void>((resolver) => {
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          const { latitude, longitude, accuracy } = posicion.coords;

          this._ubicacionUsuario.set({
            latitud: latitude,
            longitud: longitude,
            precision: accuracy
          });

          resolver();
        },
        (error) => {
          this._errorGeolocalizacion.set(this.obtenerMensajeError(error.code));
          resolver();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }

  iniciarObservacion(): void {
    this._errorGeolocalizacion.set(null);

    if (!('geolocation' in navigator)) {
      this._errorGeolocalizacion.set('La geolocalización no es compatible en este navegador.');
      return;
    }

    if (this.idObservacion != null) return;

    this.idObservacion = navigator.geolocation.watchPosition(
      (posicion) => {
        const { latitude, longitude, accuracy } = posicion.coords;

        this._ubicacionUsuario.set({
          latitud: latitude,
          longitud: longitude,
          precision: accuracy
        });
      },
      (error) => {
        this._errorGeolocalizacion.set(this.obtenerMensajeError(error.code));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  detenerObservacion(): void {
    if (this.idObservacion != null) {
      navigator.geolocation.clearWatch(this.idObservacion);
      this.idObservacion = null;
    }
  }

  private obtenerMensajeError(codigo: number): string {
    switch (codigo) {
      case 1: return 'El usuario denegó el permiso de geolocalización.';
      case 2: return 'La ubicación no está disponible.';
      case 3: return 'La solicitud de ubicación expiró.';
      default: return 'Ocurrió un error desconocido en la geolocalización.';
    }
  }
}
