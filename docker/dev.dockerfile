FROM node:16.13.2-stretch-slim

WORKDIR /usr/src/app

CMD [ "npm", "run", "start:dev" ]