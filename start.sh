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

# 3. Télécharger ASM et les autres bibliothèques
echo "Téléchargement des bibliothèques Fabric..."

mkdir -p libraries/org/ow2/asm/asm/9.7.1/
wget -O libraries/org/ow2/asm/asm/9.7.1/asm-9.7.1.jar https://repo1.maven.org/maven2/org/ow2/asm/asm/9.7.1/asm-9.7.1.jar

mkdir -p libraries/org/ow2/asm/asm-commons/9.7.1/
wget -O libraries/org/ow2/asm/asm-commons/9.7.1/asm-commons-9.7.1.jar https://repo1.maven.org/maven2/org/ow2/asm/asm-commons/9.7.1/asm-commons-9.7.1.jar

mkdir -p libraries/org/ow2/asm/asm-tree/9.7.1/
wget -O libraries/org/ow2/asm/asm-tree/9.7.1/asm-tree-9.7.1.jar https://repo1.maven.org/maven2/org/ow2/asm/asm-tree/9.7.1/asm-tree-9.7.1.jar

# 4. Lancer le serveur avec les bibliothèques dans le classpath
echo "Lancement du serveur Fabric..."
java -Xmx2048M -Xms1024M -cp "fabric-server-launch.jar:libraries/*" net.fabricmc.loader.impl.launch.server.FabricServerLauncher nogui &

cd ..
node server.js
