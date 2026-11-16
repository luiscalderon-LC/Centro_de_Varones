
package pe.edu.centrodevarones.app.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.entity.Estudiante;
import pe.edu.centrodevarones.app.entity.MatriculaEstudiante;
import pe.edu.centrodevarones.app.entity.GradoSeccion;

import pe.edu.centrodevarones.app.repository.EstudianteRepository;
import pe.edu.centrodevarones.app.repository.MatriculaEstudianteRepository;
import pe.edu.centrodevarones.app.repository.GradoSeccionRepository;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/estudiante/mi-panel")
public class PanelEstudianteController {

    private final EstudianteRepository estudianteRepository;
    private final MatriculaEstudianteRepository matriculaRepository;
    private final GradoSeccionRepository gradoSeccionRepository;

    public PanelEstudianteController(
            EstudianteRepository estudianteRepository,
            MatriculaEstudianteRepository matriculaRepository,
            GradoSeccionRepository gradoSeccionRepository
    ) {
        this.estudianteRepository = estudianteRepository;
        this.matriculaRepository = matriculaRepository;
        this.gradoSeccionRepository = gradoSeccionRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> obtenerMiPanel(
            HttpServletRequest request
    ) {

        // OBTENER SESIÓN DEL ESTUDIANTE
        HttpSession session = request.getSession(false);

        if (session == null) {
            return ResponseEntity.status(401).build();
        }

        Integer idEstudiante =
                (Integer) session.getAttribute("ESTUDIANTE_ID");

        if (idEstudiante == null) {
            return ResponseEntity.status(401).build();
        }

        // BUSCAR ESTUDIANTE ACTIVO
        Estudiante estudiante = estudianteRepository
                .findById(idEstudiante)
                .filter(e -> Boolean.TRUE.equals(e.getEstado()))
                .orElse(null);

        if (estudiante == null) {
            return ResponseEntity.notFound().build();
        }

        // BUSCAR MATRÍCULAS ACTIVAS
        List<MatriculaEstudiante> matriculas =
                matriculaRepository
                        .findByIdEstudianteAndEstadoTrue(idEstudiante);

        // BUSCAR MATRÍCULA DEL AÑO MÁS RECIENTE
        GradoSeccion gradoSeccion = matriculas.stream()
                .map(m -> gradoSeccionRepository
                        .findById(m.getIdGradoSeccion())
                        .orElse(null))
                .filter(gs ->
                        gs != null &&
                        Boolean.TRUE.equals(gs.getEstado()))
                .max(Comparator.comparing(
                        GradoSeccion::getAnioEscolar))
                .orElse(null);

        String grado = "Sin matrícula";
        Integer anio = null;

        if (gradoSeccion != null) {
            grado = gradoSeccion.getGrado()
                    + ".° "
                    + gradoSeccion.getSeccion();

            anio = gradoSeccion.getAnioEscolar();
        }

        DatosEstudianteResponse respuesta =
                new DatosEstudianteResponse(
                        estudiante.getIdEstudiante(),
                        estudiante.getNombres()
                                + " "
                                + estudiante.getApellidos(),
                        estudiante.getNumeroDocumento(),
                        grado,
                        anio
                );

        return ResponseEntity.ok(respuesta);
    }

    public record DatosEstudianteResponse(
            Integer id,
            String nombre,
            String documento,
            String grado,
            Integer anio
    ) {}
}
