#!/bin/bash

cd server-files

# 1. Télécharger le serveur vanilla si absent
if [ ! -f "server.jar" ]; then
    echo "Téléchargement de server.jar..."
    wget -O server.jar https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar
fi

# 2. Télécharger le lanceur Fabric si absent
if [ ! -f "fabric-server-launch.jar" ]; then
    echo "Téléchargement de fabric-server-launch.jar..."
    wget -O fabric-server-launch.jar https://maven.fabricmc.net/net/fabricmc/fabric-loader/0.19.3/fabric-loader-0.19.3.jar
fi

# 3. Lancer le serveur avec la commande standard
echo "Lancement du serveur Fabric..."
java -Xmx2048M -Xms1024M -jar fabric-server-launch.jar nogui &

cd ..
node server.js
