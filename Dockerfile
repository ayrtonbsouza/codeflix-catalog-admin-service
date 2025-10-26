FROM node:22.21.0-slim

RUN npm install -g pnpm

USER node

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]
