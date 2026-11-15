
package pe.edu.centrodevarones.app.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.entity.Estudiante;
import pe.edu.centrodevarones.app.service.EstudianteService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/estudiantes")
public class EstudianteController {

    private final EstudianteService service;

    public EstudianteController(EstudianteService service) {
        this.service = service;
    }

    // LISTAR ESTUDIANTES ACTIVOS
    @GetMapping
    public List<Estudiante> listar() {
        return service.listar();
    }

    // LISTAR ESTUDIANTES ELIMINADOS
    @GetMapping("/eliminados")
    public List<Estudiante> listarEliminados() {
        return service.listarEliminados();
    }

    // BUSCAR ESTUDIANTE POR ID
    @GetMapping("/{id}")
    public Estudiante buscar(@PathVariable Integer id) {
        return service.buscar(id);
    }

    // REGISTRAR ESTUDIANTE
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Estudiante guardar(@RequestBody Estudiante estudiante) {
        return service.guardar(estudiante);
    }

    // ACTUALIZAR ESTUDIANTE
    @PutMapping("/{id}")
    public Estudiante actualizar(
            @PathVariable Integer id,
            @RequestBody Estudiante estudiante) {

        return service.actualizar(id, estudiante);
    }

    // ELIMINACIÓN LÓGICA
    @PatchMapping("/{id}/eliminar")
    public Estudiante eliminar(@PathVariable Integer id) {
        return service.eliminar(id);
    }

    // RESTAURAR ESTUDIANTE
    @PatchMapping("/{id}/restaurar")
    public Estudiante restaurar(@PathVariable Integer id) {
        return service.restaurar(id);
    }

    // CONSULTA POR DOCUMENTO, NOMBRES O APELLIDOS
    @PostMapping("/consulta")
    public Object consultar(@RequestBody Map<String, String> filtros) {

        String documento = filtros.get("numeroDocumento");
        String nombres = filtros.get("nombres");
        String apellidos = filtros.get("apellidos");

        if (documento != null && !documento.isBlank()) {
            return service.buscarPorDocumento(documento);
        }

        if (nombres != null && !nombres.isBlank()) {
            return service.buscarPorNombres(nombres);
        }

        if (apellidos != null && !apellidos.isBlank()) {
            return service.buscarPorApellidos(apellidos);
        }

        return service.listar();
    }
}
