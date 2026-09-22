import { Component } from '@angular/core';

// Componentes Integrante 1
import { NavbarComponent } from '../../components/navbar/navbar';
import { HeroComponent } from '../../components/hero/hero';
import { NosotrosComponent } from '../../components/nosotros/nosotros';
import { FooterComponent } from '../../components/footer/footer';

// Componentes Integrante 2
import { Beneficios } from '../../components/beneficios/beneficios';
import { Caracteristicas } from '../../components/caracteristicas/caracteristicas';
import { Contacto } from '../../components/contacto/contacto';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    NosotrosComponent,
    Beneficios,
    Caracteristicas,
    Contacto,
    FooterComponent
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {

}