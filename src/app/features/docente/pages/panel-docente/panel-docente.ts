import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-panel-docente',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panel-docente.html',
  styleUrl: './panel-docente.css'
})
export class PanelDocente {

  docente = 'Luis Calderón';

  cursos = [
    {
      nombre: 'Matemáticas',
      grado: '3.° A',
      estudiantes: 30
    },
    {
      nombre: 'Comunicación',
      grado: '3.° B',
      estudiantes: 31
    },
    {
      nombre: 'Ciencia y Tecnología',
      grado: '4.° A',
      estudiantes: 27
    },
    {
      nombre: 'Desarrollo Personal',
      grado: '5.° B',
      estudiantes: 33
    }
  ];

}