
import { Component } from '@angular/core';

import { Navbar } from '../../components/navbar/navbar';
import { Hero } from '../../components/hero/hero';
import { Nosotros } from '../../components/nosotros/nosotros';
import { Caracteristicas } from '../../components/caracteristicas/caracteristicas';
import { Beneficios } from '../../components/beneficios/beneficios';
import { Contacto } from '../../components/contacto/contacto';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    Navbar,
    Hero,
    Nosotros,
    Caracteristicas,
    Beneficios,
    Contacto,
    Footer
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {}
