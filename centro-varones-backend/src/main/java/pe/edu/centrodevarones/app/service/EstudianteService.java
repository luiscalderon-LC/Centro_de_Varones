
package pe.edu.centrodevarones.app.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.centrodevarones.app.entity.Estudiante;
import pe.edu.centrodevarones.app.repository.EstudianteRepository;

@Service
public class EstudianteService {

    private final EstudianteRepository repository;

    public EstudianteService(EstudianteRepository repository) {
        this.repository = repository;
    }

    // LISTAR ESTUDIANTES
    public List<Estudiante> listar() {
        return repository.findAll();
    }

    // BUSCAR ESTUDIANTE POR ID
    public Estudiante buscar(Integer id) {
        return repository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Estudiante no encontrado"
                    )
                );
    }

    // REGISTRAR ESTUDIANTE
    public Estudiante guardar(Estudiante estudiante) {
        estudiante.setIdEstudiante(null);
        return repository.save(estudiante);
    }

    // ACTUALIZAR ESTUDIANTE
    public Estudiante actualizar(Integer id, Estudiante datos) {

        Estudiante estudiante = buscar(id);

        estudiante.setIdTipoDocumento(datos.getIdTipoDocumento());
        estudiante.setNumeroDocumento(datos.getNumeroDocumento());
        estudiante.setNombres(datos.getNombres());
        estudiante.setApellidos(datos.getApellidos());
        estudiante.setNacionalidad(datos.getNacionalidad());

        return repository.save(estudiante);
    }

    // ELIMINAR ESTUDIANTE
    public void eliminar(Integer id) {
        Estudiante estudiante = buscar(id);
        repository.delete(estudiante);
    }
}
