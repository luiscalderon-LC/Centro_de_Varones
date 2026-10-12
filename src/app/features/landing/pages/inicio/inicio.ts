
import { Component } from '@angular/core';

// Componentes de la pantalla principal
import { NavbarComponent } from '../../components/navbar/navbar';
import { HeroComponent } from '../../components/hero/hero';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {

}
