
package pe.edu.centrodevarones.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CuentaEstudiante", schema = "usuarios")
public class CuentaEstudiante {

    // ==========================================
    // IDENTIFICADOR DE LA CUENTA
    // ==========================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuenta")
    private Integer idCuenta;

    // ==========================================
    // DATOS DE ACCESO DEL ESTUDIANTE
    // ==========================================

    @Column(name = "id_estudiante", nullable = false)
    private Integer idEstudiante;

    @Column(name = "correo", nullable = false)
    private String correo;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "cambiar_password", nullable = false)
    private Boolean cambiarPassword = false;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    // ==========================================
    // VALORES AUTOMÁTICOS
    // ==========================================

    @PrePersist
    public void antesDeGuardar() {

        if (cambiarPassword == null) {
            cambiarPassword = false;
        }

        if (estado == null) {
            estado = true;
        }

        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }

    // ==========================================
    // GETTERS Y SETTERS
    // ==========================================

    public Integer getIdCuenta() {
        return idCuenta;
    }

    public void setIdCuenta(Integer idCuenta) {
        this.idCuenta = idCuenta;
    }

    public Integer getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(Integer idEstudiante) {
        this.idEstudiante = idEstudiante;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Boolean getCambiarPassword() {
        return cambiarPassword;
    }

    public void setCambiarPassword(Boolean cambiarPassword) {
        this.cambiarPassword = cambiarPassword;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
