
package pe.edu.centrodevarones.app.controller;

import pe.edu.centrodevarones.app.entity.Evaluacion;
import pe.edu.centrodevarones.app.service.EvaluacionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluaciones")
@CrossOrigin(origins = "http://localhost:4200")
public class EvaluacionController {

    private final EvaluacionService service;

    public EvaluacionController(EvaluacionService service) {
        this.service = service;
    }

    // 1. LISTAR EVALUACIONES ACTIVAS
    @GetMapping
    public ResponseEntity<List<Evaluacion>> listar() {

        return ResponseEntity.ok(service.listar());
    }

    // 2. BUSCAR EVALUACIÓN POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Evaluacion> buscarPorId(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                service.buscarPorId(id)
        );
    }

    // 3. CONSULTAR EVALUACIONES POR ASIGNACIÓN
    @GetMapping("/asignacion/{idAsignacion}")
    public ResponseEntity<List<Evaluacion>> porAsignacion(
            @PathVariable Integer idAsignacion) {

        return ResponseEntity.ok(
                service.listarPorAsignacion(idAsignacion)
        );
    }

    // 4. CONSULTAR EVALUACIONES POR PERIODO
    @GetMapping("/periodo/{idPeriodo}")
    public ResponseEntity<List<Evaluacion>> porPeriodo(
            @PathVariable Integer idPeriodo) {

        return ResponseEntity.ok(
                service.listarPorPeriodo(idPeriodo)
        );
    }

    // 5. CONSULTAR POR ASIGNACIÓN Y PERIODO
    @GetMapping("/asignacion/{idAsignacion}/periodo/{idPeriodo}")
    public ResponseEntity<List<Evaluacion>> porAsignacionYPeriodo(
            @PathVariable Integer idAsignacion,
            @PathVariable Integer idPeriodo) {

        return ResponseEntity.ok(
                service.listarPorAsignacionYPeriodo(
                        idAsignacion,
                        idPeriodo
                )
        );
    }

    // 6. CONSULTAR EVALUACIONES POR TIPO
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Evaluacion>> porTipo(
            @PathVariable String tipo) {

        return ResponseEntity.ok(
                service.listarPorTipo(tipo)
        );
    }

    // 7. CONTAR EVALUACIONES POR ASIGNACIÓN
    @GetMapping("/asignacion/{idAsignacion}/total")
    public ResponseEntity<Map<String, Long>> contarPorAsignacion(
            @PathVariable Integer idAsignacion) {

        long total = service.contarPorAsignacion(
                idAsignacion
        );

        return ResponseEntity.ok(
                Map.of("totalEvaluaciones", total)
        );
    }

    // 8. LISTAR EVALUACIONES ORDENADAS POR FECHA
    @GetMapping("/asignacion/{idAsignacion}/ordenadas")
    public ResponseEntity<List<Evaluacion>> listarOrdenadas(
            @PathVariable Integer idAsignacion) {

        return ResponseEntity.ok(
                service.listarOrdenadas(idAsignacion)
        );
    }

    // 9. REGISTRAR UNA EVALUACIÓN
    @PostMapping
    public ResponseEntity<Evaluacion> registrar(
            @RequestBody Evaluacion evaluacion) {

        Evaluacion guardada = service.registrar(evaluacion);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guardada);
    }

    // 10. ELIMINACIÓN LÓGICA
    @PatchMapping("/{id}/eliminar")
    public ResponseEntity<Evaluacion> eliminar(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                service.eliminar(id)
        );
    }
}
