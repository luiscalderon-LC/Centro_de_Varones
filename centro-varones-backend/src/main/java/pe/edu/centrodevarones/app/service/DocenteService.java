
package pe.edu.centrodevarones.app.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.centrodevarones.app.entity.Docente;
import pe.edu.centrodevarones.app.repository.DocenteRepository;

import java.util.List;

@Service
public class DocenteService {

    private final DocenteRepository repository;

    public DocenteService(DocenteRepository repository) {
        this.repository = repository;
    }

    // LISTAR DOCENTES ACTIVOS
    public List<Docente> listar() {
        return repository.findByEstadoTrue();
    }

    // LISTAR DOCENTES ELIMINADOS
    public List<Docente> listarEliminados() {
        return repository.findByEstadoFalse();
    }

    // BUSCAR DOCENTE POR ID
    public Docente buscar(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Docente no encontrado"
                ));
    }

    // REGISTRAR DOCENTE
    public Docente guardar(Docente docente) {

        validarDatos(docente);

        if (repository.existsByNumeroDocumento(
                docente.getNumeroDocumento())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El número de documento ya está registrado"
            );
        }

        if (repository.existsByCorreoIgnoreCase(
                docente.getCorreo())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El correo electrónico ya está registrado"
            );
        }

        docente.setIdDocente(null);
        docente.setEstado(true);

        // LA AUDITORÍA SE GENERA AUTOMÁTICAMENTE
        docente.setFechaCreacion(null);
        docente.setUsuarioCreacion(null);
        docente.setFechaModificacion(null);
        docente.setUsuarioModificacion(null);

        return repository.save(docente);
    }

    // ACTUALIZAR DOCENTE
    public Docente actualizar(Integer id, Docente datos) {

        Docente docente = buscar(id);

        if (Boolean.FALSE.equals(docente.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede actualizar un docente eliminado"
            );
        }

        validarDatos(datos);

        // VALIDAR DOCUMENTO DUPLICADO
        repository.findByNumeroDocumento(datos.getNumeroDocumento())
                .ifPresent(existente -> {
                    if (!existente.getIdDocente().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "El documento pertenece a otro docente"
                        );
                    }
                });

        // VALIDAR CORREO DUPLICADO
        repository.findByCorreoIgnoreCase(datos.getCorreo())
                .ifPresent(existente -> {
                    if (!existente.getIdDocente().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "El correo pertenece a otro docente"
                        );
                    }
                });

        docente.setIdTipoDocumento(datos.getIdTipoDocumento());
        docente.setNumeroDocumento(datos.getNumeroDocumento());
        docente.setNombres(datos.getNombres());
        docente.setApellidos(datos.getApellidos());
        docente.setEspecialidad(datos.getEspecialidad());
        docente.setCorreo(datos.getCorreo());

        docente.setUsuarioModificacion("SISTEMA");

        return repository.save(docente);
    }

    // ELIMINACIÓN LÓGICA
    public Docente eliminar(Integer id) {

        Docente docente = buscar(id);

        if (Boolean.FALSE.equals(docente.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El docente ya se encuentra eliminado"
            );
        }

        docente.setEstado(false);
        docente.setUsuarioModificacion("SISTEMA");

        return repository.save(docente);
    }

    // RESTAURAR DOCENTE
    public Docente restaurar(Integer id) {

        Docente docente = buscar(id);

        if (Boolean.TRUE.equals(docente.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El docente ya se encuentra activo"
            );
        }

        docente.setEstado(true);
        docente.setUsuarioModificacion("SISTEMA");

        return repository.save(docente);
    }

    // BUSCAR POR DOCUMENTO
    public Docente buscarPorDocumento(String numeroDocumento) {

        Docente docente = repository.findByNumeroDocumento(numeroDocumento)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No existe un docente con ese documento"
                ));

        if (Boolean.FALSE.equals(docente.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No existe un docente activo con ese documento"
            );
        }

        return docente;
    }

    // BUSCAR POR CORREO
    public Docente buscarPorCorreo(String correo) {

        Docente docente = repository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No existe un docente con ese correo"
                ));

        if (Boolean.FALSE.equals(docente.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No existe un docente activo con ese correo"
            );
        }

        return docente;
    }

    // BUSCAR POR NOMBRES
    public List<Docente> buscarPorNombres(String nombres) {
        return repository
                .findByNombresContainingIgnoreCaseAndEstadoTrue(nombres);
    }

    // BUSCAR POR APELLIDOS
    public List<Docente> buscarPorApellidos(String apellidos) {
        return repository
                .findByApellidosContainingIgnoreCaseAndEstadoTrue(apellidos);
    }

    // BUSCAR POR ESPECIALIDAD
    public List<Docente> buscarPorEspecialidad(String especialidad) {
        return repository
                .findByEspecialidadContainingIgnoreCaseAndEstadoTrue(especialidad);
    }

    // VALIDACIONES
    private void validarDatos(Docente docente) {

        if (docente.getIdTipoDocumento() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un tipo de documento"
            );
        }

        if (docente.getNumeroDocumento() == null ||
                docente.getNumeroDocumento().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El número de documento es obligatorio"
            );
        }

        if (!docente.getNumeroDocumento().matches("\\d{8,15}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El documento debe contener entre 8 y 15 dígitos"
            );
        }

        if (docente.getNombres() == null ||
                docente.getNombres().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los nombres son obligatorios"
            );
        }

        if (docente.getApellidos() == null ||
                docente.getApellidos().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los apellidos son obligatorios"
            );
        }

        if (docente.getEspecialidad() == null ||
                docente.getEspecialidad().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La especialidad es obligatoria"
            );
        }

        if (docente.getCorreo() == null ||
                docente.getCorreo().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El correo electrónico es obligatorio"
            );
        }

        if (!docente.getCorreo().matches(
                "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El correo electrónico no tiene un formato válido"
            );
        }
    }
}
