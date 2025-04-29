FROM node:22

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn
COPY . .

CMD ["/bin/bash", "./docker/app/run.sh"]
