
package pe.edu.centrodevarones.app.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import pe.edu.centrodevarones.app.dto.LoginDocenteRequest;
import pe.edu.centrodevarones.app.dto.LoginDocenteResponse;
import pe.edu.centrodevarones.app.dto.LoginEstudianteRequest;
import pe.edu.centrodevarones.app.dto.LoginEstudianteResponse;

import pe.edu.centrodevarones.app.entity.Docente;
import pe.edu.centrodevarones.app.entity.CuentaDocente;
import pe.edu.centrodevarones.app.entity.Estudiante;
import pe.edu.centrodevarones.app.entity.CuentaEstudiante;

import pe.edu.centrodevarones.app.repository.DocenteRepository;
import pe.edu.centrodevarones.app.repository.CuentaDocenteRepository;
import pe.edu.centrodevarones.app.repository.EstudianteRepository;
import pe.edu.centrodevarones.app.repository.CuentaEstudianteRepository;

import java.util.Optional;

@Service
public class AutenticacionService {

    private final DocenteRepository docenteRepository;
    private final CuentaDocenteRepository cuentaRepository;
    private final EstudianteRepository estudianteRepository;
    private final CuentaEstudianteRepository cuentaEstudianteRepository;
    private final PasswordEncoder passwordEncoder;

    public AutenticacionService(
            DocenteRepository docenteRepository,
            CuentaDocenteRepository cuentaRepository,
            EstudianteRepository estudianteRepository,
            CuentaEstudianteRepository cuentaEstudianteRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.docenteRepository = docenteRepository;
        this.cuentaRepository = cuentaRepository;
        this.estudianteRepository = estudianteRepository;
        this.cuentaEstudianteRepository = cuentaEstudianteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ======================================
    // 1. INICIAR SESIÓN DEL DOCENTE
    // ======================================
    public Optional<LoginDocenteResponse> iniciarSesion(
            LoginDocenteRequest request
    ) {

        String correo = request.correo().trim();

        Optional<Docente> resultado =
                docenteRepository.findByCorreoIgnoreCase(correo);

        if (resultado.isEmpty()) {
            return Optional.empty();
        }

        Docente docente = resultado.get();

        if (!Boolean.TRUE.equals(docente.getEstado())) {
            return Optional.empty();
        }

        Optional<CuentaDocente> resultadoCuenta =
                cuentaRepository.findByIdDocenteAndEstadoTrue(
                        docente.getIdDocente()
                );

        if (resultadoCuenta.isEmpty()) {
            return Optional.empty();
        }

        CuentaDocente cuenta = resultadoCuenta.get();

        boolean passwordCorrecta = passwordEncoder.matches(
                request.password(),
                cuenta.getPasswordHash()
        );

        if (!passwordCorrecta) {
            return Optional.empty();
        }

        return Optional.of(
                new LoginDocenteResponse(
                        docente.getIdDocente(),
                        docente.getNombres() + " " + docente.getApellidos(),
                        docente.getCorreo(),
                        "docente"
                )
        );
    }

    // ======================================
    // 2. INICIAR SESIÓN DEL ESTUDIANTE
    // ======================================
    public Optional<LoginEstudianteResponse> iniciarSesionEstudiante(
            LoginEstudianteRequest request
    ) {

        String correo = request.correo().trim();

        Optional<CuentaEstudiante> resultadoCuenta =
                cuentaEstudianteRepository.findByCorreoIgnoreCase(
                        correo
                );

        if (resultadoCuenta.isEmpty()) {
            return Optional.empty();
        }

        CuentaEstudiante cuenta = resultadoCuenta.get();

        if (!Boolean.TRUE.equals(cuenta.getEstado())) {
            return Optional.empty();
        }

        Optional<Estudiante> resultadoEstudiante =
                estudianteRepository.findById(
                        cuenta.getIdEstudiante()
                );

        if (resultadoEstudiante.isEmpty()) {
            return Optional.empty();
        }

        Estudiante estudiante = resultadoEstudiante.get();

        if (!Boolean.TRUE.equals(estudiante.getEstado())) {
            return Optional.empty();
        }

        boolean passwordCorrecta = passwordEncoder.matches(
                request.password(),
                cuenta.getPasswordHash()
        );

        if (!passwordCorrecta) {
            return Optional.empty();
        }

        return Optional.of(
                new LoginEstudianteResponse(
                        estudiante.getIdEstudiante(),
                        estudiante.getNombres() + " " +
                                estudiante.getApellidos(),
                        cuenta.getCorreo(),
                        "estudiante",
                        cuenta.getCambiarPassword()
                )
        );
    }
}
