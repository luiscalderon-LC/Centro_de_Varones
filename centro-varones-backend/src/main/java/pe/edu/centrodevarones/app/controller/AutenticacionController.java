
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

    // INICIAR SESIÓN DEL DOCENTE
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

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        docente.correo(),
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_DOCENTE"
                                )
                        )
                );

        // CREAR CONTEXTO DE SEGURIDAD
        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // CREAR O RENOVAR LA SESIÓN
        HttpSession session = httpRequest.getSession(true);

        if (!session.isNew()) {
            httpRequest.changeSessionId();
        }

        // GUARDAR IDENTIFICADOR DEL DOCENTE
        session.setAttribute(
                "DOCENTE_ID",
                docente.id()
        );

        // GUARDAR AUTENTICACIÓN
        securityContextRepository.saveContext(
                context,
                httpRequest,
                httpResponse
        );

        return ResponseEntity.ok(docente);
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

        Integer idDocente = (Integer) session.getAttribute(
                "DOCENTE_ID"
        );

        if (idDocente == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                new SesionDocenteResponse(
                        idDocente,
                        authentication.getName(),
                        "docente"
                )
        );
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

    public record SesionDocenteResponse(
            Integer id,
            String correo,
            String rol
    ) {}
}
