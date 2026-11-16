
package pe.edu.centrodevarones.app.service;

import pe.edu.centrodevarones.app.entity.Evaluacion;
import pe.edu.centrodevarones.app.entity.AsignacionDocente;

import pe.edu.centrodevarones.app.repository.EvaluacionRepository;
import pe.edu.centrodevarones.app.repository.AsignacionDocenteRepository;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class EvaluacionService {

    private final EvaluacionRepository repository;
    private final AsignacionDocenteRepository asignacionRepository;
    private final EntityManager entityManager;

    public EvaluacionService(
            EvaluacionRepository repository,
            AsignacionDocenteRepository asignacionRepository,
            EntityManager entityManager) {

        this.repository = repository;
        this.asignacionRepository = asignacionRepository;
        this.entityManager = entityManager;
    }

    // 1. LISTAR EVALUACIONES ACTIVAS
    @Transactional(readOnly = true)
    public List<Evaluacion> listar() {
        return repository.findByEstadoTrue();
    }

    // 2. BUSCAR EVALUACIÓN POR ID
    @Transactional(readOnly = true)
    public Evaluacion buscarPorId(Integer id) {

        Evaluacion evaluacion = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La evaluación no existe"
                ));

        if (!Boolean.TRUE.equals(evaluacion.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "La evaluación está inactiva"
            );
        }

        return evaluacion;
    }

    // 3. LISTAR EVALUACIONES POR ASIGNACIÓN
    @Transactional(readOnly = true)
    public List<Evaluacion> listarPorAsignacion(
            Integer idAsignacion) {

        return repository.findByIdAsignacionAndEstadoTrue(
                idAsignacion
        );
    }

    // 4. LISTAR EVALUACIONES POR PERIODO
    @Transactional(readOnly = true)
    public List<Evaluacion> listarPorPeriodo(
            Integer idPeriodo) {

        return repository.findByIdPeriodoAndEstadoTrue(
                idPeriodo
        );
    }

    // 5. LISTAR EVALUACIONES POR ASIGNACIÓN Y PERIODO
    @Transactional(readOnly = true)
    public List<Evaluacion> listarPorAsignacionYPeriodo(
            Integer idAsignacion,
            Integer idPeriodo) {

        return repository
                .findByIdAsignacionAndIdPeriodoAndEstadoTrue(
                        idAsignacion,
                        idPeriodo
                );
    }

    // 6. LISTAR EVALUACIONES POR TIPO
    @Transactional(readOnly = true)
    public List<Evaluacion> listarPorTipo(String tipo) {

        return repository.findByTipoEvaluacionAndEstadoTrue(
                tipo
        );
    }

    // 7. CONTAR EVALUACIONES POR ASIGNACIÓN
    @Transactional(readOnly = true)
    public long contarPorAsignacion(Integer idAsignacion) {

        return repository.countByIdAsignacionAndEstadoTrue(
                idAsignacion
        );
    }

    // 8. LISTAR EVALUACIONES ORDENADAS POR FECHA
    @Transactional(readOnly = true)
    public List<Evaluacion> listarOrdenadas(
            Integer idAsignacion) {

        return repository
                .findByIdAsignacionAndEstadoTrueOrderByFechaEvaluacionAsc(
                        idAsignacion
                );
    }

    // 9. REGISTRAR UNA EVALUACIÓN
    @Transactional
    public Evaluacion registrar(Evaluacion evaluacion) {

        validarDatos(evaluacion);

        // Verificar que la asignación exista
        AsignacionDocente asignacion =
                asignacionRepository.findById(
                        evaluacion.getIdAsignacion()
                ).orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La asignación docente no existe"
                ));

        if (!Boolean.TRUE.equals(asignacion.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La asignación docente está inactiva"
            );
        }


        // Verificar que el periodo académico exista
        Number periodosExistentes = (Number) entityManager
                .createNativeQuery("""
                    SELECT COUNT(*)
                    FROM administracion.Periodo
                    WHERE id_periodo = :idPeriodo
                    """)
                .setParameter(
                        "idPeriodo",
                        evaluacion.getIdPeriodo()
                )
                .getSingleResult();

        if (periodosExistentes.longValue() == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El periodo académico no existe"
            );
        }

        // Evitar evaluaciones activas duplicadas
        boolean existe = repository
                .existsByIdAsignacionAndIdPeriodoAndNombreAndEstadoTrue(
                        evaluacion.getIdAsignacion(),
                        evaluacion.getIdPeriodo(),
                        evaluacion.getNombre()
                );

        if (existe) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una evaluación activa "
                    + "con ese nombre en el periodo seleccionado"
            );
        }

        // Preparar el nuevo registro
        evaluacion.setIdEvaluacion(null);
        evaluacion.setEstado(true);
        evaluacion.setFechaCreacion(null);
        evaluacion.setUsuarioCreacion(null);
        evaluacion.setFechaModificacion(null);
        evaluacion.setUsuarioModificacion(null);

        if (evaluacion.getPonderacion() == null) {
            evaluacion.setPonderacion(
                    new BigDecimal("100.00")
            );
        }

        return repository.save(evaluacion);
    }

    // 10. ELIMINACIÓN LÓGICA
    @Transactional
    public Evaluacion eliminar(Integer id) {

        Evaluacion evaluacion = buscarPorId(id);

        evaluacion.setEstado(false);

        return repository.save(evaluacion);
    }

    // 11. VALIDAR DATOS
    private void validarDatos(Evaluacion evaluacion) {

        if (evaluacion == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe proporcionar los datos de la evaluación"
            );
        }

        if (evaluacion.getIdAsignacion() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar una asignación docente"
            );
        }

        if (evaluacion.getIdPeriodo() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un periodo académico"
            );
        }

        if (evaluacion.getNombre() == null ||
                evaluacion.getNombre().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe ingresar el nombre de la evaluación"
            );
        }

        if (evaluacion.getNombre().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre no puede superar 100 caracteres"
            );
        }

        if (evaluacion.getDescripcion() != null &&
                evaluacion.getDescripcion().length() > 300) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La descripción no puede superar 300 caracteres"
            );
        }

        if (evaluacion.getTipoEvaluacion() == null ||
                evaluacion.getTipoEvaluacion().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el tipo de evaluación"
            );
        }

        if (evaluacion.getTipoEvaluacion().length() > 30) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El tipo de evaluación no puede superar 30 caracteres"
            );
        }

        if (evaluacion.getFechaEvaluacion() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar la fecha de evaluación"
            );
        }

        BigDecimal ponderacion =
                evaluacion.getPonderacion() == null
                ? new BigDecimal("100.00")
                : evaluacion.getPonderacion();

        if (ponderacion.compareTo(BigDecimal.ZERO) <= 0 ||
                ponderacion.compareTo(
                        new BigDecimal("100.00")
                ) > 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La ponderación debe ser mayor que 0 "
                    + "y menor o igual que 100"
            );
        }

        if (ponderacion.scale() > 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La ponderación admite máximo dos decimales"
            );
        }
    }
}
