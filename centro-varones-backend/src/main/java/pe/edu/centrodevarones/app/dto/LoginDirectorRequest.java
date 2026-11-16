
package pe.edu.centrodevarones.app.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginDirectorRequest(
    @NotBlank String correo,
    @NotBlank String password
) {}
