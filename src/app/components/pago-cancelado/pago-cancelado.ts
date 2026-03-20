import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pago-cancelado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pago-cancelado.html',
  styleUrl: './pago-cancelado.css'
})
export class PagoCanceladoComponent {}

