import { Routes } from '@angular/router'; 
import { Menu } from './menu/menu'; 
import { CarritoComponent } from './components/carrito/carrito'; 
import { UbicacionComponent } from './components/ubicacion/ubicacion';
import { PagoExitosoComponent } from './components/pago-exitoso/pago-exitoso';
import { PagoCanceladoComponent } from './components/pago-cancelado/pago-cancelado';




export const routes: Routes = [ 
{ path: '', component: Menu }, 
{ path: 'carrito', component: CarritoComponent }, 
{ path: 'ubicacion', component: UbicacionComponent }, 
{ path: 'pago-exitoso', component: PagoExitosoComponent },
{ path: 'pago-cancelado', component: PagoCanceladoComponent },
{ path: '**', redirectTo: '' } 
];
