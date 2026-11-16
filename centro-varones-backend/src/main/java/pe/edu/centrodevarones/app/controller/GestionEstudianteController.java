
package pe.edu.centrodevarones.app.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.dto.GestionEstudianteResponse;
import pe.edu.centrodevarones.app.service.GestionEstudianteService;

@RestController
@RequestMapping("/api/director/estudiantes")
@PreAuthorize("hasRole('DIRECTOR')")
public class GestionEstudianteController {

    private final GestionEstudianteService service;

    public GestionEstudianteController(
            GestionEstudianteService service
    ) {
        this.service = service;
    }

    // LISTAR ESTUDIANTES MATRICULADOS
    @GetMapping
    public ResponseEntity<List<GestionEstudianteResponse>> listar(
            @RequestParam(required = false)
            Integer anio
    ) {
        return ResponseEntity.ok(
                service.listar(anio)
        );
    }
}
