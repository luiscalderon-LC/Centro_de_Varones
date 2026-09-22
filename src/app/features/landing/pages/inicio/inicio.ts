import { Component } from '@angular/core';

// Tus componentes
import { NavbarComponent } from '../../components/navbar/navbar';
import { HeroComponent } from '../../components/hero/hero';
import { NosotrosComponent } from '../../components/nosotros/nosotros';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    NosotrosComponent,
    FooterComponent
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent {}