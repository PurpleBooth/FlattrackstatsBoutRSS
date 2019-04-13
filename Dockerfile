FROM node:latest AS build-env

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

ENV PORT=8080
EXPOSE 8080
CMD [ "npm", "start" ]
