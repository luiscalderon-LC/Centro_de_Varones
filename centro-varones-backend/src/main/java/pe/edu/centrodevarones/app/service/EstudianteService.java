
package pe.edu.centrodevarones.app.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.centrodevarones.app.entity.Estudiante;
import pe.edu.centrodevarones.app.repository.EstudianteRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class EstudianteService {

    private final EstudianteRepository repository;

    public EstudianteService(EstudianteRepository repository) {
        this.repository = repository;
    }

    // LISTAR ESTUDIANTES ACTIVOS
    public List<Estudiante> listar() {
        return repository.findByEstadoTrue();
    }

    // LISTAR ESTUDIANTES ELIMINADOS
    public List<Estudiante> listarEliminados() {
        return repository.findByEstadoFalse();
    }

    // BUSCAR ESTUDIANTE POR ID
    public Estudiante buscar(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Estudiante no encontrado"
                ));
    }

    // REGISTRAR ESTUDIANTE
    public Estudiante guardar(Estudiante estudiante) {

        validarDatos(estudiante);

        if (repository.existsByNumeroDocumento(
                estudiante.getNumeroDocumento())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El número de documento ya está registrado"
            );
        }

        estudiante.setIdEstudiante(null);
        estudiante.setEstado(true);

        estudiante.setFechaCreacion(null);
        estudiante.setFechaModificacion(null);
        estudiante.setUsuarioCreacion(null);
        estudiante.setUsuarioModificacion(null);

        return repository.save(estudiante);
    }

    // ACTUALIZAR ESTUDIANTE
    public Estudiante actualizar(Integer id, Estudiante datos) {

        Estudiante estudiante = buscar(id);

        if (Boolean.FALSE.equals(estudiante.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede actualizar un estudiante eliminado"
            );
        }

        validarDatos(datos);

        repository.findByNumeroDocumento(datos.getNumeroDocumento())
                .ifPresent(existente -> {
                    if (!existente.getIdEstudiante().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "El número de documento pertenece a otro estudiante"
                        );
                    }
                });

        estudiante.setIdTipoDocumento(datos.getIdTipoDocumento());
        estudiante.setNumeroDocumento(datos.getNumeroDocumento());
        estudiante.setNombres(datos.getNombres());
        estudiante.setApellidos(datos.getApellidos());
        estudiante.setNacionalidad(datos.getNacionalidad());
        estudiante.setFechaNacimiento(datos.getFechaNacimiento());

        estudiante.setUsuarioModificacion("SISTEMA");

        return repository.save(estudiante);
    }

    // ELIMINACIÓN LÓGICA
    public Estudiante eliminar(Integer id) {

        Estudiante estudiante = buscar(id);

        if (Boolean.FALSE.equals(estudiante.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estudiante ya se encuentra eliminado"
            );
        }

        estudiante.setEstado(false);
        estudiante.setUsuarioModificacion("SISTEMA");

        return repository.save(estudiante);
    }

    // RESTAURAR ESTUDIANTE
    public Estudiante restaurar(Integer id) {

        Estudiante estudiante = buscar(id);

        if (Boolean.TRUE.equals(estudiante.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estudiante ya se encuentra activo"
            );
        }

        estudiante.setEstado(true);
        estudiante.setUsuarioModificacion("SISTEMA");

        return repository.save(estudiante);
    }

    // CONSULTAR ESTUDIANTES POR DOCUMENTO
    public Estudiante buscarPorDocumento(String numeroDocumento) {

        return repository.findByNumeroDocumento(numeroDocumento)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No existe un estudiante con ese documento"
                ));
    }

    // CONSULTAR ESTUDIANTES POR NOMBRES
    public List<Estudiante> buscarPorNombres(String nombres) {
        return repository
                .findByNombresContainingIgnoreCaseAndEstadoTrue(nombres);
    }

    // CONSULTAR ESTUDIANTES POR APELLIDOS
    public List<Estudiante> buscarPorApellidos(String apellidos) {
        return repository
                .findByApellidosContainingIgnoreCaseAndEstadoTrue(apellidos);
    }

    // VALIDACIONES
    private void validarDatos(Estudiante estudiante) {

        if (estudiante.getIdTipoDocumento() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un tipo de documento"
            );
        }

        if (estudiante.getNumeroDocumento() == null ||
                estudiante.getNumeroDocumento().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El número de documento es obligatorio"
            );
        }

        if (!estudiante.getNumeroDocumento().matches("\\d{8,15}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El documento debe contener entre 8 y 15 dígitos"
            );
        }

        if (estudiante.getNombres() == null ||
                estudiante.getNombres().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los nombres son obligatorios"
            );
        }

        if (estudiante.getApellidos() == null ||
                estudiante.getApellidos().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los apellidos son obligatorios"
            );
        }

        if (estudiante.getNacionalidad() == null ||
                estudiante.getNacionalidad().isBlank()) {
            estudiante.setNacionalidad("Peruana");
        }

        if (estudiante.getFechaNacimiento() != null &&
                estudiante.getFechaNacimiento().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha de nacimiento no puede ser futura"
            );
        }
    }
}
