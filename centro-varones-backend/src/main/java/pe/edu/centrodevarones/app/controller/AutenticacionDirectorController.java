
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

import org.springframework.web.bind.annotation.*;

import pe.edu.centrodevarones.app.dto.LoginDirectorRequest;
import pe.edu.centrodevarones.app.dto.LoginDirectorResponse;
import pe.edu.centrodevarones.app.service.AutenticacionDirectorService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/director")
public class AutenticacionDirectorController {

    private final AutenticacionDirectorService service;
    private final SecurityContextRepository securityContextRepository;

    public AutenticacionDirectorController(
            AutenticacionDirectorService service,
            SecurityContextRepository securityContextRepository
    ) {
        this.service = service;
        this.securityContextRepository = securityContextRepository;
    }

    // INICIAR SESIÓN DEL DIRECTOR
    @PostMapping("/login")
    public ResponseEntity<LoginDirectorResponse> login(
            @Valid @RequestBody LoginDirectorRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {

        // VALIDAR CREDENCIALES EN SQL SERVER
        Optional<LoginDirectorResponse> resultado =
                service.iniciarSesion(request);

        if (resultado.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        LoginDirectorResponse director = resultado.get();

        // CREAR AUTENTICACIÓN CON ROL DIRECTOR
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                    director.correo(),
                    null,
                    List.of(
                        new SimpleGrantedAuthority("ROLE_DIRECTOR")
                    )
                );

        // CREAR CONTEXTO DE SEGURIDAD
        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);

        SecurityContextHolder.setContext(context);

        // CREAR O RECUPERAR SESIÓN HTTP
        HttpSession session = httpRequest.getSession(true);

        // CAMBIAR ID PARA PROTEGER LA SESIÓN
        httpRequest.changeSessionId();

        // ELIMINAR DATOS DE OTROS PERFILES
        session.removeAttribute("DOCENTE_ID");
        session.removeAttribute("ESTUDIANTE_ID");

        // GUARDAR ID DEL DIRECTOR
        session.setAttribute(
            "DIRECTOR_ID",
            director.id()
        );

        // GUARDAR AUTENTICACIÓN EN LA SESIÓN
        securityContextRepository.saveContext(
            context,
            httpRequest,
            httpResponse
        );

        // DEVOLVER DATOS DEL DIRECTOR
        return ResponseEntity.ok(director);
    }

    // CONSULTAR SESIÓN ACTIVA DEL DIRECTOR
    @GetMapping("/me")
    public ResponseEntity<?> obtenerSesion(
            Authentication authentication,
            HttpServletRequest request
    ) {

        // VERIFICAR AUTENTICACIÓN Y ROL
        if (authentication == null ||
            !authentication.isAuthenticated() ||
            authentication.getAuthorities().stream()
                .noneMatch(
                    autoridad -> autoridad.getAuthority()
                        .equals("ROLE_DIRECTOR")
                )) {

            return ResponseEntity.status(401).build();
        }

        // RECUPERAR SESIÓN HTTP
        HttpSession session = request.getSession(false);

        if (session == null ||
            session.getAttribute("DIRECTOR_ID") == null) {

            return ResponseEntity.status(401).build();
        }

        // DEVOLVER INFORMACIÓN DEL DIRECTOR
        return ResponseEntity.ok(
            new SesionDirectorResponse(
                (Integer) session.getAttribute("DIRECTOR_ID"),
                authentication.getName(),
                "director"
            )
        );
    }

    // RESPUESTA DE LA SESIÓN
    public record SesionDirectorResponse(
        Integer id,
        String correo,
        String rol
    ) {}
}
