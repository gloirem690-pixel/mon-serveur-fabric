# Utiliser une image Java 21 maintenue par Eclipse Temurin
FROM eclipse-temurin:21-jre-slim

# Installer Node.js
RUN apt-get update && apt-get install -y curl wget && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY --chmod=755 start.sh /app/start.sh
COPY . .

EXPOSE 8080

CMD ["sh", "/app/start.sh"]
