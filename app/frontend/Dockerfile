# Vulnerabilidad existente: KICS marcaba que el runtime del frontend corria como root.
# Se usa una imagen no privilegiada para ejecutar Nginx con un usuario no root.
FROM nginxinc/nginx-unprivileged:stable-alpine

COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

 # Vulnerabilidad existente: fijamos explicitamente el usuario del runtime para evitar root por defecto.
USER 101

EXPOSE 8080
