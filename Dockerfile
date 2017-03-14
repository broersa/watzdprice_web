FROM node:argon

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
EXPOSE 8080

COPY ./package.json /usr/src/app/
RUN npm install --no-dev --no-bin-links

COPY ./src /usr/src/app/src
COPY ./config /usr/src/app/config

CMD [ "npm", "start" ]
