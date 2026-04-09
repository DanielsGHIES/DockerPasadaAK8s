# Fase 2: Migración de Docker a K8s escalable

## Objetivo

En otro repositorio independiente se deben realizar los cambios necesarios para adaptar la aplicación anterior al entorno de Kubernetes.

## Requisitos

- Al igual que en Docker, la aplicación en K8s debe funcionar ejecutando un único script de arranque `start.sh`.
- Se deben realizar los cambios oportunos para que la aplicación sea escalable.
- Dado que la escalabilidad depende de la máquina, se debe configurar para que escale en los servidores de GitHub Codespaces.

## Comprobaciones iniciales

```bash
kubectl version --client
kubectl get nodes
kubectl get pods -A
```

## Capturas solicitadas para el proceso de migración

### Captura 2a

1 o 2 capturas donde se llega al punto 6 del tutorial:

- Clúster creado.
- Sin Deployment.
- La app funciona con Docker.
