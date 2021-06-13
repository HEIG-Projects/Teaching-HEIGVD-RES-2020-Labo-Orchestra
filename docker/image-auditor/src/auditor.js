const protocol = require('./sensor-protocol');
const dgram = require('dgram');
const moment = require('moment');
const net = require('net');  

const soundToInstrument = new Map();
soundToInstrument.set("ti-ta-ti", "piano");
soundToInstrument.set("pouet", "trumpet");
soundToInstrument.set("trulu", "flute");
soundToInstrument.set("gzi-gzi", "violin");
soundToInstrument.set("boum-boum", "drum");

const socket = dgram.createSocket('udp4');

const myMap = new Map();

const server = new net.Server();

socket.bind(protocol.PROTOCOL_PORT_UDP, function() {
  console.log("Joining multicast group");
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 */
socket.on('message', function(msg, source) {
  console.log("Data has arrived: " + msg + ". Source port: " + source.port);
  const myData = JSON.parse(msg)
  if (!soundToInstrument.has(myData.sound)) {
      console.log("invalid packet received");
  }
  else{
    if (myMap.has(myData.uuid)){
      var myContent = myMap.get(myData.uuid);
      myContent.lastActivity = moment();
    }
    else{
      console.log("new musician : " + myData.uuid);
      var myContent = {instrument: soundToInstrument.get(myData.sound), activeSince: moment(), lastActivity: moment()};
    }
    myMap.set(myData.uuid, myContent); 
  }
});

function verifyMusician(value, key, map){
  var now = moment();
  if (now.subtract(5, 'seconds') > value.lastActivity){
    console.log("suppression de " + key);
    myMap.delete(key);
  }
}
 /** TCP */

server.listen(protocol.PROTOCOL_PORT_TCP, function() {
  console.log("Server listening for connection requests");
});

server.on('connection', function(socketTcp) {
  console.log('A new connection has been established.');

  var musicianAlive = []
  myMap.forEach(function(value, key) {
    musicianAlive.push({
      uuid: key,
      instrument: value.instrument,
      activeSince: value.activeSince.utcOffset(+120).format()
    })
  });

  socketTcp.write(JSON.stringify(musicianAlive));

  socketTcp.on('error', function(err) {
      console.log(`Error: ${err}`);
  });
  socketTcp.destroy();
});

setInterval(function(){
   myMap.forEach(verifyMusician)}, 500 );