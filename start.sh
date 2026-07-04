#!/bin/bash

cd server-files

if [ ! -f "server.jar" ]; then
    echo "Téléchargement de server.jar..."
    wget -O server.jar https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar
fi

java -Xmx2048M -Xms1024M -jar fabric-server-launch.jar nogui &

cd ..
node server.js
