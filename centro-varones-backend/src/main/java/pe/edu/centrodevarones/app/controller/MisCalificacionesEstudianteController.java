
package pe.edu.centrodevarones.app.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.entity.*;
import pe.edu.centrodevarones.app.repository.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/estudiante")
public class MisCalificacionesEstudianteController {

    private final EstudianteRepository estudianteRepository;
    private final MatriculaEstudianteRepository matriculaRepository;
    private final GradoSeccionRepository gradoSeccionRepository;
    private final AsignacionDocenteRepository asignacionRepository;
    private final AsignaturaRepository asignaturaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final RegistroNotaRepository notaRepository;

    public MisCalificacionesEstudianteController(
            EstudianteRepository estudianteRepository,
            MatriculaEstudianteRepository matriculaRepository,
            GradoSeccionRepository gradoSeccionRepository,
            AsignacionDocenteRepository asignacionRepository,
            AsignaturaRepository asignaturaRepository,
            EvaluacionRepository evaluacionRepository,
            RegistroNotaRepository notaRepository
    ) {
        this.estudianteRepository = estudianteRepository;
        this.matriculaRepository = matriculaRepository;
        this.gradoSeccionRepository = gradoSeccionRepository;
        this.asignacionRepository = asignacionRepository;
        this.asignaturaRepository = asignaturaRepository;
        this.evaluacionRepository = evaluacionRepository;
        this.notaRepository = notaRepository;
    }

    @GetMapping("/mis-calificaciones")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> obtenerMisCalificaciones(
            HttpServletRequest request
    ) {

        // 1. OBTENER ESTUDIANTE DE LA SESIÓN
        HttpSession session = request.getSession(false);

        if (session == null) {
            return ResponseEntity.status(401).build();
        }

        Integer idEstudiante =
                (Integer) session.getAttribute("ESTUDIANTE_ID");

        if (idEstudiante == null) {
            return ResponseEntity.status(401).build();
        }

        // 2. VALIDAR ESTUDIANTE ACTIVO
        boolean estudianteActivo = estudianteRepository
                .findById(idEstudiante)
                .map(e -> Boolean.TRUE.equals(e.getEstado()))
                .orElse(false);

        if (!estudianteActivo) {
            return ResponseEntity.status(403).build();
        }

        // 3. OBTENER MATRÍCULAS ACTIVAS
        List<MatriculaEstudiante> matriculas =
                matriculaRepository
                        .findByIdEstudianteAndEstadoTrue(idEstudiante);

        List<CursoResponse> cursos = new ArrayList<>();

        // 4. RECORRER MATRÍCULAS DEL ESTUDIANTE
        for (MatriculaEstudiante matricula : matriculas) {

            GradoSeccion gradoSeccion = gradoSeccionRepository
                    .findById(matricula.getIdGradoSeccion())
                    .orElse(null);

            if (gradoSeccion == null ||
                    !Boolean.TRUE.equals(gradoSeccion.getEstado())) {
                continue;
            }

            // SOLO AÑO ESCOLAR 2026
            if (!Integer.valueOf(2026).equals(
                    gradoSeccion.getAnioEscolar())) {
                continue;
            }

            // 5. OBTENER CURSOS DEL SALÓN
            List<AsignacionDocente> asignaciones =
                    asignacionRepository
                            .findByIdGradoSeccionAndEstadoTrue(
                                    gradoSeccion.getIdGradoSeccion()
                            );

            for (AsignacionDocente asignacion : asignaciones) {

                Asignatura asignatura = asignaturaRepository
                        .findById(asignacion.getIdAsignatura())
                        .orElse(null);

                if (asignatura == null ||
                        !Boolean.TRUE.equals(asignatura.getEstado())) {
                    continue;
                }

                // 6. OBTENER EVALUACIONES ACTIVAS
                List<Evaluacion> evaluaciones =
                        evaluacionRepository
                                .findByIdAsignacionAndEstadoTrue(
                                        asignacion.getIdAsignacion()
                                );

                // 7. OBTENER NOTAS DE ESTA MATRÍCULA
                Map<Integer, BigDecimal> notasPorEvaluacion =
                        new HashMap<>();

                for (RegistroNota nota :
                        notaRepository.findByIdMatriculaAndEstadoTrue(
                                matricula.getIdMatricula())) {

                    notasPorEvaluacion.put(
                            nota.getIdEvaluacion(),
                            nota.getCalificacion()
                    );
                }

                // 8. ORGANIZAR EVALUACIONES POR BIMESTRE
                Map<Integer, List<EvaluacionResponse>> porPeriodo =
                        new TreeMap<>();

                for (Evaluacion evaluacion : evaluaciones) {

                    porPeriodo
                            .computeIfAbsent(
                                    evaluacion.getIdPeriodo(),
                                    id -> new ArrayList<>()
                            )
                            .add(new EvaluacionResponse(
                                    evaluacion.getNombre(),
                                    notasPorEvaluacion.get(
                                            evaluacion.getIdEvaluacion()
                                    )
                            ));
                }

                // 9. PREPARAR RESPUESTA PARA ANGULAR
                for (Map.Entry<Integer, List<EvaluacionResponse>>
                        entrada : porPeriodo.entrySet()) {

                    String periodo = switch (entrada.getKey()) {
                        case 1 -> "I Bimestre";
                        case 2 -> "II Bimestre";
                        case 3 -> "III Bimestre";
                        case 4 -> "IV Bimestre";
                        default -> "Periodo " + entrada.getKey();
                    };

                    cursos.add(new CursoResponse(
                            asignatura.getNombre(),
                            periodo,
                            entrada.getValue()
                    ));
                }
            }
        }

        return ResponseEntity.ok(
                new CalificacionesResponse(cursos)
        );
    }

    public record EvaluacionResponse(
            String nombre,
            BigDecimal calificacion
    ) {}

    public record CursoResponse(
            String nombre,
            String periodo,
            List<EvaluacionResponse> evaluaciones
    ) {}

    public record CalificacionesResponse(
            List<CursoResponse> cursos
    ) {}
}
