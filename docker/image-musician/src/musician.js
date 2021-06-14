/**
 * Musician, simulates someone who plays an instrument in an orchestra. When the app is started, 
 * it is assigned an instrument (piano, flute, etc.). As long as it is running, every second it will 
 * emit a sound (well... simulate the emission of a sound: we are talking about a communication protocol). 
 * Of course, the sound depends on the instrument. 
 * 
 * Authors : Axel Vallon and Lev Pozniakoff
 */

/* Importation of required packages */
var protocol = require('./sensor-protocol');
var dgram = require('dgram');
var socket = dgram.createSocket('udp4');
const { v4: uuidv4 } = require('uuid');

/* initialization of constant */
const intrumentToSound = new Map();
intrumentToSound.set("piano", "ti-ta-ti");
intrumentToSound.set("trumpet", "pouet");
intrumentToSound.set("flute", "trulu");
intrumentToSound.set("violin", "gzi-gzi");
intrumentToSound.set("drum", "boum-boum");

/**
 * Function that send json payload on multicast
 * @param {*} content json payload as string with uuid and sound to emit
 */
function musician(message) {
		socket.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + socket.address().port);
		});
}

const instrument = process.argv[2];
const sound = intrumentToSound.get(instrument);
/* This condition can get rid of all bad entry */
if (!sound){ 
    console.log("not existing instrument");
    process.exit(1);
}

const content = {
		uuid: uuidv4(),
		sound: sound
};

var payload = JSON.stringify(content);
message = Buffer.from(payload);

/* send a sound every second */
setInterval(musician, 1000, message);