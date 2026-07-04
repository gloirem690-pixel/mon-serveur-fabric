FROM itzg/minecraft-server

ENV TYPE=FABRIC
ENV VERSION=1.21.1
ENV FABRIC_LOADER_VERSION=0.19.3

# Copier les mods dans le bon dossier
COPY ./server-files/mods /data/mods
COPY ./public /data/public
COPY ./server.js /data/server.js
COPY ./package.json /data/package.json

# Installer Node.js pour le panel
USER root
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*
USER minecraft

# Exposer les ports
EXPOSE 25565 8080

# Lancer le serveur Minecraft et le panel
CMD java -Xmx2048M -Xms1024M -jar /data/fabric-server-launch.jar nogui & \
    cd /data && node server.js
