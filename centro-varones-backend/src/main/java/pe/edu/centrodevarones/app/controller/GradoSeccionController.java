
package pe.edu.centrodevarones.app.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.entity.GradoSeccion;
import pe.edu.centrodevarones.app.service.GradoSeccionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grados-secciones")
@CrossOrigin(origins = "http://localhost:4200")
public class GradoSeccionController {

    private final GradoSeccionService service;

    public GradoSeccionController(GradoSeccionService service) {
        this.service = service;
    }

    // 1. LISTAR GRADOS Y SECCIONES ACTIVOS
    @GetMapping
    public ResponseEntity<List<GradoSeccion>> listar() {

        return ResponseEntity.ok(service.listar());
    }

    // 2. BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<GradoSeccion> buscar(
            @PathVariable Integer id) {

        return ResponseEntity.ok(service.buscar(id));
    }

    // 3. REGISTRAR GRADO Y SECCIÓN
    @PostMapping
    public ResponseEntity<GradoSeccion> guardar(
            @RequestBody GradoSeccion gradoSeccion) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.guardar(gradoSeccion));
    }

    // 4. ACTUALIZAR GRADO Y SECCIÓN
    @PutMapping("/{id}")
    public ResponseEntity<GradoSeccion> actualizar(
            @PathVariable Integer id,
            @RequestBody GradoSeccion gradoSeccion) {

        return ResponseEntity.ok(
                service.actualizar(id, gradoSeccion)
        );
    }

    // 5. CONSULTAR POR GRADO, SECCIÓN O AÑO ESCOLAR
    @PostMapping("/consulta")
    public ResponseEntity<List<GradoSeccion>> consultar(
            @RequestBody Map<String, Object> filtros) {

        Integer grado = obtenerEntero(filtros.get("grado"));

        String seccion = filtros.get("seccion") == null
                ? null
                : filtros.get("seccion").toString();

        Integer anioEscolar =
                obtenerEntero(filtros.get("anioEscolar"));

        return ResponseEntity.ok(
                service.consultar(grado, seccion, anioEscolar)
        );
    }

    // 6. ELIMINAR LÓGICAMENTE
    @PatchMapping("/{id}/eliminar")
    public ResponseEntity<GradoSeccion> eliminar(
            @PathVariable Integer id) {

        return ResponseEntity.ok(service.eliminar(id));
    }

    // 7. RESTAURAR GRADO Y SECCIÓN
    @PatchMapping("/{id}/restaurar")
    public ResponseEntity<GradoSeccion> restaurar(
            @PathVariable Integer id) {

        return ResponseEntity.ok(service.restaurar(id));
    }

    // 8. LISTAR GRADOS Y SECCIONES ELIMINADOS
    @GetMapping("/eliminados")
    public ResponseEntity<List<GradoSeccion>> listarEliminados() {

        return ResponseEntity.ok(service.listarEliminados());
    }

    // CONVERTIR FILTROS NUMÉRICOS
    private Integer obtenerEntero(Object valor) {

        if (valor == null || valor.toString().isBlank()) {
            return null;
        }

        try {
            return Integer.valueOf(valor.toString());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "El grado y el año escolar deben ser números enteros."
            );
        }
    }
}
