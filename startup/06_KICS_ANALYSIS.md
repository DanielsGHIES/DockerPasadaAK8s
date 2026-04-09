# Fase 4: Análisis de vulnerabilidades con KICS

## Objetivo

Una vez que la aplicación en K8s está funcionando, se debe analizar con el software KICS.

## Requisitos

- Si no hay vulnerabilidades: insertar una o varias de las vulnerabilidades expuestas en los ejemplos.
- Si hay vulnerabilidades: solucionar algunas de las más graves, verificando que la aplicación siga funcionando.
- Dentro de los archivos, indicar con comentarios cuál es la vulnerabilidad y si era existente o introducida.
- Se debe agregar al profesor (`@amestevez`) como colaborador en lectura de este segundo repositorio con las correcciones ya hechas.

## Ejecución

```bash
kics scan -p .
```

## Documentación obligatoria

- Identificar si la vulnerabilidad era existente o introducida.
- Dejar comentarios en los archivos afectados.
- Verificar que la aplicación sigue funcionando tras las correcciones.

## Entregas parciales

- Documento HTML correspondiente al primer análisis de vulnerabilidades.
- Enlace al repositorio con la aplicación Kubernetes.
