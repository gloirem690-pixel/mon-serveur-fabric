FROM nikolaik/python-nodejs:python3.11-nodejs20

RUN apt-get update && apt-get install -y openjdk-21-jre-headless && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY --chmod=755 start.sh /app/start.sh
COPY . .

EXPOSE 8080

CMD ["sh", "/app/start.sh"]
