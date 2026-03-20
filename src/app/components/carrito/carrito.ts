import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router'; // ← FALTA ESTO
import { CarritoService } from '../../services/car';

@Component({
 selector: 'app-carrito',
 standalone: true,
 imports: [
   CommonModule,
   CurrencyPipe,
   RouterModule   // ← Y ESTO
 ],
 templateUrl: './carrito.html',
 styleUrl: './carrito.css'
})
export class CarritoComponent {

 carrito = inject(CarritoService);

 trackById = (_: number, it: any) => it.id;

 actualizarCantidad(id: number, valor: string | number) {

 const cantidad =
 typeof valor === 'string'
 ? parseInt(valor,10)
 : valor;

 if(!Number.isNaN(cantidad)){

 this.carrito.actualizarCantidad(id,cantidad);

 }

 }

}