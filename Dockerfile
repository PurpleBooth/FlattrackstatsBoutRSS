FROM node:latest AS build-env

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

FROM gcr.io/distroless/nodejs
COPY --from=build-env /usr/src/app /usr/src/app

EXPOSE 8081
CMD [ "/usr/src/app/index.js" ]
