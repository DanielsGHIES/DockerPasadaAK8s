# Fase 1: Aplicación Docker

## Punto de partida

Se debe partir de una aplicación web multicontenedor funcional con los siguientes requisitos:

- La aplicación debe tener un CRUD básico.
- Uno de sus contenedores debe ser una base de datos persistente.
- La aplicación debe funcionar en GitHub Codespaces.
- Debe arrancar con un único comando: `docker compose up` o mediante un único script de arranque `start.sh`.
- Se debe agregar al profesor como colaborador del repositorio en lectura (`@amestevez`).

## Estructura esperada

```text
app/
├── backend/
├── frontend/
├── docker-compose.yml
└── start.sh
```

## Verificaciones mínimas

- La aplicación arranca con un único comando.
- El frontend funciona en navegador.
- El backend responde correctamente.
- El CRUD básico funciona.
- Los datos persisten en la base de datos.

## Entrega parcial

- Enlace al repositorio con la aplicación Docker.
