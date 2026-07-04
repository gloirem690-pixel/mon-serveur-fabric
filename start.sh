#!/bin/bash

# Aller dans le dossier du serveur
cd server-files

# Télécharger server.jar s'il n'existe pas
if [ ! -f "server.jar" ]; then
    echo "Téléchargement de server.jar..."
    wget -O server.jar https://piston-data.mojang.com/v1/objects/95d414bf4b0c9db5ab0a24c3d4020b523c5e265d/server.jar
fi

# Lancer le serveur Fabric
java -Xmx2048M -Xms1024M -jar fabric-server-launch.jar nogui
