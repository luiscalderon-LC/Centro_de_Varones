import { Component } from '@angular/core';

import { Navbar } from '../../components/navbar/navbar';
import { Hero } from '../../components/hero/hero';
import { Nosotros } from '../../components/nosotros/nosotros';
import { Beneficios } from '../../components/beneficios/beneficios';
import { Caracteristicas } from '../../components/caracteristicas/caracteristicas';
import { Contacto } from '../../components/contacto/contacto';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-inicio',
  imports: [
    Navbar,
    Hero,
    Nosotros,
    Beneficios,
    Caracteristicas,
    Contacto,
    Footer
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {

}