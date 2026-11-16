
package pe.edu.centrodevarones.app.service;

import pe.edu.centrodevarones.app.entity.RegistroNota;
import pe.edu.centrodevarones.app.repository.RegistroNotaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class RegistroNotaService {

    private final RegistroNotaRepository repository;

    public RegistroNotaService(
            RegistroNotaRepository repository) {
        this.repository = repository;
    }

    // 1. LISTAR NOTAS ACTIVAS
    @Transactional(readOnly = true)
    public List<RegistroNota> listar() {
        return repository.findByEstadoTrue();
    }

    // 2. BUSCAR NOTA POR ID
    @Transactional(readOnly = true)
    public RegistroNota buscarPorId(Integer id) {

        RegistroNota nota = repository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "La calificación no existe"
                        )
                );

        if (!Boolean.TRUE.equals(nota.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "La calificación está inactiva"
            );
        }

        return nota;
    }

    // 3. CONSULTAR NOTAS POR MATRÍCULA
    @Transactional(readOnly = true)
    public List<RegistroNota> listarPorMatricula(
            Integer idMatricula) {

        return repository.findByIdMatriculaAndEstadoTrue(
                idMatricula
        );
    }

    // 4. CONSULTAR NOTAS POR EVALUACIÓN
    @Transactional(readOnly = true)
    public List<RegistroNota> listarPorEvaluacion(
            Integer idEvaluacion) {

        return repository.findByIdEvaluacionAndEstadoTrue(
                idEvaluacion
        );
    }

    // 5. REGISTRAR UNA CALIFICACIÓN
    @Transactional
    public RegistroNota registrar(RegistroNota nota) {

        validarDatos(nota);

        boolean existe =
                repository.existsByIdEvaluacionAndIdMatricula(
                        nota.getIdEvaluacion(),
                        nota.getIdMatricula()
                );

        if (existe) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El estudiante ya tiene una nota "
                    + "registrada para esta evaluación"
            );
        }

        nota.setIdNota(null);
        nota.setEstado(true);

        // Los campos de auditoría los gestiona la entidad.
        nota.setFechaCreacion(null);
        nota.setFechaModificacion(null);
        nota.setUsuarioCreacion(null);
        nota.setUsuarioModificacion(null);

        return repository.save(nota);
    }

    // 6. ACTUALIZAR UNA CALIFICACIÓN
    @Transactional
    public RegistroNota actualizar(
            Integer id,
            RegistroNota datos) {

        RegistroNota nota = buscarPorId(id);

        if (datos == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe proporcionar los datos"
            );
        }

        validarCalificacion(datos.getCalificacion());

        // Solo permitimos modificar la nota y observación.
        // La matrícula y evaluación originales se conservan.
        nota.setCalificacion(datos.getCalificacion());
        nota.setObservacion(datos.getObservacion());

        return repository.save(nota);
    }

    // 7. ELIMINACIÓN LÓGICA
    @Transactional
    public RegistroNota eliminar(Integer id) {

        RegistroNota nota = buscarPorId(id);

        nota.setEstado(false);

        return repository.save(nota);
    }

    // 8. VALIDAR DATOS
    private void validarDatos(RegistroNota nota) {

        if (nota == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe proporcionar una calificación"
            );
        }

        if (nota.getIdEvaluacion() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar una evaluación"
            );
        }

        if (nota.getIdMatricula() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar una matrícula"
            );
        }

        validarCalificacion(nota.getCalificacion());
    }

    // 9. VALIDAR CALIFICACIÓN DE 0 A 20
    private void validarCalificacion(
            BigDecimal calificacion) {

        if (calificacion == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La calificación es obligatoria"
            );
        }

        if (calificacion.compareTo(BigDecimal.ZERO) < 0
                || calificacion.compareTo(
                        new BigDecimal("20")) > 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La calificación debe estar entre 0 y 20"
            );
        }

        if (calificacion.scale() > 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La calificación admite máximo 2 decimales"
            );
        }
    }
}
