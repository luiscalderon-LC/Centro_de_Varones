
package pe.edu.centrodevarones.app.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.dto.RegistrarDocenteRequest;
import pe.edu.centrodevarones.app.service.RegistroDocenteService;

import java.util.Map;

@RestController
@RequestMapping("/api/director/docentes")
public class RegistroDocenteController {

    private final RegistroDocenteService service;

    public RegistroDocenteController(
            RegistroDocenteService service
    ) {
        this.service = service;
    }

    // SOLO EL DIRECTOR PUEDE REGISTRAR DOCENTES
    @PostMapping
    @PreAuthorize("hasRole('DIRECTOR')")
    public ResponseEntity<Map<String, Object>> registrar(
            @Valid @RequestBody RegistrarDocenteRequest request
    ) {

        Integer idDocente = service.registrar(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "mensaje", "Docente registrado correctamente",
                        "idDocente", idDocente
                )
        );
    }
}
