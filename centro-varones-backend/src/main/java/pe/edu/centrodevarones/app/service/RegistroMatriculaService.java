
package pe.edu.centrodevarones.app.service;

import java.time.LocalDate;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.centrodevarones.app.dto.RegistrarMatriculaRequest;
import pe.edu.centrodevarones.app.entity.CuentaEstudiante;
import pe.edu.centrodevarones.app.entity.Estudiante;
import pe.edu.centrodevarones.app.entity.GradoSeccion;
import pe.edu.centrodevarones.app.entity.MatriculaEstudiante;

import pe.edu.centrodevarones.app.repository.CuentaEstudianteRepository;
import pe.edu.centrodevarones.app.repository.EstudianteRepository;
import pe.edu.centrodevarones.app.repository.GradoSeccionRepository;
import pe.edu.centrodevarones.app.repository.MatriculaEstudianteRepository;

@Service
public class RegistroMatriculaService {

    private final EstudianteRepository estudianteRepository;
    private final MatriculaEstudianteRepository matriculaRepository;
    private final GradoSeccionRepository gradoSeccionRepository;
    private final CuentaEstudianteRepository cuentaRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistroMatriculaService(
            EstudianteRepository estudianteRepository,
            MatriculaEstudianteRepository matriculaRepository,
            GradoSeccionRepository gradoSeccionRepository,
            CuentaEstudianteRepository cuentaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.estudianteRepository = estudianteRepository;
        this.matriculaRepository = matriculaRepository;
        this.gradoSeccionRepository = gradoSeccionRepository;
        this.cuentaRepository = cuentaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ==========================================
    // REGISTRAR ESTUDIANTE, MATRÍCULA Y CUENTA
    // ==========================================

    @Transactional
    public Integer registrar(RegistrarMatriculaRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe proporcionar los datos de matrícula"
            );
        }

        // 1. VALIDAR TIPO DE DOCUMENTO
        String tipoDocumento = obligatorio(
                request.getTipoDocumento(),
                "Seleccione un tipo de documento"
        ).toUpperCase(Locale.ROOT);

        Integer idTipoDocumento;

