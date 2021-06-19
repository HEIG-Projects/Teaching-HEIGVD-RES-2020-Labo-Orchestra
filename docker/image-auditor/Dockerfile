FROM node:14.17

RUN apt-get update && \
  apt-get install -y vim nano tcpdump netcat net-tools

COPY src /opt/app

WORKDIR /opt/app
RUN npm install

ENTRYPOINT ["node", "auditor.js"]
