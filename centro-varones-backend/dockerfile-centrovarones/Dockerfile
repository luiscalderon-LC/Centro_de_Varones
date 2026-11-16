
# Stage 1: Build con Maven
FROM maven:3.9-eclipse-temurin-25 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run con Java
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]


# CONSTRUCCION

# 1. Construir la imagen con los nuevos cambios
# docker build -t centro-varones-backend:latest -f dockerfile-centrovarones/Dockerfile .

# 2. Etiquetar la imagen para Docker Hub
# docker tag centro-varones-backend:latest USUARIO_DOCKERHUB/centro-varones-backend:latest

# 3. Iniciar sesion en Docker Hub
# docker login

# 4. Subir la imagen a Docker Hub
# docker push USUARIO_DOCKERHUB/centro-varones-backend:latest


# DESPLIEGUE

# 1. Descargar la imagen actualizada desde Docker Hub
# docker pull USUARIO_DOCKERHUB/centro-varones-backend:latest

# 2. Levantar el Backend con Docker Compose
# docker compose --env-file .env -f docker-compose-centrovarones/docker-composeBE.yml up -d

# 3. Verificar los contenedores
# docker ps

# 4. Revisar los logs del Backend
# docker logs backend_centro_varones

# 5. Detener el Backend
# docker compose --env-file .env -f docker-compose-centrovarones/docker-composeBE.yml down
