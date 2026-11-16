
package pe.edu.centrodevarones.app.controller;

import pe.edu.centrodevarones.app.entity.MatriculaEstudiante;
import pe.edu.centrodevarones.app.service.MatriculaEstudianteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matriculas")
@CrossOrigin(origins = "http://localhost:4200")
public class MatriculaEstudianteController {

    private final MatriculaEstudianteService service;

    public MatriculaEstudianteController(
            MatriculaEstudianteService service) {
        this.service = service;
    }

    // 1. LISTAR MATRÍCULAS ACTIVAS
    @GetMapping
    public ResponseEntity<List<MatriculaEstudiante>> listar() {

        return ResponseEntity.ok(service.listar());
    }

    // 2. BUSCAR MATRÍCULA POR ID
    @GetMapping("/{id}")
    public ResponseEntity<MatriculaEstudiante> buscarPorId(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                service.buscarPorId(id)
        );
    }

    // 3. CONSULTAR MATRÍCULAS POR SALÓN
    @GetMapping("/salon/{idGradoSeccion}")
    public ResponseEntity<List<MatriculaEstudiante>> porSalon(
            @PathVariable Integer idGradoSeccion) {

        return ResponseEntity.ok(
                service.listarPorSalon(idGradoSeccion)
        );
    }

    // 4. CONSULTAR MATRÍCULAS POR ESTUDIANTE
    @GetMapping("/estudiante/{idEstudiante}")
    public ResponseEntity<List<MatriculaEstudiante>> porEstudiante(
            @PathVariable Integer idEstudiante) {

        return ResponseEntity.ok(
                service.listarPorEstudiante(idEstudiante)
        );
    }

    // 5. CONTAR MATRÍCULAS ACTIVAS POR SALÓN
    @GetMapping("/salon/{idGradoSeccion}/total")
    public ResponseEntity<Map<String, Long>> contarPorSalon(
            @PathVariable Integer idGradoSeccion) {

        long total = service.contarPorSalon(idGradoSeccion);

        return ResponseEntity.ok(
                Map.of("totalEstudiantes", total)
        );
    }

    // 6. REGISTRAR MATRÍCULA
    @PostMapping
    public ResponseEntity<MatriculaEstudiante> registrar(
            @RequestBody MatriculaEstudiante matricula) {

        MatriculaEstudiante guardada =
                service.registrar(matricula);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guardada);
    }

    // 7. ELIMINACIÓN LÓGICA
    @PatchMapping("/{id}/eliminar")
    public ResponseEntity<MatriculaEstudiante> eliminar(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                service.eliminar(id)
        );
    }
}
