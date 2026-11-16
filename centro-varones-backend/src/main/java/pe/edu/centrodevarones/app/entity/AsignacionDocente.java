
package pe.edu.centrodevarones.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "AsignacionDocente", schema = "asignacion")
public class AsignacionDocente {

    // DATOS PRINCIPALES

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignacion")
    private Integer idAsignacion;

    @Column(name = "id_docente", nullable = false)
    private Integer idDocente;

    @Column(name = "id_asignatura", nullable = false)
    private Integer idAsignatura;

    @Column(name = "id_grado_seccion", nullable = false)
    private Integer idGradoSeccion;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;

    // CAMPOS DE AUDITORÍA

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "usuario_creacion", length = 50, updatable = false)
    private String usuarioCreacion;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @Column(name = "usuario_modificacion", length = 50)
    private String usuarioModificacion;

    // AUDITORÍA AUTOMÁTICA

    @PrePersist
    public void antesDeGuardar() {

        if (estado == null) {
            estado = true;
        }

        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }

        if (usuarioCreacion == null) {
            usuarioCreacion = "SISTEMA";
        }
    }

    @PreUpdate
    public void antesDeActualizar() {

        fechaModificacion = LocalDateTime.now();

        if (usuarioModificacion == null) {
            usuarioModificacion = "SISTEMA";
        }
    }

    // GETTERS Y SETTERS

    public Integer getIdAsignacion() {
        return idAsignacion;
    }

    public void setIdAsignacion(Integer idAsignacion) {
        this.idAsignacion = idAsignacion;
    }

    public Integer getIdDocente() {
        return idDocente;
    }

    public void setIdDocente(Integer idDocente) {
        this.idDocente = idDocente;
    }

    public Integer getIdAsignatura() {
        return idAsignatura;
    }

    public void setIdAsignatura(Integer idAsignatura) {
        this.idAsignatura = idAsignatura;
    }

    public Integer getIdGradoSeccion() {
        return idGradoSeccion;
    }

    public void setIdGradoSeccion(Integer idGradoSeccion) {
        this.idGradoSeccion = idGradoSeccion;
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

    public String getUsuarioCreacion() {
        return usuarioCreacion;
    }

    public void setUsuarioCreacion(String usuarioCreacion) {
        this.usuarioCreacion = usuarioCreacion;
    }

    public LocalDateTime getFechaModificacion() {
        return fechaModificacion;
    }

    public void setFechaModificacion(LocalDateTime fechaModificacion) {
        this.fechaModificacion = fechaModificacion;
    }

    public String getUsuarioModificacion() {
        return usuarioModificacion;
    }

    public void setUsuarioModificacion(String usuarioModificacion) {
        this.usuarioModificacion = usuarioModificacion;
    }
}
