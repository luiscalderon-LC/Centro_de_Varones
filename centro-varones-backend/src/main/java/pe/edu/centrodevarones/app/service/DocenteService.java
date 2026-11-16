
package pe.edu.centrodevarones.app.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.centrodevarones.app.entity.Docente;
import pe.edu.centrodevarones.app.entity.CuentaDocente;

import pe.edu.centrodevarones.app.repository.DocenteRepository;
import pe.edu.centrodevarones.app.repository.CuentaDocenteRepository;

import java.util.List;

@Service
public class DocenteService {

    private final DocenteRepository repository;
    private final CuentaDocenteRepository cuentaRepository;

    public DocenteService(
            DocenteRepository repository,
            CuentaDocenteRepository cuentaRepository
    ) {
        this.repository = repository;
        this.cuentaRepository = cuentaRepository;
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
    @Transactional
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

        // REINICIAR DATOS DE AUDITORÍA
        docente.setFechaCreacion(null);
        docente.setUsuarioCreacion(null);
        docente.setFechaModificacion(null);
        docente.setUsuarioModificacion(null);

        return repository.save(docente);
    }

    // ACTUALIZAR DOCENTE
    @Transactional
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
        repository.findByNumeroDocumento(
                datos.getNumeroDocumento()
        ).ifPresent(existente -> {

            if (!existente.getIdDocente().equals(id)) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El documento pertenece a otro docente"
                );
            }
        });

        // VALIDAR CORREO DUPLICADO
        repository.findByCorreoIgnoreCase(
                datos.getCorreo()
        ).ifPresent(existente -> {

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

    // ELIMINACIÓN LÓGICA DEL DOCENTE
    @Transactional
    public Docente eliminar(Integer id) {

        Docente docente = buscar(id);

        if (Boolean.FALSE.equals(docente.getEstado())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El docente ya se encuentra eliminado"
            );
        }

        // BUSCAR CUENTA DEL DOCENTE
        CuentaDocente cuenta = cuentaRepository
                .findByIdDocente(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El docente no tiene una cuenta asociada"
                ));

        // DESACTIVAR DOCENTE
        docente.setEstado(false);
        docente.setUsuarioModificacion("SISTEMA");

        // DESACTIVAR CUENTA
        cuenta.setEstado(false);

        cuentaRepository.save(cuenta);

        return repository.save(docente);
    }

    // RESTAURAR DOCENTE Y SU CUENTA
    @Transactional
    public Docente restaurar(Integer id) {

        Docente docente = buscar(id);

        if (Boolean.TRUE.equals(docente.getEstado())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El docente ya se encuentra activo"
            );
        }

        // BUSCAR CUENTA ASOCIADA
        CuentaDocente cuenta = cuentaRepository
                .findByIdDocente(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El docente no tiene una cuenta asociada"
                ));

        // ACTIVAR DOCENTE
        docente.setEstado(true);
        docente.setUsuarioModificacion("SISTEMA");

        // ACTIVAR CUENTA
        cuenta.setEstado(true);

        cuentaRepository.save(cuenta);

        return repository.save(docente);
    }

    // BUSCAR POR DOCUMENTO
    public Docente buscarPorDocumento(String numeroDocumento) {

        Docente docente = repository
                .findByNumeroDocumento(numeroDocumento)
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

        Docente docente = repository
                .findByCorreoIgnoreCase(correo)
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
                .findByEspecialidadContainingIgnoreCaseAndEstadoTrue(
                        especialidad
                );
    }

    // VALIDAR DATOS
    private void validarDatos(Docente docente) {

        // TIPO DE DOCUMENTO
        Integer tipo = docente.getIdTipoDocumento();

        if (tipo == null || (tipo != 1 && tipo != 2)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un tipo de documento válido"
            );
        }

        // NÚMERO DE DOCUMENTO
        if (docente.getNumeroDocumento() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El número de documento es obligatorio"
            );
        }

        String documento = docente.getNumeroDocumento().trim();

        if (tipo == 1 && !documento.matches("\\d{8}")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El DNI debe tener exactamente 8 dígitos"
            );
        }

        if (tipo == 2 && !documento.matches("\\d{9}")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El carné de extranjería debe tener 9 dígitos"
            );
        }

        docente.setNumeroDocumento(documento);

        // NOMBRES
        if (docente.getNombres() == null ||
                docente.getNombres().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los nombres son obligatorios"
            );
        }

        docente.setNombres(docente.getNombres().trim());

        if (docente.getNombres().length() > 60) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los nombres no pueden superar los 60 caracteres"
            );
        }

        // APELLIDOS
        if (docente.getApellidos() == null ||
                docente.getApellidos().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los apellidos son obligatorios"
            );
        }

        docente.setApellidos(docente.getApellidos().trim());

        if (docente.getApellidos().length() > 60) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los apellidos no pueden superar los 60 caracteres"
            );
        }

        // ESPECIALIDAD
        if (docente.getEspecialidad() == null ||
                docente.getEspecialidad().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La especialidad es obligatoria"
            );
        }

        docente.setEspecialidad(docente.getEspecialidad().trim());

        if (docente.getEspecialidad().length() > 100) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La especialidad no puede superar los 100 caracteres"
            );
        }

        // CORREO INSTITUCIONAL
        if (docente.getCorreo() == null ||
                docente.getCorreo().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El correo electrónico es obligatorio"
            );
        }

        String correo = docente.getCorreo().trim().toLowerCase();

        if (!correo.matches(
                "^[a-z0-9._%+-]+@centrovarones\\.edu\\.pe$")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se permiten correos @centrovarones.edu.pe"
            );
        }

        if (correo.length() > 100) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El correo no puede superar los 100 caracteres"
            );
        }

        docente.setCorreo(correo);
    }
}
