
package pe.edu.centrodevarones.app.service;

import pe.edu.centrodevarones.app.entity.MatriculaEstudiante;
import pe.edu.centrodevarones.app.repository.MatriculaEstudianteRepository;
import pe.edu.centrodevarones.app.repository.EstudianteRepository;
import pe.edu.centrodevarones.app.repository.GradoSeccionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MatriculaEstudianteService {

    private final MatriculaEstudianteRepository repository;
    private final EstudianteRepository estudianteRepository;
    private final GradoSeccionRepository gradoSeccionRepository;

    public MatriculaEstudianteService(
            MatriculaEstudianteRepository repository,
            EstudianteRepository estudianteRepository,
            GradoSeccionRepository gradoSeccionRepository) {

        this.repository = repository;
        this.estudianteRepository = estudianteRepository;
        this.gradoSeccionRepository = gradoSeccionRepository;
    }

    // 1. LISTAR MATRÍCULAS ACTIVAS
    @Transactional(readOnly = true)
    public List<MatriculaEstudiante> listar() {
        return repository.findByEstadoTrue();
    }

    // 2. BUSCAR MATRÍCULA POR ID
    @Transactional(readOnly = true)
    public MatriculaEstudiante buscarPorId(Integer id) {

        MatriculaEstudiante matricula = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La matrícula no existe"
                ));

        if (!Boolean.TRUE.equals(matricula.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "La matrícula está inactiva"
            );
        }

        return matricula;
    }

    // 3. LISTAR MATRÍCULAS POR SALÓN
    @Transactional(readOnly = true)
    public List<MatriculaEstudiante> listarPorSalon(
            Integer idGradoSeccion) {

        return repository.findByIdGradoSeccionAndEstadoTrue(
                idGradoSeccion
        );
    }

    // 4. LISTAR MATRÍCULAS POR ESTUDIANTE
    @Transactional(readOnly = true)
    public List<MatriculaEstudiante> listarPorEstudiante(
            Integer idEstudiante) {

        return repository.findByIdEstudianteAndEstadoTrue(
                idEstudiante
        );
    }

    // 5. CONTAR MATRÍCULAS ACTIVAS POR SALÓN
    @Transactional(readOnly = true)
    public long contarPorSalon(Integer idGradoSeccion) {

        return repository.countByIdGradoSeccionAndEstadoTrue(
                idGradoSeccion
        );
    }

    // 6. REGISTRAR MATRÍCULA
    @Transactional
    public MatriculaEstudiante registrar(
            MatriculaEstudiante matricula) {

        validarDatos(matricula);

        // Verificar que el estudiante exista
        var estudiante = estudianteRepository.findById(
                matricula.getIdEstudiante()
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El estudiante seleccionado no existe"
        ));

        if (!Boolean.TRUE.equals(estudiante.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estudiante está inactivo"
            );
        }

        // Verificar que el grado y sección existan
        var gradoSeccion = gradoSeccionRepository.findById(
                matricula.getIdGradoSeccion()
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

        // Evitar matrículas duplicadas
        boolean existe =
                repository.existsByIdEstudianteAndIdGradoSeccion(
                        matricula.getIdEstudiante(),
                        matricula.getIdGradoSeccion()
                );

        if (existe) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El estudiante ya tiene una matrícula "
                    + "registrada en este salón"
            );
        }

        // Validar capacidad del salón
        long matriculados = repository
                .countByIdGradoSeccionAndEstadoTrue(
                        matricula.getIdGradoSeccion()
                );

        if (matriculados >= gradoSeccion.getCapacidad()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El salón alcanzó su capacidad máxima"
            );
        }

        // Preparar el nuevo registro
        matricula.setIdMatricula(null);
        matricula.setEstado(true);
        matricula.setFechaCreacion(null);
        matricula.setUsuarioCreacion(null);
        matricula.setFechaModificacion(null);
        matricula.setUsuarioModificacion(null);

        return repository.save(matricula);
    }

    // 7. ELIMINACIÓN LÓGICA
    @Transactional
    public MatriculaEstudiante eliminar(Integer id) {

        MatriculaEstudiante matricula = buscarPorId(id);

        matricula.setEstado(false);

        return repository.save(matricula);
    }

    // 8. VALIDAR DATOS OBLIGATORIOS
    private void validarDatos(MatriculaEstudiante matricula) {

        if (matricula == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe proporcionar los datos de la matrícula"
            );
        }

        if (matricula.getIdEstudiante() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un estudiante"
            );
        }

        if (matricula.getIdGradoSeccion() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un grado y sección"
            );
        }
    }
}
