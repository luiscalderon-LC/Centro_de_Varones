
package pe.edu.centrodevarones.app.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.centrodevarones.app.entity.Asignatura;
import pe.edu.centrodevarones.app.repository.AsignaturaRepository;

import java.util.List;

@Service
public class AsignaturaService {

    private final AsignaturaRepository repository;

    public AsignaturaService(AsignaturaRepository repository) {
        this.repository = repository;
    }

    // LISTAR ASIGNATURAS ACTIVAS
    public List<Asignatura> listar() {
        return repository.findByEstadoTrue();
    }

    // LISTAR ASIGNATURAS ELIMINADAS
    public List<Asignatura> listarEliminados() {
        return repository.findByEstadoFalse();
    }

    // BUSCAR ASIGNATURA POR ID
    public Asignatura buscar(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Asignatura no encontrada"
                ));
    }

    // REGISTRAR ASIGNATURA
    public Asignatura guardar(Asignatura asignatura) {

        validarDatos(asignatura);

        if (repository.existsByNombreIgnoreCase(
                asignatura.getNombre())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La asignatura ya se encuentra registrada"
            );
        }

        asignatura.setIdAsignatura(null);
        asignatura.setEstado(true);

        // LA AUDITORÍA SE GENERA AUTOMÁTICAMENTE
        asignatura.setFechaCreacion(null);
        asignatura.setUsuarioCreacion(null);
        asignatura.setFechaModificacion(null);
        asignatura.setUsuarioModificacion(null);

        return repository.save(asignatura);
    }

    // ACTUALIZAR ASIGNATURA
    public Asignatura actualizar(Integer id, Asignatura datos) {

        Asignatura asignatura = buscar(id);

        if (Boolean.FALSE.equals(asignatura.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede actualizar una asignatura eliminada"
            );
        }

        validarDatos(datos);

        // VALIDAR NOMBRE DUPLICADO
        repository.findByNombreIgnoreCase(datos.getNombre())
                .ifPresent(existente -> {
                    if (!existente.getIdAsignatura().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "El nombre pertenece a otra asignatura"
                        );
                    }
                });

        asignatura.setNombre(datos.getNombre());
        asignatura.setDescripcion(datos.getDescripcion());
        asignatura.setUsuarioModificacion("SISTEMA");

        return repository.save(asignatura);
    }

    // ELIMINACIÓN LÓGICA
    public Asignatura eliminar(Integer id) {

        Asignatura asignatura = buscar(id);

        if (Boolean.FALSE.equals(asignatura.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La asignatura ya se encuentra eliminada"
            );
        }

        asignatura.setEstado(false);
        asignatura.setUsuarioModificacion("SISTEMA");

        return repository.save(asignatura);
    }

    // RESTAURAR ASIGNATURA
    public Asignatura restaurar(Integer id) {

        Asignatura asignatura = buscar(id);

        if (Boolean.TRUE.equals(asignatura.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La asignatura ya se encuentra activa"
            );
        }

        asignatura.setEstado(true);
        asignatura.setUsuarioModificacion("SISTEMA");

        return repository.save(asignatura);
    }

    // BUSCAR POR NOMBRE
    public List<Asignatura> buscarPorNombre(String nombre) {
        return repository
                .findByNombreContainingIgnoreCaseAndEstadoTrue(nombre);
    }

    // BUSCAR POR DESCRIPCIÓN
    public List<Asignatura> buscarPorDescripcion(String descripcion) {
        return repository
                .findByDescripcionContainingIgnoreCaseAndEstadoTrue(descripcion);
    }

    // VALIDACIONES
    private void validarDatos(Asignatura asignatura) {

        if (asignatura.getNombre() == null ||
                asignatura.getNombre().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre de la asignatura es obligatorio"
            );
        }

        // ELIMINAR ESPACIOS INNECESARIOS
        asignatura.setNombre(asignatura.getNombre().trim());

        if (asignatura.getNombre().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre no puede superar los 100 caracteres"
            );
        }

        if (asignatura.getDescripcion() != null) {

            asignatura.setDescripcion(
                    asignatura.getDescripcion().trim()
            );

            if (asignatura.getDescripcion().length() > 300) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La descripción no puede superar los 300 caracteres"
                );
            }
        }
    }
}
