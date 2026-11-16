
package pe.edu.centrodevarones.app.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import pe.edu.centrodevarones.app.dto.LoginDocenteRequest;
import pe.edu.centrodevarones.app.dto.LoginDocenteResponse;

import pe.edu.centrodevarones.app.entity.Docente;
import pe.edu.centrodevarones.app.entity.CuentaDocente;

import pe.edu.centrodevarones.app.repository.DocenteRepository;
import pe.edu.centrodevarones.app.repository.CuentaDocenteRepository;

import java.util.Optional;

@Service
public class AutenticacionService {

    private final DocenteRepository docenteRepository;
    private final CuentaDocenteRepository cuentaRepository;
    private final PasswordEncoder passwordEncoder;

    public AutenticacionService(
            DocenteRepository docenteRepository,
            CuentaDocenteRepository cuentaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.docenteRepository = docenteRepository;
        this.cuentaRepository = cuentaRepository;
        this.passwordEncoder = passwordEncoder;
    }

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
}
