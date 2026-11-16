
package pe.edu.centrodevarones.app.config;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.boot.web.servlet.FilterRegistrationBean;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.context.SecurityContextHolderFilter;

import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    // GUARDAR AUTENTICACIÓN EN LA SESIÓN HTTP
    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    // EVITAR QUE EL FILTRO SE EJECUTE DOS VECES
    @Bean
    public FilterRegistrationBean<EstadoDocenteFilter>
            desactivarRegistroAutomatico(
                    EstadoDocenteFilter filtro
            ) {

        FilterRegistrationBean<EstadoDocenteFilter> registro =
                new FilterRegistrationBean<>(filtro);

        registro.setEnabled(false);

        return registro;
    }

    // CONFIGURACIÓN PRINCIPAL DE SEGURIDAD
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource,
            SecurityContextRepository securityContextRepository,
            EstadoDocenteFilter estadoDocenteFilter
    ) throws Exception {

        http

            // PERMITIR COMUNICACIÓN CON ANGULAR
            .cors(cors -> cors
                .configurationSource(corsConfigurationSource)
            )

            // PROTECCIÓN CSRF
            .csrf(csrf -> csrf
                .csrfTokenRepository(
                    CookieCsrfTokenRepository.withHttpOnlyFalse()
                )

                .csrfTokenRequestHandler(
                    new CsrfTokenRequestAttributeHandler()
                )

                // LOS LOGIN NO REQUIEREN TOKEN CSRF
                .ignoringRequestMatchers(
                    "/api/auth/docente/login",
                    "/api/auth/director/login",
                    "/api/auth/estudiante/login"
                )
            )

            // UTILIZAR SESIONES HTTP
            .sessionManagement(session -> session
                .sessionCreationPolicy(
                    SessionCreationPolicy.IF_REQUIRED
                )
            )

            // CONSERVAR LA AUTENTICACIÓN
            .securityContext(context -> context
                .securityContextRepository(
                    securityContextRepository
                )
            )

            // CONFIGURACIÓN DE ACCESOS
            .authorizeHttpRequests(auth -> auth

                // PERMITIR MANEJO INTERNO DE ERRORES
                .dispatcherTypeMatchers(
                    DispatcherType.ERROR
                ).permitAll()

                // RUTAS PÚBLICAS
                .requestMatchers(
                    "/api/auth/csrf",
                    "/api/auth/docente/login",
                    "/api/auth/director/login",
                    "/api/auth/estudiante/login",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()

                // SOLO EL DIRECTOR PUEDE ADMINISTRAR DOCENTES
                .requestMatchers(
                    "/api/director/**",
                    "/api/docentes",
                    "/api/docentes/**"
                ).hasRole("DIRECTOR")

                // LAS DEMÁS API REQUIEREN AUTENTICACIÓN
                .requestMatchers("/api/**")
                    .authenticated()

                // BLOQUEAR RUTAS NO CONFIGURADAS
                .anyRequest()
                    .denyAll()
            )

            // DEVOLVER 401 SI NO HAY AUTENTICACIÓN
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(
                    (request, response, exception) ->
                        response.sendError(
                            HttpServletResponse.SC_UNAUTHORIZED
                        )
                )
            )

            // DESACTIVAR LOGIN POR FORMULARIO
            .formLogin(AbstractHttpConfigurer::disable)

            // DESACTIVAR HTTP BASIC
            .httpBasic(AbstractHttpConfigurer::disable);

        // VALIDAR EL ESTADO DEL DOCENTE EN CADA SOLICITUD
        http.addFilterAfter(
            estadoDocenteFilter,
            SecurityContextHolderFilter.class
        );

        return http.build();
    }

    // CIFRAR CONTRASEÑAS CON BCRYPT
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
