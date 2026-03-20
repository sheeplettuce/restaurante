import { AfterViewInit, Component, OnDestroy, effect, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { RouterLink } from '@angular/router';

import { GeolocalizacionService } from '../../services/geolocalización';
import { CarritoService } from '../../services/car';
import { PagoService, PlatilloCarrito } from '../../services/pago';


@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ubicacion.html',
  styleUrl: './ubicacion.css'
})
export class UbicacionComponent implements AfterViewInit, OnDestroy {
@Input() compacto = false; // Modo compacto para incrustar en el carrito 
geo = inject(GeolocalizacionService); 
carrito = inject(CarritoService); 
pago = inject(PagoService);
pagando = false;
private mapa!: L.Map; 
private mapaListo = false; 
private marcadorUsuario?: L.Marker; 
private marcadorRestaurante?: L.Marker; 
private linea?: L.Polyline; 
// Efecto: cuando cambie la ubicación, actualiza UI y costo de envío 
private reaccion = effect(() => { 
const u = this.geo.ubicacionUsuario(); 
if (!this.mapaListo || !u) return; 
this.colocarMarcadorUsuario(u.latitud, u.longitud); 
this.dibujarLinea(); 
this.ajustarLimites(); 
const d = this.geo.distanciaKm(); 
if (d != null) { 
// $18/km, mínimo $25, tope $120 
const envio = Math.min(Math.max(25, Math.round(d * 18)), 120); 
this.carrito.setEnvio(envio); 
} 
}); 
ngAfterViewInit(): void { 
    // --- FIX PRINCIPAL: aseguro rutas de iconos para que el pin se vea --- 
    (L as any).Icon.Default.imagePath = 'assets/leaflet/'; 
 
    // Si prefieres rutas directas en lugar de imagePath, descomenta esto: 
    // L.Icon.Default.mergeOptions({ 
    //   iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png', 
    //   iconUrl: 'assets/leaflet/marker-icon.png', 
    //   shadowUrl: 'assets/leaflet/marker-shadow.png' 
    // }); 
 
    // Inicializa el mapa por id (tu HTML tiene id="map") 
    this.mapa = L.map('map').setView( 
      [this.geo.restaurante.latitud, this.geo.restaurante.longitud], 
      14 
    ); 
 
    // Capa base 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '© OpenStreetMap contributors' 
    }).addTo(this.mapa); 
 
    // Marcador del restaurante 
    this.marcadorRestaurante = L 
      .marker([this.geo.restaurante.latitud, this.geo.restaurante.longitud], { title: 'Restaurante' }) 
      .addTo(this.mapa) 
      .bindPopup('Restaurante'); 
 
    // Primer intento + seguimiento 
    this.geo.obtenerUbicacionUnaVez(); 
    this.geo.iniciarObservacion(); 
 
    // Por si el contenedor del mapa estuvo oculto cuando se creó 
    setTimeout(() => this.mapa.invalidateSize(), 0); 
 
    this.mapaListo = true; 
  } 
 
  ngOnDestroy(): void { 
    // Detener observación de geolocalización y limpiar el mapa 
    this.geo.detenerObservacion(); 
    if (this.mapa) { 
      this.mapa.remove(); 
    } 
    this.marcadorUsuario = undefined; 
    this.marcadorRestaurante = undefined; 
    this.linea = undefined; 
    this.mapaListo = false; 
  } 
 
  // Llamado por el botón en la plantilla 
  reintentarUbicacion(): void { 
    this.geo.obtenerUbicacionUnaVez(); 
  } 

  pagarConStripe(): void {
    if (this.pagando) return;

    const items = this.carrito.items().map((it) => ({
      id: it.id,
      nombre: it.nombre,
      imagen: it.imagen,
      precio: it.precio,
      cantidad: it.cantidad
    })) as PlatilloCarrito[];

    if (items.length === 0) return;

    const envio = this.carrito.envio();
    if (!Number.isFinite(envio) || envio <= 0) {
      alert('Aún no se ha calculado el envío. Espera a que el cálculo termine o vuelve a intentar.');
      return;
    }

    const subtotal = this.carrito.subtotal();
    const iva = this.carrito.iva();
    const total = this.carrito.total();

    const descripcion = items.map((i) => `${i.cantidad}x ${i.nombre}`).join(', ');

    const payload = {
      descripcion,
      items,
      subtotal,
      iva,
      envio,
      total
    };

    this.pagando = true;
    this.pago.crearCheckoutSession(payload).subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: (err) => {
        console.error(err);
        alert('No se pudo iniciar el pago. Revisa tu conexión y vuelve a intentar.');
        this.pagando = false;
      },
      complete: () => {
        // Si Stripe redirige, no se llega a este punto; si falla, se maneja en error.
      }
    });
  }
   // === Métodos privados usados por el efecto === 
 
  private colocarMarcadorUsuario(lat: number, lng: number): void { 
    if (!this.mapa) return; 
 
    if (!this.marcadorUsuario) { 
      // Usa el icono por defecto de Leaflet (ya corregimos rutas con imagePath) 
      this.marcadorUsuario = L.marker([lat, lng], { title: 'Tu ubicación' }) 
        .addTo(this.mapa) 
        .bindPopup('Tu ubicación'); 
    } else { 
      this.marcadorUsuario.setLatLng([lat, lng]); 
    } 
  } 
 
  private dibujarLinea(): void { 
    if (!this.marcadorRestaurante || !this.marcadorUsuario || !this.mapa) return; 
 
    const origen = this.marcadorRestaurante.getLatLng(); 
    const destino = this.marcadorUsuario.getLatLng(); 
 
    if (!this.linea) { 
      this.linea = L.polyline([origen, destino], { 
        color: '#0f766e', 
        weight: 4, 
        opacity: 0.85 
      }).addTo(this.mapa); 
    } else { 
      this.linea.setLatLngs([origen, destino]); 
    } 
  } 
 
  private ajustarLimites(): void { 
    if (!this.marcadorRestaurante || !this.marcadorUsuario || !this.mapa) return; 
 
    const bounds = L.latLngBounds( 
      this.marcadorRestaurante.getLatLng(), 
      this.marcadorUsuario.getLatLng() 
    ); 
 
    this.mapa.fitBounds(bounds, { 
      padding: [48, 48], 
      maxZoom: 16 
    }); 
  } 
} 
 
 