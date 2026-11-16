
package pe.edu.centrodevarones.app.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "RegistroNota", schema = "notas")
public class RegistroNota {

    // DATOS PRINCIPALES

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_nota")
    private Integer idNota;

    @Column(name = "id_evaluacion", nullable = false)
    private Integer idEvaluacion;

    @Column(name = "id_matricula", nullable = false)
    private Integer idMatricula;

    @Column(name = "calificacion", nullable = false,
            precision = 5, scale = 2)
    private BigDecimal calificacion;

    @Column(name = "observacion", length = 300)
    private String observacion;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;

    // CAMPOS DE AUDITORÍA

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "usuario_creacion", length = 50,
            updatable = false)
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

    public Integer getIdNota() {
        return idNota;
    }

    public void setIdNota(Integer idNota) {
        this.idNota = idNota;
    }

    public Integer getIdEvaluacion() {
        return idEvaluacion;
    }

    public void setIdEvaluacion(Integer idEvaluacion) {
        this.idEvaluacion = idEvaluacion;
    }

    public Integer getIdMatricula() {
        return idMatricula;
    }

    public void setIdMatricula(Integer idMatricula) {
        this.idMatricula = idMatricula;
    }

    public BigDecimal getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(BigDecimal calificacion) {
        this.calificacion = calificacion;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
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
