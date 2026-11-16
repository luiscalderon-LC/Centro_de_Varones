
package pe.edu.centrodevarones.app.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.centrodevarones.app.dto.RegistrarDocenteRequest;
import pe.edu.centrodevarones.app.entity.Docente;
import pe.edu.centrodevarones.app.entity.CuentaDocente;
import pe.edu.centrodevarones.app.repository.DocenteRepository;
import pe.edu.centrodevarones.app.repository.CuentaDocenteRepository;

@Service
public class RegistroDocenteService {

    private final DocenteRepository docenteRepository;
    private final CuentaDocenteRepository cuentaRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistroDocenteService(
            DocenteRepository docenteRepository,
            CuentaDocenteRepository cuentaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.docenteRepository = docenteRepository;
        this.cuentaRepository = cuentaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // REGISTRAR DOCENTE Y CREAR SU CUENTA
    @Transactional
    public Integer registrar(RegistrarDocenteRequest request) {

        // 1. VALIDAR TIPO DE DOCUMENTO
        Integer tipoDocumento = request.idTipoDocumento();

        if (tipoDocumento == null ||
                (tipoDocumento != 1 && tipoDocumento != 2)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Seleccione un tipo de documento válido"
            );
        }

        // 2. VALIDAR NÚMERO DE DOCUMENTO
        String documento = obligatorio(
                request.dni(),
                "El número de documento es obligatorio"
        );

        if (tipoDocumento == 1 &&
                !documento.matches("\\d{8}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El DNI debe contener exactamente 8 dígitos"
            );
        }

        if (tipoDocumento == 2 &&
                !documento.matches("\\d{9}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El carné de extranjería debe contener exactamente 9 dígitos"
            );
        }

        // 3. VALIDAR NOMBRES
        String nombres = obligatorio(
                request.nombres(),
                "Los nombres son obligatorios"
        );

        if (nombres.length() > 60) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los nombres no pueden superar los 60 caracteres"
            );
        }

        // 4. VALIDAR APELLIDOS
        String apellidos = obligatorio(
                request.apellidos(),
                "Los apellidos son obligatorios"
        );

        if (apellidos.length() > 60) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los apellidos no pueden superar los 60 caracteres"
            );
        }

        // 5. VALIDAR CORREO INSTITUCIONAL
        String correo = obligatorio(
                request.correo(),
                "El correo institucional es obligatorio"
        ).toLowerCase(Locale.ROOT);

        if (correo.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El correo no puede superar los 100 caracteres"
            );
        }

        // SOLO CORREOS DEL CENTRO DE VARONES
        if (!correo.matches(
                "^[a-z0-9._%+-]+@centrovarones\\.edu\\.pe$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se permiten correos @centrovarones.edu.pe"
            );
        }

        // 6. VALIDAR ESPECIALIDAD
        String especialidad = obligatorio(
                request.especialidad(),
                "La especialidad es obligatoria"
        );

        if (especialidad.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La especialidad no puede superar los 100 caracteres"
            );
        }

        // 7. VALIDAR ESTADO
        String estado = obligatorio(
                request.estado(),
                "El estado es obligatorio"
        ).toLowerCase(Locale.ROOT);

        if (!estado.equals("activo") &&
                !estado.equals("inactivo")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estado debe ser activo o inactivo"
            );
        }

        boolean activo = estado.equals("activo");

        // 8. VALIDAR CONTRASEÑA
        String password = request.password();

        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La contraseña es obligatoria"
            );
        }

        if (password.length() < 8) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La contraseña debe tener al menos 8 caracteres"
            );
        }

        // 9. VALIDAR DOCUMENTO DUPLICADO
        if (docenteRepository.existsByNumeroDocumento(documento)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El número de documento ya está registrado"
            );
        }

        // 10. VALIDAR CORREO DUPLICADO
        if (docenteRepository.existsByCorreoIgnoreCase(correo)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El correo institucional ya está registrado"
            );
        }

        // 11. CREAR DOCENTE
        Docente docente = new Docente();

        docente.setIdTipoDocumento(tipoDocumento);
        docente.setNumeroDocumento(documento);
        docente.setNombres(nombres);
        docente.setApellidos(apellidos);
        docente.setCorreo(correo);
        docente.setEspecialidad(especialidad);
        docente.setEstado(activo);

        Docente guardado = docenteRepository.saveAndFlush(docente);

        // 12. CREAR CUENTA DEL DOCENTE
        CuentaDocente cuenta = new CuentaDocente();

        cuenta.setIdDocente(guardado.getIdDocente());
        cuenta.setPasswordHash(
                passwordEncoder.encode(password)
        );
        cuenta.setEstado(activo);

        cuentaRepository.save(cuenta);

        // 13. DEVOLVER ID DEL DOCENTE
        return guardado.getIdDocente();
    }

    // VALIDACIÓN DE CAMPOS OBLIGATORIOS
    private String obligatorio(String valor, String mensaje) {

        if (valor == null || valor.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    mensaje
            );
        }

        return valor.trim();
    }
}
