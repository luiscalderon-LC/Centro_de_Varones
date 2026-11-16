
package pe.edu.centrodevarones.app.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginDocenteRequest(

    @NotBlank(message = "El correo es obligatorio")
    String correo,

    @NotBlank(message = "La contraseña es obligatoria")
    String password

) {}
