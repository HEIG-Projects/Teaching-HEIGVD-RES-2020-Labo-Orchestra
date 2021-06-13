
const protocol = require('./sensor-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');
const moment = require('moment');

const soundToInstrument = new Map();
soundToInstrument.set("ti-ta-ti", "piano");
soundToInstrument.set("pouet", "trumpet");
soundToInstrument.set("trulu", "flute");
soundToInstrument.set("gzi-gzi", "violin");
soundToInstrument.set("boum-boum", "drum");

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const s = dgram.createSocket('udp4');

const myMap = new Map();


s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 */
s.on('message', function(msg, source) {
  console.log("Data has arrived: " + msg + ". Source port: " + source.port);
  const myData = JSON.parse(msg)
  if (!soundToInstrument.has(myData.sound)) {
    process.exit(1);
  }

  if (myMap.has(myData.uuid)){
    var myContent = myMap.get(myData.uuid);
    myContent.lastActivity = moment();
  }
  else{
    console.log("new musician : " + myData.uuid);
    var myContent = {instrument: soundToInstrument.get(myData.sound), activeSince: moment(), lastActivity: moment()};
  }
  myMap.set(myData.uuid, myContent); 
});

function getMusician() {

}

setInterval(function(){
   myMap.forEach(verifyMusician)}, 
5000 );

function verifyMusician(value, key, map){
  var now = moment()
  if (now.subtract(5, 'seconds') > value.lastActivity){
    console.log("suppression de " + key);
    myMap.delete(key);
  }
}