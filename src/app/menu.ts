import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor() { }

  obtenerMenu() {

  return [

    {
      nombre: "Tacos",
      imagen: "https://i.pinimg.com/736x/89/bf/a3/89bfa382aa89315baa88e02d571d5076.jpg"
    },

    {
      nombre: "Tortas",
      imagen: "https://i.pinimg.com/736x/cb/e7/e6/cbe7e629cd01fa279b9f1935024173fd.jpg"
    },

    {
      nombre: "Menudo",
      imagen: "https://i.pinimg.com/1200x/b7/dd/52/b7dd522dabea62f567032610a91fffbd.jpg"
    },

    {
      nombre: "Carnitas",
      imagen: "https://i.pinimg.com/1200x/cf/be/a4/cfbea4e2395fe566dc6ae64163ee36cb.jpg"
    },

    {
      nombre: "Agua fresca",
      imagen: "https://i.pinimg.com/736x/2d/54/ba/2d54ba47b6137a393d32f6569dcc62f6.jpg"
    },

    {
      nombre: "Cheves",
      imagen: "https://i.pinimg.com/736x/8d/43/98/8d4398f5b42e8d4dde3debb464d7ed8e.jpg"
    }

  ];

}




}