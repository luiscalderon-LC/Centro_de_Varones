
package pe.edu.centrodevarones.app.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.dto.RegistrarMatriculaRequest;
import pe.edu.centrodevarones.app.service.RegistroMatriculaService;

import java.util.Map;

@RestController
@RequestMapping("/api/director/matriculas")
public class RegistroMatriculaController {

    private final RegistroMatriculaService registroMatriculaService;

    public RegistroMatriculaController(
            RegistroMatriculaService registroMatriculaService
    ) {
        this.registroMatriculaService = registroMatriculaService;
    }

    // ==========================================
    // REGISTRAR ESTUDIANTE Y MATRÍCULA
    // ==========================================

    @PostMapping
    @PreAuthorize("hasRole('DIRECTOR')")
    public ResponseEntity<Map<String, Object>> registrar(
            @RequestBody RegistrarMatriculaRequest request
    ) {

        Integer idEstudiante =
                registroMatriculaService.registrar(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "mensaje", "Estudiante matriculado correctamente",
                        "idEstudiante", idEstudiante
                ));
    }
}
