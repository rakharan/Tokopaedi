FROM node:20-alpine AS build-image
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
RUN apk update --no-cache && apk add --no-cache bash
WORKDIR /usr/src/app
COPY package*.json ./
COPY --from=build-image /usr/src/app/build ./build
RUN npm ci
COPY . .
CMD [ "node", "build/app.js" ]