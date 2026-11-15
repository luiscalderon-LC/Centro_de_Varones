
package pe.edu.centrodevarones.app.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.entity.Asignatura;
import pe.edu.centrodevarones.app.service.AsignaturaService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asignaturas")
public class AsignaturaController {

    private final AsignaturaService service;

    public AsignaturaController(AsignaturaService service) {
        this.service = service;
    }

    // LISTAR ASIGNATURAS ACTIVAS
    @GetMapping
    public List<Asignatura> listar() {
        return service.listar();
    }

    // LISTAR ASIGNATURAS ELIMINADAS
    @GetMapping("/eliminados")
    public List<Asignatura> listarEliminados() {
        return service.listarEliminados();
    }

    // BUSCAR ASIGNATURA POR ID
    @GetMapping("/{id}")
    public Asignatura buscar(@PathVariable Integer id) {
        return service.buscar(id);
    }

    // REGISTRAR ASIGNATURA
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Asignatura guardar(@RequestBody Asignatura asignatura) {
        return service.guardar(asignatura);
    }

    // ACTUALIZAR ASIGNATURA
    @PutMapping("/{id}")
    public Asignatura actualizar(
            @PathVariable Integer id,
            @RequestBody Asignatura asignatura) {

        return service.actualizar(id, asignatura);
    }

    // ELIMINAR LÓGICAMENTE
    @PatchMapping("/{id}/eliminar")
    public Asignatura eliminar(@PathVariable Integer id) {
        return service.eliminar(id);
    }

    // RESTAURAR ASIGNATURA
    @PatchMapping("/{id}/restaurar")
    public Asignatura restaurar(@PathVariable Integer id) {
        return service.restaurar(id);
    }

    // CONSULTAR ASIGNATURAS
    @PostMapping("/consulta")
    public List<Asignatura> consultar(
            @RequestBody Map<String, String> filtros) {

        String nombre = filtros.get("nombre");
        String descripcion = filtros.get("descripcion");

        if (nombre != null && !nombre.isBlank()) {
            return service.buscarPorNombre(nombre);
        }

        if (descripcion != null && !descripcion.isBlank()) {
            return service.buscarPorDescripcion(descripcion);
        }

        return service.listar();
    }
}
