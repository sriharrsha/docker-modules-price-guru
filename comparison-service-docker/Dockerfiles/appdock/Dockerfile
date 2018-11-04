FROM node:8.12.0-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./comparision-service/package.json /usr/src/app
COPY ./comparision-service /usr/src/app
RUN npm install
EXPOSE 8080
CMD [ "npm", "start"]
