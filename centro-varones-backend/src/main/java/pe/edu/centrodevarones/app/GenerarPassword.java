
package pe.edu.centrodevarones.app;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerarPassword {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        String password = System.getenv("PASSWORD_DOCENTE");

        if (password == null || password.isBlank()) {
            System.err.println(
                "Configura la variable PASSWORD_DOCENTE."
            );
            return;
        }

        String hash = encoder.encode(password);

        System.out.println("HASH BCrypt:");
        System.out.println(hash);
    }
}
