# Fase 3: Escalado

## Objetivo

Configurar la aplicación en Kubernetes para que sea escalable y comprobar su funcionamiento en GitHub Codespaces.

## Requisitos

- Se deben realizar los cambios oportunos para permitir el escalado.
- La configuración debe adaptarse a los recursos disponibles en GitHub Codespaces.
- La aplicación debe seguir funcionando correctamente tras escalar.

## Verificaciones

```bash
kubectl get deployments
kubectl get pods
kubectl get hpa
```

## Captura 2c

1 o 2 capturas del funcionamiento final en K8s con el escalado configurado y verificado, similar al paso 14 del tutorial, donde:

- La aplicación funciona en Kubernetes.
- El escalado está configurado.
- Se verifica que existen varios pods o la política de escalado activa.

## Entrega parcial

- Archivo Zip con la aplicación K8s sin analizar.
