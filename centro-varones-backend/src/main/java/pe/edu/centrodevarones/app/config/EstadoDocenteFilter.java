
package pe.edu.centrodevarones.app.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;

import pe.edu.centrodevarones.app.entity.Docente;
import pe.edu.centrodevarones.app.entity.CuentaDocente;
import pe.edu.centrodevarones.app.repository.DocenteRepository;
import pe.edu.centrodevarones.app.repository.CuentaDocenteRepository;

import java.io.IOException;
import java.util.Optional;

@Component
public class EstadoDocenteFilter extends OncePerRequestFilter {

    private final DocenteRepository docenteRepository;
    private final CuentaDocenteRepository cuentaRepository;
    private final SecurityContextRepository securityContextRepository;

    public EstadoDocenteFilter(
            DocenteRepository docenteRepository,
            CuentaDocenteRepository cuentaRepository,
            SecurityContextRepository securityContextRepository
    ) {
        this.docenteRepository = docenteRepository;
        this.cuentaRepository = cuentaRepository;
        this.securityContextRepository = securityContextRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // CONSULTAR AUTENTICACIÓN ACTUAL
        Authentication authentication =
                securityContextRepository
                        .loadDeferredContext(request)
                        .get()
                        .getAuthentication();

        // SI NO ES DOCENTE, CONTINUAR NORMALMENTE
        if (authentication == null ||
                authentication.getAuthorities().stream()
                        .noneMatch(autoridad ->
                                autoridad.getAuthority()
                                        .equals("ROLE_DOCENTE"))) {

            filterChain.doFilter(request, response);
            return;
        }

        // OBTENER SESIÓN
        HttpSession session = request.getSession(false);

        if (session == null) {
            bloquearAcceso(request, response);
            return;
        }

        Integer idDocente =
                (Integer) session.getAttribute("DOCENTE_ID");

        if (idDocente == null) {
            bloquearAcceso(request, response);
            return;
        }

        // CONSULTAR DOCENTE
        Optional<Docente> docente =
                docenteRepository.findById(idDocente);

        // CONSULTAR CUENTA
        Optional<CuentaDocente> cuenta =
                cuentaRepository.findByIdDocente(idDocente);

        // VERIFICAR QUE AMBOS ESTÉN ACTIVOS
        boolean docenteActivo =
                docente.isPresent() &&
                Boolean.TRUE.equals(
                        docente.get().getEstado()
                );

        boolean cuentaActiva =
                cuenta.isPresent() &&
                Boolean.TRUE.equals(
                        cuenta.get().getEstado()
                );

        // BLOQUEAR SI ESTÁ DESACTIVADO
        if (!docenteActivo || !cuentaActiva) {
            bloquearAcceso(request, response);
            return;
        }

        // CONTINUAR CON LA SOLICITUD
        filterChain.doFilter(request, response);
    }

    // INVALIDAR SESIÓN Y BLOQUEAR ACCESO
    private void bloquearAcceso(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        response.sendError(
                HttpServletResponse.SC_UNAUTHORIZED,
                "La cuenta del docente está desactivada"
        );
    }
}
