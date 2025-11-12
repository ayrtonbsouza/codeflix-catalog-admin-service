FROM node:22.21.0-slim

RUN apt-get update && \
    apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

USER node

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]
