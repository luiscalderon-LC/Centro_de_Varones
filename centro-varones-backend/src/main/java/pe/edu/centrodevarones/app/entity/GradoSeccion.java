
package pe.edu.centrodevarones.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "GradoSeccion",
    schema = "cursos",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "UQ_GradoSeccion",
            columnNames = {"grado", "seccion", "anio_escolar"}
        )
    }
)
public class GradoSeccion {

    // CAMPOS PRINCIPALES

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grado_seccion")
    private Integer idGradoSeccion;

    @Column(name = "grado", nullable = false)
    private Integer grado;

    @Column(name = "seccion", nullable = false, length = 5)
    private String seccion;

    @Column(name = "anio_escolar", nullable = false)
    private Integer anioEscolar;

    @Column(name = "capacidad", nullable = false)
    private Integer capacidad = 30;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;

    // 4 CAMPOS DE AUDITORÍA

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

        if (capacidad == null) {
            capacidad = 30;
        }

        fechaCreacion = LocalDateTime.now();

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

    public Integer getIdGradoSeccion() {
        return idGradoSeccion;
    }

    public void setIdGradoSeccion(Integer idGradoSeccion) {
        this.idGradoSeccion = idGradoSeccion;
    }

    public Integer getGrado() {
        return grado;
    }

    public void setGrado(Integer grado) {
        this.grado = grado;
    }

    public String getSeccion() {
        return seccion;
    }

    public void setSeccion(String seccion) {
        this.seccion = seccion;
    }

    public Integer getAnioEscolar() {
        return anioEscolar;
    }

    public void setAnioEscolar(Integer anioEscolar) {
        this.anioEscolar = anioEscolar;
    }

    public Integer getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
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
