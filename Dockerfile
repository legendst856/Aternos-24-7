# Usamos una versión estable de Node
FROM node:18-slim

# Creamos la carpeta de trabajo
WORKDIR /app

# Copiamos todo lo que tienes en el repo
COPY . .

# Instalamos las dependencias automáticamente
RUN npm install

# Iniciamos tu aplicación
CMD ["node", "index.js"]
