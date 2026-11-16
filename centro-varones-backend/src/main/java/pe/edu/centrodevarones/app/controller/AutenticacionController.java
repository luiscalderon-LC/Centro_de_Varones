
package pe.edu.centrodevarones.app.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.dto.LoginDocenteRequest;
import pe.edu.centrodevarones.app.dto.LoginDocenteResponse;
import pe.edu.centrodevarones.app.dto.LoginEstudianteRequest;
import pe.edu.centrodevarones.app.dto.LoginEstudianteResponse;
import pe.edu.centrodevarones.app.service.AutenticacionService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AutenticacionController {

    private final AutenticacionService autenticacionService;
    private final SecurityContextRepository securityContextRepository;

    public AutenticacionController(
            AutenticacionService autenticacionService,
            SecurityContextRepository securityContextRepository
    ) {
        this.autenticacionService = autenticacionService;
        this.securityContextRepository = securityContextRepository;
    }

    // OBTENER TOKEN CSRF
    @GetMapping("/csrf")
    public CsrfToken obtenerCsrf(CsrfToken csrfToken) {
        return csrfToken;
    }

    // LOGIN DEL DOCENTE
    @PostMapping("/docente/login")
    public ResponseEntity<LoginDocenteResponse> loginDocente(
            @Valid @RequestBody LoginDocenteRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {

        Optional<LoginDocenteResponse> resultado =
                autenticacionService.iniciarSesion(request);

        if (resultado.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        LoginDocenteResponse docente = resultado.get();

        guardarSesion(
                docente.id(),
                docente.correo(),
                "DOCENTE",
                httpRequest,
                httpResponse
        );

        return ResponseEntity.ok(docente);
    }

    // LOGIN DEL ESTUDIANTE
    @PostMapping("/estudiante/login")
    public ResponseEntity<LoginEstudianteResponse> loginEstudiante(
            @Valid @RequestBody LoginEstudianteRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {

        Optional<LoginEstudianteResponse> resultado =
                autenticacionService.iniciarSesionEstudiante(request);

        if (resultado.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        LoginEstudianteResponse estudiante = resultado.get();

        guardarSesion(
                estudiante.id(),
                estudiante.correo(),
                "ESTUDIANTE",
                httpRequest,
                httpResponse
        );

        return ResponseEntity.ok(estudiante);
    }

    // CREAR SESIÓN AUTENTICADA
    private void guardarSesion(
            Integer id,
            String correo,
            String rol,
            HttpServletRequest request,
            HttpServletResponse response
    ) {

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        correo,
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + rol
                                )
                        )
                );

        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        HttpSession session = request.getSession(true);

        if (!session.isNew()) {
            request.changeSessionId();
        }

        session.removeAttribute("DOCENTE_ID");
        session.removeAttribute("ESTUDIANTE_ID");

        if ("DOCENTE".equals(rol)) {
            session.setAttribute("DOCENTE_ID", id);
        } else {
            session.setAttribute("ESTUDIANTE_ID", id);
        }

        securityContextRepository.saveContext(
                context,
                request,
                response
        );
    }

    // CONSULTAR SESIÓN ACTUAL
    @GetMapping("/me")
    public ResponseEntity<?> obtenerSesion(
            Authentication authentication,
            HttpServletRequest request
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        HttpSession session = request.getSession(false);

        if (session == null) {
            return ResponseEntity.status(401).build();
        }

        Integer idDocente =
                (Integer) session.getAttribute("DOCENTE_ID");

        if (idDocente != null &&
                authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority()
                                .equals("ROLE_DOCENTE"))) {

            return ResponseEntity.ok(
                    new SesionUsuarioResponse(
                            idDocente,
                            authentication.getName(),
                            "docente"
                    )
            );
        }

        Integer idEstudiante =
                (Integer) session.getAttribute("ESTUDIANTE_ID");

        if (idEstudiante != null &&
                authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority()
                                .equals("ROLE_ESTUDIANTE"))) {

            return ResponseEntity.ok(
                    new SesionUsuarioResponse(
                            idEstudiante,
                            authentication.getName(),
                            "estudiante"
                    )
            );
        }

        return ResponseEntity.status(401).build();
    }

    // CERRAR SESIÓN
    @PostMapping("/logout")
    public ResponseEntity<Void> cerrarSesion(
            HttpServletRequest request
    ) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.noContent().build();
    }

    public record SesionUsuarioResponse(
            Integer id,
            String correo,
            String rol
    ) {}
}
