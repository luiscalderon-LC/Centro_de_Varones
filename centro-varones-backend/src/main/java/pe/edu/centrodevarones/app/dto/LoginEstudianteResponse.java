
package pe.edu.centrodevarones.app.dto;

public record LoginEstudianteResponse(
        Integer id,
        String nombre,
        String correo,
        String rol,
        Boolean cambiarPassword
) {}