        if (tipoDocumento.equals("DNI")) {
            idTipoDocumento = 1;
        } else if (tipoDocumento.equals("CE")) {
            idTipoDocumento = 2;
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de documento no válido"
            );
        }

        // 2. VALIDAR NÚMERO DE DOCUMENTO
        String documento = obligatorio(
                request.getNumeroDocumento(),
                "El número de documento es obligatorio"
        );

        if (idTipoDocumento == 1 &&
                !documento.matches("\\d{8}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El DNI debe tener exactamente 8 dígitos"
            );
        }

        if (idTipoDocumento == 2 &&
                !documento.matches("\\d{9}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El CE debe tener exactamente 9 dígitos"
            );
        }

        // 3. VALIDAR NOMBRES Y APELLIDOS
        String nombres = obligatorio(
                request.getNombres(),
                "Los nombres son obligatorios"
        );

        String apellidos = obligatorio(
                request.getApellidos(),
                "Los apellidos son obligatorios"
        );

        if (nombres.length() > 60 ||
                apellidos.length() > 60) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nombres y apellidos no pueden superar 60 caracteres"
            );
        }

        if (!nombres.matches("[\\p{L} ]+") ||
                !apellidos.matches("[\\p{L} ]+")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nombres y apellidos solo deben contener letras"
            );
        }

        // 4. VALIDAR CORREO INSTITUCIONAL
        String correo = obligatorio(
                request.getCorreo(),
                "El correo institucional es obligatorio"
        ).toLowerCase(Locale.ROOT);

        if (correo.length() > 100 ||
                !correo.matches(
                    "^[a-z0-9._%+-]+@centrovarones\\.edu\\.pe$"
                )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ingrese un correo @centrovarones.edu.pe válido"
            );
        }

        // 5. VALIDAR GRADO
        Integer grado = request.getGrado();

        if (grado == null || grado < 1 || grado > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Seleccione un grado válido"
            );
        }

        // 6. VALIDAR SECCIÓN
        String seccion = obligatorio(
                request.getSeccion(),
                "Seleccione una sección"
        ).toUpperCase(Locale.ROOT);

        if (!seccion.matches("[ABC]")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La sección debe ser A, B o C"
            );
        }

        // 7. VALIDAR AÑO ESCOLAR
        Integer anioEscolar = request.getAnioEscolar();

        if (anioEscolar == null ||
                anioEscolar < 2026 ||
                anioEscolar > 2100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Seleccione un año escolar válido"
            );
        }

        // 8. VALIDAR CONTRASEÑA
        String contrasena = request.getContrasena();

        if (contrasena == null ||
                contrasena.length() < 8 ||
                contrasena.length() > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La contraseña debe tener entre 8 y 72 caracteres"
            );
        }

        // 9. VALIDAR DOCUMENTO DUPLICADO
        if (estudianteRepository
                .existsByNumeroDocumento(documento)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El documento ya pertenece a un estudiante registrado"
            );
        }

        // 10. VALIDAR CORREO DUPLICADO
        if (cuentaRepository
                .existsByCorreoIgnoreCase(correo)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El correo institucional ya está registrado"
            );
        }

        // 11. BUSCAR GRADO Y SECCIÓN ACTIVOS
        GradoSeccion gradoSeccion = gradoSeccionRepository
                .findByGradoAndSeccionIgnoreCaseAndAnioEscolarAndEstadoTrue(
                        grado,
                        seccion,
                        anioEscolar
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El grado y sección no están disponibles para ese año"
                ));

        // 12. VALIDAR CAPACIDAD
        long matriculados = matriculaRepository
                .countByIdGradoSeccionAndEstadoTrue(
                        gradoSeccion.getIdGradoSeccion()
                );

        if (gradoSeccion.getCapacidad() == null ||
                matriculados >= gradoSeccion.getCapacidad()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El salón ya alcanzó su capacidad máxima"
            );
        }

        // 13. CREAR ESTUDIANTE
        Estudiante estudiante = new Estudiante();

        estudiante.setIdTipoDocumento(idTipoDocumento);
        estudiante.setNumeroDocumento(documento);
        estudiante.setNombres(nombres);
        estudiante.setApellidos(apellidos);
        estudiante.setNacionalidad("Peruana");
        estudiante.setEstado(true);

        Estudiante guardado =
                estudianteRepository.saveAndFlush(estudiante);

        // 14. REGISTRAR MATRÍCULA
        MatriculaEstudiante matricula =
                new MatriculaEstudiante();

        matricula.setIdEstudiante(
                guardado.getIdEstudiante()
        );

        matricula.setIdGradoSeccion(
                gradoSeccion.getIdGradoSeccion()
        );

        matricula.setFechaMatricula(LocalDate.now());
        matricula.setEstado(true);

        matriculaRepository.saveAndFlush(matricula);

        // 15. CREAR CUENTA DEL ESTUDIANTE
        CuentaEstudiante cuenta = new CuentaEstudiante();

        cuenta.setIdEstudiante(
                guardado.getIdEstudiante()
        );

        cuenta.setCorreo(correo);

        cuenta.setPasswordHash(
                passwordEncoder.encode(contrasena)
        );

        cuenta.setCambiarPassword(false);
        cuenta.setEstado(true);

        cuentaRepository.saveAndFlush(cuenta);

        // 16. DEVOLVER ID DEL ESTUDIANTE
        return guardado.getIdEstudiante();
    }

    // ==========================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // ==========================================

    private String obligatorio(
            String valor,
            String mensaje
    ) {
        if (valor == null || valor.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    mensaje
            );
        }

        return valor.trim();
    }
}
