# Utiliser une image avec Java 21
FROM openjdk:21-slim

# Installer Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances Node.js
COPY package*.json ./
RUN npm install

# Copier tout le reste du projet
COPY . .

# Donner les droits d'exécution au script de démarrage
RUN chmod +x start.sh

# Exposer le port du panel
EXPOSE 8080

# Lancer le script de démarrage
CMD ["sh", "start.sh"]
