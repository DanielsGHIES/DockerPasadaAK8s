# Fase 2: Deployments

## Objetivo

Crear los `Deployment` necesarios para frontend, backend y base de datos en Kubernetes.

## Puntos importantes

- Los `Deployment` deben equivaler al comportamiento definido previamente en Docker.
- En esta fase la aplicación aún puede no tener escalado configurado.
- La documentación debe demostrar que los `Deployment` están creados correctamente.

## Verificaciones

```bash
kubectl get deployments
kubectl get pods
kubectl describe deployment <nombre>
```

## Captura 2b

1 o 2 capturas de un punto intermedio, aproximadamente en los pasos 8-9 del tutorial, donde:

- Los `Deployment` están creados.
- El escalado aún no está configurado.
