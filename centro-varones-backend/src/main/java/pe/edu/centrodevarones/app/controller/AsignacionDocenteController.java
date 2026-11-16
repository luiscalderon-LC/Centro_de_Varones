
package pe.edu.centrodevarones.app.controller;

import pe.edu.centrodevarones.app.entity.AsignacionDocente;
import pe.edu.centrodevarones.app.service.AsignacionDocenteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asignaciones")
@CrossOrigin(origins = "http://localhost:4200")
public class AsignacionDocenteController {

    private final AsignacionDocenteService service;

    public AsignacionDocenteController(
            AsignacionDocenteService service) {
        this.service = service;
    }

    // 1. LISTAR ASIGNACIONES ACTIVAS
    @GetMapping
    public ResponseEntity<List<AsignacionDocente>> listar() {

        return ResponseEntity.ok(service.listar());
    }

    // 2. BUSCAR ASIGNACIÓN POR ID
    @GetMapping("/{id}")
    public ResponseEntity<AsignacionDocente> buscarPorId(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                service.buscarPorId(id)
        );
    }

    // 3. CONSULTAR ASIGNACIONES POR DOCENTE
    @GetMapping("/docente/{idDocente}")
    public ResponseEntity<List<AsignacionDocente>> porDocente(
            @PathVariable Integer idDocente) {

        return ResponseEntity.ok(
                service.listarPorDocente(idDocente)
        );
    }

    // 4. CONSULTAR ASIGNACIONES POR SALÓN
    @GetMapping("/salon/{idGradoSeccion}")
    public ResponseEntity<List<AsignacionDocente>> porSalon(
            @PathVariable Integer idGradoSeccion) {

        return ResponseEntity.ok(
                service.listarPorSalon(idGradoSeccion)
        );
    }

    // 5. CONSULTAR ASIGNACIONES POR ASIGNATURA
    @GetMapping("/asignatura/{idAsignatura}")
    public ResponseEntity<List<AsignacionDocente>> porAsignatura(
            @PathVariable Integer idAsignatura) {

        return ResponseEntity.ok(
                service.listarPorAsignatura(idAsignatura)
        );
    }

    // 6. CONSULTAR CURSOS DE UN DOCENTE EN UN SALÓN
    @GetMapping("/docente/{idDocente}/salon/{idGradoSeccion}")
    public ResponseEntity<List<AsignacionDocente>> porDocenteYSalon(
            @PathVariable Integer idDocente,
            @PathVariable Integer idGradoSeccion) {

        return ResponseEntity.ok(
                service.listarPorDocenteYSalon(
                        idDocente,
                        idGradoSeccion
                )
        );
    }

    // 7. CONTAR ASIGNACIONES DE UN DOCENTE
    @GetMapping("/docente/{idDocente}/total")
    public ResponseEntity<Map<String, Long>> contarPorDocente(
            @PathVariable Integer idDocente) {

        long total = service.contarPorDocente(idDocente);

        return ResponseEntity.ok(
                Map.of("totalAsignaciones", total)
        );
    }

    // 8. REGISTRAR ASIGNACIÓN DOCENTE
    @PostMapping
    public ResponseEntity<AsignacionDocente> registrar(
            @RequestBody AsignacionDocente asignacion) {

        AsignacionDocente guardada =
                service.registrar(asignacion);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guardada);
    }

    // 9. ELIMINACIÓN LÓGICA
    @PatchMapping("/{id}/eliminar")
    public ResponseEntity<AsignacionDocente> eliminar(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                service.eliminar(id)
        );
    }
}
