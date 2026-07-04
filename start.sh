#!/bin/bash

cd server-files

if [ ! -f "server.jar" ]; then
    echo "Téléchargement de server.jar..."
    wget -O server.jar https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar
fi

if [ ! -f "fabric-server-launch.jar" ]; then
    echo "Téléchargement de fabric-server-launch.jar..."
    wget -O fabric-server-launch.jar https://maven.fabricmc.net/net/fabricmc/fabric-loader/0.19.3/fabric-loader-0.19.3.jar
fi

java -Xmx2048M -Xms1024M -jar fabric-server-launch.jar nogui &

cd ..
node server.js
