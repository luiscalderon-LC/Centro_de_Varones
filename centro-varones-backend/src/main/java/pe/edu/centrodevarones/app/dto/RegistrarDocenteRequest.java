
package pe.edu.centrodevarones.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegistrarDocenteRequest(

    @NotNull(message = "Seleccione un tipo de documento")
    Integer idTipoDocumento,

    @NotBlank(message = "Ingrese el documento")
    String dni,

    @NotBlank(message = "Ingrese los nombres")
    String nombres,

    @NotBlank(message = "Ingrese los apellidos")
    String apellidos,

    @NotBlank(message = "Ingrese el correo")
    @Email(message = "Correo electrónico inválido")
    String correo,

    @NotBlank(message = "Seleccione una especialidad")
    String especialidad,

    @NotBlank(message = "Seleccione un estado")
    String estado,

    @NotBlank(message = "Ingrese una contraseña")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    String password

) {}
