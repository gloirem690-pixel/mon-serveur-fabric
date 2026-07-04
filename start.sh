# Utiliser une image Java 21 officielle et maintenue
FROM eclipse-temurin:21-jre-slim

# Installer Node.js (pour le panel)
RUN apt-get update && apt-get install -y curl wget && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances Node.js
COPY package*.json ./
RUN npm install

# Copier le script avec les bonnes permissions
COPY --chmod=755 start.sh /app/start.sh

# Copier tout le reste du projet
COPY . .

# Exposer le port du panel
EXPOSE 8080

# Lancer le script de démarrage
CMD ["sh", "/app/start.sh"]
