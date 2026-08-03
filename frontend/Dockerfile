# ETAPA 1: Compilación del código React con Vite
FROM node:20-alpine AS build
WORKDIR /app
# Copiar paquetes e instalar dependencias
COPY package*.json ./
RUN npm clean-install
# Copiar el código fuente y construir la app
COPY . .
RUN npm run build
# ETAPA 2: Servidor web ligero en Producción
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copiar estáticos generados por Vite a la carpeta pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]