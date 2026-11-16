
package pe.edu.centrodevarones.app.config;

import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

@Configuration
public class CargaInicialConfig {

    @Bean
    public ApplicationRunner cargarDatosIniciales(
            DataSource dataSource,
            @Value("${app.carga-inicial.enabled:false}")
            boolean habilitado
    ) {
        return args -> {

            if (!habilitado) {
                return;
            }

            ClassPathResource recurso =
                    new ClassPathResource(
                            "db/02-datos-iniciales.sql"
                    );

            String sql;

            try (var entrada = recurso.getInputStream()) {
                sql = new String(
                        entrada.readAllBytes(),
                        StandardCharsets.UTF_8
                );
            }

            // SQL Server utiliza GO para separar lotes.
            String[] lotes = sql.split(
                    "(?im)^\\s*GO\\s*(?:--[^\\r\\n]*)?$"
            );

            try (Connection conexion =
                         dataSource.getConnection();
                 Statement statement =
                         conexion.createStatement()) {

                for (String lote : lotes) {

                    String consulta = lote.trim();

                    if (consulta.isEmpty()) {
                        continue;
                    }

                    statement.execute(consulta);
                }
            }

            System.out.println(
                    "Carga inicial SQL ejecutada correctamente."
            );
        };
    }
}
