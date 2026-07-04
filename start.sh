#!/bin/bash

cd server-files

# Télécharger l'installeur Fabric si absent
if [ ! -f "fabric-installer.jar" ]; then
    echo "Téléchargement de l'installeur Fabric..."
    wget -O fabric-installer.jar https://maven.fabricmc.net/net/fabricmc/fabric-installer/0.11.2/fabric-installer-0.11.2.jar
fi

# Télécharger le serveur vanilla si absent
if [ ! -f "server.jar" ]; then
    echo "Téléchargement de server.jar..."
    wget -O server.jar https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar
fi

# Générer le lanceur Fabric avec l'installeur
if [ ! -f "fabric-server-launch.jar" ] || [ ! -d ".fabric" ]; then
    echo "Génération du lanceur Fabric..."
    java -jar fabric-installer.jar server -mcversion 1.21.1 -loader 0.19.3 -downloadMinecraft
fi

# Lancer le serveur
echo "Lancement du serveur Fabric..."
java -Xmx2048M -Xms1024M -jar fabric-server-launch.jar nogui &

cd ..
node server.js
