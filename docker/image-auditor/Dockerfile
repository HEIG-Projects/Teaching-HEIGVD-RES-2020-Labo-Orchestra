FROM node:14.17

RUN apt-get update && \
  apt-get install -y vim nano tcpdump netcat net-tools

COPY src /opt/app

ENTRYPOINT ["node", "/opt/app/auditor.js"]