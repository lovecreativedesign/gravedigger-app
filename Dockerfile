FROM node:lts-alpine

WORKDIR /app

COPY ./package.json .

RUN npm install

COPY . /app

EXPOSE 8080

#VOLUME [ "./app/node_modules" ]

CMD ["npm", "run", "serve"]
