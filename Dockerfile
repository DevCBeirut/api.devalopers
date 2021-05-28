FROM node:alpine

RUN mkdir -p /usr/node-app && chown -R node:node /usr/node-app

WORKDIR /usr/node-app

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 3000
