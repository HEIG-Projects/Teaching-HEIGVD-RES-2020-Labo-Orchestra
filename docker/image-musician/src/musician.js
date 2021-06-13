
var protocol = require('./sensor-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var socket = dgram.createSocket('udp4');

const map = new Map();
map.set("piano", "ti-ta-ti");
map.set("trumpet", "pouet");
map.set("flute", "trulu");
map.set("violin", "gzi-gzi");
map.set("drum", "boum-boum");

/*
 * Needed to get uuid
 */
const { v4: uuidv4 } = require('uuid');

/*
 * Let's define a javascript class for our musician.
 */
function musician(content) {
		var payload = JSON.stringify(content);
		message = Buffer.from(payload);
		socket.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + socket.address().port);
		});
}

var instrument = process.argv[2];
var sound = map.get(instrument);
if (!sound){
    console.log("not existing instrument");
    process.exit(1);
 
var content = {
	uuid: uuidv4(),
	sound: sound
};
setInterval(musician, 1000, content);