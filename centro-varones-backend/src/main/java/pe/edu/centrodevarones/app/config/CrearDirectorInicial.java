
package pe.edu.centrodevarones.app.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import pe.edu.centrodevarones.app.entity.CuentaDirector;
import pe.edu.centrodevarones.app.repository.CuentaDirectorRepository;

@Configuration
public class CrearDirectorInicial {

    @Bean
    CommandLineRunner crearDirector(
            CuentaDirectorRepository repository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {

            String correo = "director@centrovarones.edu.pe";

            if (repository.existsByCorreoIgnoreCase(correo)) {
                System.out.println("Director ya registrado.");
                return;
            }

            CuentaDirector director = new CuentaDirector();

            director.setNombres("José Antonio");
            director.setApellidos("García Mendoza");
            director.setCorreo(correo);
            director.setPasswordHash(
                passwordEncoder.encode("Director2026!")
            );
            director.setEstado(true);

            repository.save(director);

            System.out.println(
                "Director registrado correctamente."
            );
        };
    }
}
