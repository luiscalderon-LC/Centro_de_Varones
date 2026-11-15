
package pe.edu.centrodevarones.app.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.centrodevarones.app.entity.Docente;
import pe.edu.centrodevarones.app.service.DocenteService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/docentes")
public class DocenteController {

    private final DocenteService service;

    public DocenteController(DocenteService service) {
        this.service = service;
    }

    // LISTAR DOCENTES ACTIVOS
    @GetMapping
    public List<Docente> listar() {
        return service.listar();
    }

    // LISTAR DOCENTES ELIMINADOS
    @GetMapping("/eliminados")
    public List<Docente> listarEliminados() {
        return service.listarEliminados();
    }

    // BUSCAR DOCENTE POR ID
    @GetMapping("/{id}")
    public Docente buscar(@PathVariable Integer id) {
        return service.buscar(id);
    }

    // REGISTRAR DOCENTE
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Docente guardar(@RequestBody Docente docente) {
        return service.guardar(docente);
    }

    // ACTUALIZAR DOCENTE
    @PutMapping("/{id}")
    public Docente actualizar(
            @PathVariable Integer id,
            @RequestBody Docente docente) {

        return service.actualizar(id, docente);
    }

    // ELIMINAR LÓGICAMENTE
    @PatchMapping("/{id}/eliminar")
    public Docente eliminar(@PathVariable Integer id) {
        return service.eliminar(id);
    }

    // RESTAURAR DOCENTE
    @PatchMapping("/{id}/restaurar")
    public Docente restaurar(@PathVariable Integer id) {
        return service.restaurar(id);
    }

    // CONSULTAR DOCENTES
    @PostMapping("/consulta")
    public Object consultar(@RequestBody Map<String, String> filtros) {

        String documento = filtros.get("numeroDocumento");
        String correo = filtros.get("correo");
        String nombres = filtros.get("nombres");
        String apellidos = filtros.get("apellidos");
        String especialidad = filtros.get("especialidad");

        if (documento != null && !documento.isBlank()) {
            return service.buscarPorDocumento(documento);
        }

        if (correo != null && !correo.isBlank()) {
            return service.buscarPorCorreo(correo);
        }

        if (nombres != null && !nombres.isBlank()) {
            return service.buscarPorNombres(nombres);
        }

        if (apellidos != null && !apellidos.isBlank()) {
            return service.buscarPorApellidos(apellidos);
        }

        if (especialidad != null && !especialidad.isBlank()) {
            return service.buscarPorEspecialidad(especialidad);
        }

        return service.listar();
    }
}
