FROM amazoncorretto:21

RUN yum install -y curl wget tar gzip && \
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - && \
    yum install -y nodejs && \
    yum clean all

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY --chmod=755 start.sh /app/start.sh
COPY . .

EXPOSE 8080

CMD ["sh", "/app/start.sh"]
