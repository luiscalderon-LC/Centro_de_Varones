
package pe.edu.centrodevarones.app.controller;

import pe.edu.centrodevarones.app.entity.RegistroNota;
import pe.edu.centrodevarones.app.service.RegistroNotaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas")
@CrossOrigin(origins = "http://localhost:4200")
public class RegistroNotaController {

    private final RegistroNotaService service;

    public RegistroNotaController(
            RegistroNotaService service) {
        this.service = service;
    }

    // 1. LISTAR TODAS LAS NOTAS ACTIVAS
    @GetMapping
    public ResponseEntity<List<RegistroNota>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    // 2. BUSCAR NOTA POR ID
    @GetMapping("/{id}")
    public ResponseEntity<RegistroNota> buscarPorId(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                service.buscarPorId(id)
        );
    }

    // 3. CONSULTAR NOTAS POR MATRÍCULA
    @GetMapping("/matricula/{idMatricula}")
    public ResponseEntity<List<RegistroNota>> porMatricula(
            @PathVariable Integer idMatricula) {

        return ResponseEntity.ok(
                service.listarPorMatricula(idMatricula)
        );
    }

    // 4. CONSULTAR NOTAS POR EVALUACIÓN
    @GetMapping("/evaluacion/{idEvaluacion}")
    public ResponseEntity<List<RegistroNota>> porEvaluacion(
            @PathVariable Integer idEvaluacion) {

        return ResponseEntity.ok(
                service.listarPorEvaluacion(idEvaluacion)
        );
    }

    // 5. REGISTRAR UNA CALIFICACIÓN
    @PostMapping
    public ResponseEntity<RegistroNota> registrar(
            @RequestBody RegistroNota nota) {

        RegistroNota guardada = service.registrar(nota);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guardada);
    }

    // 6. ACTUALIZAR UNA CALIFICACIÓN
    @PutMapping("/{id}")
    public ResponseEntity<RegistroNota> actualizar(
            @PathVariable Integer id,
            @RequestBody RegistroNota nota) {

        return ResponseEntity.ok(
                service.actualizar(id, nota)
        );
    }

    // 7. ELIMINACIÓN LÓGICA
    @PatchMapping("/{id}/eliminar")
    public ResponseEntity<RegistroNota> eliminar(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                service.eliminar(id)
        );
    }
}
