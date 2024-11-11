FROM node:22-alpine
WORKDIR /usr/src/app
COPY . .
RUN yarn
ENTRYPOINT [ "yarn", "start:local" ]







