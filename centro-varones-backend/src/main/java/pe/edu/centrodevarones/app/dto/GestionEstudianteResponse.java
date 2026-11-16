
package pe.edu.centrodevarones.app.dto;

public record GestionEstudianteResponse(
        Integer idEstudiante,
        Integer idMatricula,
        String tipoDocumento,
        String numeroDocumento,
        String nombres,
        String apellidos,
        String correo,
        String grado,
        String seccion,
        Integer anio,
        Boolean estado
) {
}
