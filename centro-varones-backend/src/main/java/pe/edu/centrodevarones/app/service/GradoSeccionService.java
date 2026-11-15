
package pe.edu.centrodevarones.app.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.centrodevarones.app.entity.GradoSeccion;
import pe.edu.centrodevarones.app.repository.GradoSeccionRepository;

import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

@Service
public class GradoSeccionService {

    private final GradoSeccionRepository repository;

    public GradoSeccionService(GradoSeccionRepository repository) {
        this.repository = repository;
    }

    // 1. LISTAR GRADOS Y SECCIONES ACTIVOS
    public List<GradoSeccion> listar() {
        return repository.findByEstadoTrue();
    }

    // 2. LISTAR GRADOS Y SECCIONES ELIMINADOS
    public List<GradoSeccion> listarEliminados() {
        return repository.findByEstadoFalse();
    }

    // 3. BUSCAR POR ID
    public GradoSeccion buscar(Integer id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "No se encontró el grado y sección con ID: " + id
                        )
                );
    }

    // 4. REGISTRAR GRADO Y SECCIÓN
    @Transactional
    public GradoSeccion guardar(GradoSeccion gradoSeccion) {

        validarDatos(gradoSeccion);

        boolean existe =
                repository.existsByGradoAndSeccionIgnoreCaseAndAnioEscolar(
                        gradoSeccion.getGrado(),
                        gradoSeccion.getSeccion(),
                        gradoSeccion.getAnioEscolar()
                );

        if (existe) {
            throw new IllegalArgumentException(
                    "El grado y sección ya se encuentran registrados para ese año escolar."
            );
        }

        gradoSeccion.setIdGradoSeccion(null);
        gradoSeccion.setEstado(true);

        // AUDITORÍA DE CREACIÓN
        gradoSeccion.setFechaCreacion(null);
        gradoSeccion.setUsuarioCreacion("SISTEMA");
        gradoSeccion.setFechaModificacion(null);
        gradoSeccion.setUsuarioModificacion(null);

        return repository.save(gradoSeccion);
    }

    // 5. ACTUALIZAR GRADO Y SECCIÓN
    @Transactional
    public GradoSeccion actualizar(
            Integer id,
            GradoSeccion datos
    ) {

        GradoSeccion actual = buscar(id);

        validarDatos(datos);

        // VALIDAR QUE NO EXISTA OTRO REGISTRO IGUAL
        repository
                .findByGradoAndSeccionIgnoreCaseAndAnioEscolar(
                        datos.getGrado(),
                        datos.getSeccion(),
                        datos.getAnioEscolar()
                )
                .ifPresent(encontrado -> {

                    if (!encontrado.getIdGradoSeccion().equals(id)) {
                        throw new IllegalArgumentException(
                                "Ya existe otro registro con el mismo grado, sección y año escolar."
                        );
                    }
                });

        // ACTUALIZAR DATOS
        actual.setGrado(datos.getGrado());
        actual.setSeccion(datos.getSeccion());
        actual.setAnioEscolar(datos.getAnioEscolar());
        actual.setCapacidad(datos.getCapacidad());

        // AUDITORÍA DE MODIFICACIÓN
        actual.setUsuarioModificacion("SISTEMA");

        return repository.save(actual);
    }

    // 6. ELIMINAR LÓGICAMENTE
    @Transactional
    public GradoSeccion eliminar(Integer id) {

        GradoSeccion gradoSeccion = buscar(id);

        if (Boolean.FALSE.equals(gradoSeccion.getEstado())) {
            throw new IllegalArgumentException(
                    "El grado y sección ya se encuentran eliminados."
            );
        }

        gradoSeccion.setEstado(false);
        gradoSeccion.setUsuarioModificacion("SISTEMA");

        return repository.save(gradoSeccion);
    }

    // 7. RESTAURAR GRADO Y SECCIÓN
    @Transactional
    public GradoSeccion restaurar(Integer id) {

        GradoSeccion gradoSeccion = buscar(id);

        if (Boolean.TRUE.equals(gradoSeccion.getEstado())) {
            throw new IllegalArgumentException(
                    "El grado y sección ya se encuentran activos."
            );
        }

        gradoSeccion.setEstado(true);
        gradoSeccion.setUsuarioModificacion("SISTEMA");

        return repository.save(gradoSeccion);
    }

    // 8. CONSULTAR POR GRADO, SECCIÓN O AÑO ESCOLAR
    public List<GradoSeccion> consultar(
            Integer grado,
            String seccion,
            Integer anioEscolar
    ) {

        return repository.findByEstadoTrue()
                .stream()
                .filter(item ->
                        grado == null ||
                        item.getGrado().equals(grado)
                )
                .filter(item ->
                        seccion == null ||
                        seccion.isBlank() ||
                        item.getSeccion().equalsIgnoreCase(seccion.trim())
                )
                .filter(item ->
                        anioEscolar == null ||
                        item.getAnioEscolar().equals(anioEscolar)
                )
                .toList();
    }

    // 9. VALIDACIONES DEL MÓDULO
    private void validarDatos(GradoSeccion datos) {

        // VALIDAR QUE EXISTAN DATOS
        if (datos == null) {
            throw new IllegalArgumentException(
                    "Debe proporcionar los datos del grado y sección."
            );
        }

        // VALIDAR GRADO DE PRIMARIA
        if (datos.getGrado() == null ||
                datos.getGrado() < 1 ||
                datos.getGrado() > 6) {

            throw new IllegalArgumentException(
                    "El grado debe estar comprendido entre 1 y 6."
            );
        }

        // VALIDAR SECCIÓN
        if (datos.getSeccion() == null ||
                datos.getSeccion().isBlank()) {

            throw new IllegalArgumentException(
                    "La sección es obligatoria."
            );
        }

        String seccion = datos.getSeccion()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!seccion.matches("[A-Z]")) {
            throw new IllegalArgumentException(
                    "La sección debe ser una sola letra de la A a la Z."
            );
        }

        datos.setSeccion(seccion);

        // VALIDAR AÑO ESCOLAR
        if (datos.getAnioEscolar() == null ||
                datos.getAnioEscolar() < 2020 ||
                datos.getAnioEscolar() > 2100) {

            throw new IllegalArgumentException(
                    "El año escolar debe estar entre 2020 y 2100."
            );
        }

        // VALIDAR CAPACIDAD
        if (datos.getCapacidad() == null) {
            datos.setCapacidad(30);
        }

        if (datos.getCapacidad() < 1 ||
                datos.getCapacidad() > 50) {

            throw new IllegalArgumentException(
                    "La capacidad debe estar entre 1 y 50 estudiantes."
            );
        }
    }
}
