# ---- Stage 1: Build Angular app ----
FROM node:22-alpine AS angular-build

# Set working directory
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the Angular app and build it
COPY ./ .
RUN npm run build --omit=dev

# ---- Stage 2: Build Spring Boot app ----
FROM maven:3.9-amazoncorretto-21 AS spring-build

# Set working directory
WORKDIR /app/backend

# Copy the Spring Boot project
COPY ./ .

# Build the Spring Boot application
RUN mvn clean package -DskipTests

# ---- Stage 3: Final image ----
FROM amazoncorretto:21-alpine

# Set working directory
WORKDIR /app

# Copy the built Spring Boot JAR
COPY --from=spring-build /app/backend/target/*.jar app.jar

# Set up Nginx to serve Angular app
RUN apk add --no-cache nginx

# Create directory for Angular files
RUN mkdir -p /usr/share/nginx/html/browser

# Copy the built Angular app
COPY --from=angular-build /app/frontend/dist/ /usr/share/nginx/html/

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports for both applications
EXPOSE 4200 8090

# Create startup script
RUN echo '#!/bin/sh \n\
nginx & \n\
java -jar /app/app.jar' > /app/start.sh && \
chmod +x /app/start.sh

# Run both applications
CMD ["/app/start.sh"]
