# Fase 2: Services

## Objetivo

Exponer correctamente los componentes de la aplicación en Kubernetes mediante `Service`.

## Puntos importantes

- Debe poder accederse a la aplicación desplegada en K8s.
- Los `Service` deben mapear correctamente frontend, backend y, si procede, la base de datos.
- La conectividad entre pods y servicios debe quedar validada antes de pasar al escalado.

## Verificaciones

```bash
kubectl get services
kubectl describe service <nombre>
```
