
package pe.edu.centrodevarones.app.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import pe.edu.centrodevarones.app.dto.LoginDirectorRequest;
import pe.edu.centrodevarones.app.dto.LoginDirectorResponse;
import pe.edu.centrodevarones.app.repository.CuentaDirectorRepository;

import java.util.Optional;

@Service
public class AutenticacionDirectorService {

    private final CuentaDirectorRepository repository;
    private final PasswordEncoder passwordEncoder;

    public AutenticacionDirectorService(
            CuentaDirectorRepository repository,
            PasswordEncoder passwordEncoder
    ) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<LoginDirectorResponse> iniciarSesion(
            LoginDirectorRequest request
    ) {
        return repository
            .findByCorreoIgnoreCaseAndEstadoTrue(
                request.correo().trim()
            )
            .filter(director ->
                passwordEncoder.matches(
                    request.password(),
                    director.getPasswordHash()
                )
            )
            .map(director -> new LoginDirectorResponse(
                director.getIdDirector(),
                director.getNombres() + " " + director.getApellidos(),
                director.getCorreo(),
                "director"
            ));
    }
}
