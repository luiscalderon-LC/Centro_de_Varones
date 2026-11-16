
package pe.edu.centrodevarones.app.service;

import pe.edu.centrodevarones.app.entity.AsignacionDocente;

import pe.edu.centrodevarones.app.repository.AsignacionDocenteRepository;
import pe.edu.centrodevarones.app.repository.DocenteRepository;
import pe.edu.centrodevarones.app.repository.AsignaturaRepository;
import pe.edu.centrodevarones.app.repository.GradoSeccionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AsignacionDocenteService {

    private final AsignacionDocenteRepository repository;
    private final DocenteRepository docenteRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final GradoSeccionRepository gradoSeccionRepository;

    public AsignacionDocenteService(
            AsignacionDocenteRepository repository,
            DocenteRepository docenteRepository,
            AsignaturaRepository asignaturaRepository,
            GradoSeccionRepository gradoSeccionRepository) {

        this.repository = repository;
        this.docenteRepository = docenteRepository;
        this.asignaturaRepository = asignaturaRepository;
        this.gradoSeccionRepository = gradoSeccionRepository;
    }

    // 1. LISTAR ASIGNACIONES ACTIVAS
    @Transactional(readOnly = true)
    public List<AsignacionDocente> listar() {

        return repository.findByEstadoTrue();
    }

    // 2. BUSCAR ASIGNACIÓN POR ID
    @Transactional(readOnly = true)
    public AsignacionDocente buscarPorId(Integer id) {

        AsignacionDocente asignacion = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La asignación docente no existe"
                ));

        if (!Boolean.TRUE.equals(asignacion.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "La asignación docente está inactiva"
            );
        }

        return asignacion;
    }

    // 3. LISTAR ASIGNACIONES POR DOCENTE
    @Transactional(readOnly = true)
    public List<AsignacionDocente> listarPorDocente(
            Integer idDocente) {

        return repository.findByIdDocenteAndEstadoTrue(
                idDocente
        );
    }

    // 4. LISTAR ASIGNACIONES POR SALÓN
    @Transactional(readOnly = true)
    public List<AsignacionDocente> listarPorSalon(
            Integer idGradoSeccion) {

        return repository.findByIdGradoSeccionAndEstadoTrue(
                idGradoSeccion
        );
    }

    // 5. LISTAR ASIGNACIONES POR ASIGNATURA
    @Transactional(readOnly = true)
    public List<AsignacionDocente> listarPorAsignatura(
            Integer idAsignatura) {

        return repository.findByIdAsignaturaAndEstadoTrue(
                idAsignatura
        );
    }

    // 6. LISTAR CURSOS DE UN DOCENTE EN UN SALÓN
    @Transactional(readOnly = true)
    public List<AsignacionDocente> listarPorDocenteYSalon(
            Integer idDocente,
            Integer idGradoSeccion) {

        return repository
                .findByIdDocenteAndIdGradoSeccionAndEstadoTrue(
                        idDocente,
                        idGradoSeccion
                );
    }

    // 7. CONTAR ASIGNACIONES DE UN DOCENTE
    @Transactional(readOnly = true)
    public long contarPorDocente(Integer idDocente) {

        return repository.countByIdDocenteAndEstadoTrue(
                idDocente
        );
    }

    // 8. REGISTRAR ASIGNACIÓN DOCENTE
    @Transactional
    public AsignacionDocente registrar(
            AsignacionDocente asignacion) {

        validarDatos(asignacion);

        // Verificar que el docente exista
        var docente = docenteRepository.findById(
                asignacion.getIdDocente()
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El docente seleccionado no existe"
        ));

        if (!Boolean.TRUE.equals(docente.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El docente está inactivo"
            );
        }

        // Verificar que la asignatura exista
        var asignatura = asignaturaRepository.findById(
                asignacion.getIdAsignatura()
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La asignatura seleccionada no existe"
        ));

        if (!Boolean.TRUE.equals(asignatura.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La asignatura está inactiva"
            );
        }

        // Verificar que el grado y sección existan
        var gradoSeccion = gradoSeccionRepository.findById(
                asignacion.getIdGradoSeccion()
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El grado y sección no existen"
        ));

        if (!Boolean.TRUE.equals(gradoSeccion.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El grado y sección están inactivos"
            );
        }

        // Evitar asignaciones duplicadas
        boolean existe = repository
                .existsByIdDocenteAndIdAsignaturaAndIdGradoSeccion(
                        asignacion.getIdDocente(),
                        asignacion.getIdAsignatura(),
                        asignacion.getIdGradoSeccion()
                );

        if (existe) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El docente ya tiene registrada "
                    + "esta asignatura en el salón seleccionado"
            );
        }

        // Preparar la nueva asignación
        asignacion.setIdAsignacion(null);
        asignacion.setEstado(true);
        asignacion.setFechaCreacion(null);
        asignacion.setUsuarioCreacion(null);
        asignacion.setFechaModificacion(null);
        asignacion.setUsuarioModificacion(null);

        return repository.save(asignacion);
    }

    // 9. ELIMINACIÓN LÓGICA
    @Transactional
    public AsignacionDocente eliminar(Integer id) {

        AsignacionDocente asignacion = buscarPorId(id);

        asignacion.setEstado(false);

        return repository.save(asignacion);
    }

    // 10. VALIDAR DATOS OBLIGATORIOS
    private void validarDatos(AsignacionDocente asignacion) {

        if (asignacion == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe proporcionar los datos de la asignación"
            );
        }

        if (asignacion.getIdDocente() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un docente"
            );
        }

        if (asignacion.getIdAsignatura() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar una asignatura"
            );
        }

        if (asignacion.getIdGradoSeccion() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un grado y sección"
            );
        }
    }
}
