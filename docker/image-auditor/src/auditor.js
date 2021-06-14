/**
 * Auditor, simulates someone who listens to the orchestra. This application has two responsibilities. 
 * Firstly, it must listen to Musicians and keep track of **active** musicians. A musician is active if 
 * it has played a sound during the last 5 seconds. Secondly, it must make this information available to you. 
 * Concretely, this means that it should implement a very simple TCP-based protocol.
 * 
 * Authors : Axel Vallon & Lev Pozniakoff
 */

/* import package */
const protocol = require('./sensor-protocol');
const dgram = require('dgram');
const moment = require('moment');
const net = require('net');  

/* constant */
const soundToInstrument = new Map();
soundToInstrument.set("ti-ta-ti", "piano");
soundToInstrument.set("pouet", "trumpet");
soundToInstrument.set("trulu", "flute");
soundToInstrument.set("gzi-gzi", "violin");
soundToInstrument.set("boum-boum", "drum");

const socket = dgram.createSocket('udp4');
const mapMusicianAlive = new Map();
const server = new net.Server();

/**
 * Listen UDP on port protocol.PROTOCOL_PORT_UDP
 */
socket.bind(protocol.PROTOCOL_PORT_UDP, function() {
  console.log("Joining multicast group");
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 */
socket.on('message', function(msg, source) {
  // console.log("Data has arrived: " + msg + ". Source port: " + source.port);
  const myData = JSON.parse(msg)
  if (!soundToInstrument.has(myData.sound) || !(myData.uuid)) {
      console.log("invalid packet received");
  }
  else{
    if (mapMusicianAlive.has(myData.uuid)){
      var myContent = mapMusicianAlive.get(myData.uuid);
      myContent.lastActivity = moment();
    }
    else{ 
      console.log("new musician : " + myData.uuid);
      var myContent = {instrument: soundToInstrument.get(myData.sound), activeSince: moment(), lastActivity: moment()};
    }
    mapMusicianAlive.set(myData.uuid, myContent); 
  }
});

/**
 * We verify our musician if they send a message recently
 * @param {*} value array with data from this musician
 * @param {*} key uuid of musician
 * @param {*} map map to work in
 */
function verifyMusician(value, key, map){
  var now = moment();
  if (now.subtract(5, 'seconds') > value.lastActivity){
    console.log("suppression du musicien :  " + key);
    map.delete(key);
  }
}

/**
 * Listen TCP connection on port protocol.PROTOCOL_PORT_TCP
 */
server.listen(protocol.PROTOCOL_PORT_TCP, function() {
  console.log("Server listening for TCP connection requests");
});

/**
 * When a TCP client arrive, we create a new socket
 */
server.on('connection', function(socketTcp) {
  console.log('A new TCP connection has been established.');

  /* generate json content for TCP client */
  var musicianAlive = []
  mapMusicianAlive.forEach(function(value, key) {
    musicianAlive.push({
      uuid: key,
      instrument: value.instrument,
      activeSince: value.activeSince.utcOffset(+120).format()
    })
  });

  socketTcp.write(JSON.stringify(musicianAlive));

  /* In case of error, we log it */
  socketTcp.on('error', function(err) {
      console.log(`Error: ${err}`);
  });
  /* We destroy the socket, that close the connection for the client */
  socketTcp.destroy();
});

/* Every 0.5s, we update our list of active musician */
setInterval(function(){ mapMusicianAlive.forEach(verifyMusician)}, 500 );