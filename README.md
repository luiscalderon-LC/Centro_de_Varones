# Centro de Varones

## Backend con Docker

Configura `DB_PASSWORD` en el archivo `.env` de la raíz. No subas ese archivo al
repositorio.

Desde la raíz, inicia primero SQL Server y luego construye e inicia el backend.
Usa el mismo nombre de proyecto para que ambos servicios compartan la red:

```powershell
docker compose --env-file .env -p centro-varones -f docker-compose\docker.composeBD.yml up -d
docker compose --env-file .env -p centro-varones -f docker-compose\docker.composeBE.yml build
docker compose --env-file .env -p centro-varones -f docker-compose\docker.composeBE.yml up -d
```

La imagen del backend queda etiquetada como `markalcala/centro-varones-backend:2025`.
Para publicarla en Docker Hub:

```powershell
docker login
docker compose --env-file .env -p centro-varones -f docker-compose\docker.composeBE.yml push
```

El Compose de SQL Server usa `markalcala/centro-varones-sqlserver:2025`. Los comandos
para etiquetar y publicar la imagen oficial están comentados en `docker.composeBD.yml`.
La imagen del motor no incluye la base `CentroVaronesDB` ni el esquema; deben inicializarse
antes de iniciar el backend.
