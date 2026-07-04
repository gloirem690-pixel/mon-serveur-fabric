#!/bin/bash

# Aller dans le répertoire du serveur
cd server-files

# Démarrer le serveur Fabric en arrière-plan
java -Xmx2048M -Xms1024M -jar fabric-server-launch.jar nogui &

# Revenir au répertoire racine pour lancer le panel
cd ..
node server.js
