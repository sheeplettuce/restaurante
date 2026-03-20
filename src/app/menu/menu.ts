import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../menu';
import { CarritoService } from '../services/car';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu {

  private menuService = inject(MenuService);
  private carrito = inject(CarritoService);

  menu = this.menuService.obtenerMenu();

  agregar(platillo: any) {

    this.carrito.agregarItem({

      nombre: platillo.nombre,

      imagen: platillo.imagen,

      precio: 50

    });

  }

}