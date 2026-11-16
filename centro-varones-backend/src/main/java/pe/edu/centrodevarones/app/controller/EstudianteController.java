
package pe.edu.centrodevarones.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.entity.Estudiante;
import pe.edu.centrodevarones.app.service.EstudianteService;

@RestController
@RequestMapping("/api/estudiantes")
public class EstudianteController {

    private final EstudianteService service;

    public EstudianteController(EstudianteService service) {
        this.service = service;
    }

    // GET - LISTAR TODOS
    @GetMapping
    public List<Estudiante> listar() {
        return service.listar();
    }

    // GET - BUSCAR POR ID
    @GetMapping("/{id}")
    public Estudiante buscar(@PathVariable Integer id) {
        return service.buscar(id);
    }

    // POST - REGISTRAR
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Estudiante guardar(@RequestBody Estudiante estudiante) {
        return service.guardar(estudiante);
    }

    // PUT - ACTUALIZAR
    @PutMapping("/{id}")
    public Estudiante actualizar(
            @PathVariable Integer id,
            @RequestBody Estudiante estudiante) {

        return service.actualizar(id, estudiante);
    }

    // DELETE - ELIMINAR
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Integer id) {
        service.eliminar(id);
    }
}
