
package pe.edu.centrodevarones.app.service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.centrodevarones.app.dto.GestionEstudianteResponse;
import pe.edu.centrodevarones.app.entity.Estudiante;
import pe.edu.centrodevarones.app.entity.GradoSeccion;
import pe.edu.centrodevarones.app.entity.MatriculaEstudiante;
import pe.edu.centrodevarones.app.repository.CuentaEstudianteRepository;
import pe.edu.centrodevarones.app.repository.EstudianteRepository;
import pe.edu.centrodevarones.app.repository.GradoSeccionRepository;
import pe.edu.centrodevarones.app.repository.MatriculaEstudianteRepository;

@Service
public class GestionEstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final MatriculaEstudianteRepository matriculaRepository;
    private final GradoSeccionRepository gradoSeccionRepository;
    private final CuentaEstudianteRepository cuentaRepository;

    public GestionEstudianteService(
            EstudianteRepository estudianteRepository,
            MatriculaEstudianteRepository matriculaRepository,
            GradoSeccionRepository gradoSeccionRepository,
            CuentaEstudianteRepository cuentaRepository
    ) {
        this.estudianteRepository = estudianteRepository;
        this.matriculaRepository = matriculaRepository;
        this.gradoSeccionRepository = gradoSeccionRepository;
        this.cuentaRepository = cuentaRepository;
    }

    // LISTAR ESTUDIANTES MATRICULADOS
    @Transactional(readOnly = true)
    public List<GestionEstudianteResponse> listar(
            Integer anioEscolar
    ) {

        List<MatriculaEstudiante> matriculas =
                anioEscolar == null
                    ? matriculaRepository.findByEstadoTrue()
                    : matriculaRepository
                        .buscarMatriculasActivasPorAnio(anioEscolar);

        return matriculas.stream()
                .map(this::convertirRespuesta)
                .filter(Objects::nonNull)
                .sorted(
                    Comparator.comparing(
                        GestionEstudianteResponse::apellidos,
                        String.CASE_INSENSITIVE_ORDER
                    ).thenComparing(
                        GestionEstudianteResponse::nombres,
                        String.CASE_INSENSITIVE_ORDER
                    )
                )
                .toList();
    }

    // CONVERTIR MATRÍCULA A RESPUESTA
    private GestionEstudianteResponse convertirRespuesta(
            MatriculaEstudiante matricula
    ) {

        Estudiante estudiante = estudianteRepository
                .findById(matricula.getIdEstudiante())
                .orElse(null);

        GradoSeccion gradoSeccion = gradoSeccionRepository
                .findById(matricula.getIdGradoSeccion())
                .orElse(null);

        if (estudiante == null || gradoSeccion == null) {
            return null;
        }

        String correo = cuentaRepository
                .findByIdEstudiante(estudiante.getIdEstudiante())
                .map(cuenta -> cuenta.getCorreo())
                .orElse("");

        String tipoDocumento =
                Integer.valueOf(1).equals(
                    estudiante.getIdTipoDocumento()
                ) ? "DNI" :
                Integer.valueOf(2).equals(
                    estudiante.getIdTipoDocumento()
                ) ? "CE" : "Otro";

        return new GestionEstudianteResponse(
                estudiante.getIdEstudiante(),
                matricula.getIdMatricula(),
                tipoDocumento,
                estudiante.getNumeroDocumento(),
                estudiante.getNombres(),
                estudiante.getApellidos(),
                correo,
                gradoSeccion.getGrado() + ".°",
                gradoSeccion.getSeccion(),
                gradoSeccion.getAnioEscolar(),
                Boolean.TRUE.equals(matricula.getEstado())
                    && Boolean.TRUE.equals(estudiante.getEstado())
        );
    }
}
