'use strict';
var noble = require('noble');
var sphero = require('sphero');
var Wedo2 = require('wedo2');
var wedo2;
var connect_sphero = false;
var connect_wedo = false;
var wedos = new Array();
var bot;

// Set up Firestore database
const {Firestore} = require('@google-cloud/firestore');
const firestore = new Firestore({
    projectId: 'eminent-bond-233917',
    keyFilename: '/home/pi/noble/serviceAccount.json'
});

var classroom = firestore.collection('Classroom');
console.log('Classroom created');
 
// Used to prevent same device connecting multiple times
var ids = [];

var express = require('express');
var app = express();

// frameguard and helmet are for security purposes
const frameguard = require('frameguard');
app.use(frameguard({ action: 'deny' }));

const helmet = require('helmet');
app.use(helmet.noSniff());
app.use(helmet.xssFilter())

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept');
    res.header( 'X-XSS-Protection', 1) ;
    next();
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Connection endpoint
// Parameters: deviceType (must be either "sphero" or "wedo")
app.post('/connect', function(request, response) {
    var deviceType = request.body.deviceType;

    if (deviceType === 'sphero')
        connect_sphero = true;
    else if (deviceType === 'wedo') {
        connect_wedo = true;
    } else
        response.sendStatus(404);

    startNoble();
    response.sendStatus(200);
});

// Sets color of a wedo device
// Parameters: r, g, b, (between 0 and 255), device
app.post('/wedoColor', function(request, response) {
    var r = request.body.r;
    var g = request.body.g;
    var b = request.body.b;
    var i = request.body.i;
    var wedo_obj = wedos[i].object;
    var wedo_uuid = wedos[i].uuid;

    wedo_obj.setLedColor(r, g, b, wedo_uuid);
    response.sendStatus(200);
});

// Set motor of a wedo
// Parameters: speed, port, device
// forward speed must be between 1 and 100
// backward speed between -1 and -100
// stop- set speed to 0
app.post('/setWedoMotor', function(request, response) {
    var speed = request.body.speed;
    var port = request.body.port;
    var device = request.body.device;
    var wedo_obj = wedos[device].object;
    var wedo_uuid = wedos[device].uuid;

    wedo_obj.setMotor(speed, parseInt(port), wedo_uuid);
    response.sendStatus(200);
});

// Set wedo motor from distance sensor of another wedo
// Parameters: device1, device2, port
// device1 is moving device, device2 is the device it's getting 
// distance from, port is on device1
app.post('/setWedoMotorFromDistance', function(request, response) {
    var port = request.body.port;
    var device1 = request.body.device1;
    var device2 = request.body.device2;
    var wedo_obj = wedos[device1].object;
    var wedo_uuid = wedos[device1].uuid;

    var db_doc = wedos[device2].db_doc;
    var query = classroom.where('name', '==', device1).get().then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching documents.');
          return;
        }

        snapshot.forEach(doc => {
            let val1 = doc.data();
            speed = val1.distance;
            wedo_obj.setMotor(speed, parseInt(port), wedo_uuid);
            response.sendStatus(200);
        });
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });

});

// Set wedo motor from x value of tilt sensor of another wedo
// Parameters: device1, device2, port
// device1 is moving device, device2 is the device it's getting 
// tilt from, port is on device1
app.post('/setWedoMotorFromXTilt', function(request, response) {
    console.log('motooooor');
    var port = request.body.port;
    var device1 = request.body.device1;
    var device2 = request.body.device2;

    var wedo_obj = wedos[device1].object;
    var wedo_uuid = wedos[device1].uuid;

    var db_doc = wedos[device2].db_doc;
    var query = classroom.where('name', '==', device2).get().then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching documents.');
          return;
        }

        snapshot.forEach(doc => {
            let db_data = doc.data();
            var speed = db_data.tilt_x * 2;
            wedo_obj.setMotor(speed, parseInt(port), wedo_uuid);
            response.sendStatus(200);
        });
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });
});

// Set wedo motor from y value of tilt sensor of another wedo
// Parameters: device1, device2, port
// device1 is moving device, device2 is the device it's getting 
// tilt from, port is on device1
app.post('/setWedoMotorFromYTilt', function(request, response) {
    var port = request.body.port;
    var device1 = request.body.device1;
    var device2 = request.body.device2;

    var wedo_obj = wedos[device1].object;
    var wedo_uuid = wedos[device1].uuid;

    var db_doc = wedos[device2].db_doc;
    var query = classroom.where('name', '==', device2).get().then(snapshot => {
        console.log("in query")
        if (snapshot.empty) {
          console.log('No matching documents.');
          return;
        }

        snapshot.forEach(doc => {
            let db_data = doc.data();
            console.log(doc.data());
            var speed = db_data.tilt_y * 2;
            wedo_obj.setMotor(speed, parseInt(port), wedo_uuid);
            response.sendStatus(200);
        });
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });
});

// Stops wedo motor
// Parameters: port, device
app.post('/stopWedoMotor', function(request, response) {
    var port = request.body.port;
    var device = request.body.device;

    var wedo_obj = wedos[device].object;
    var wedo_uuid = wedos[device].uuid;

    wedo_obj.setMotor(0, parseInt(port), wedo_uuid);
    response.sendStatus(200);
});

// Gets distance from distance sensor, puts it in database
// Parameters: device, port
app.post('/wedoDistance', function(request, response) {
    var device = request.body.device;
    var port = request.body.port;
   
    var return_dist = 0;
    var wedo_obj = wedos[device].object;
    var wedo_uuid = wedos[device].uuid;
    var db_doc = wedos[device].db_doc;

    wedo_obj.once('distanceSensor', function(distance, port, uuid) {
        return_dist = distance;
        var updatedb = db_doc.update ({distance: return_dist});
        response.sendStatus(200);
    });
});

// Gets tilt from tilt sensor, puts it in database
// Parameters: device, port
// tilt x and y are in the range of -45 and 45 
app.post('/wedoTilt', function(request, response) {
    var device = request.body.device;
    var port = request.body.port;
   
    var return_x = 0;
    var return_y = 0;
    var wedo_obj = wedos[device].object;
    var wedo_uuid = wedos[device].uuid;
    var db_doc = wedos[device].db_doc;

    wedo_obj.once('tiltSensor', function(x, y, port, uuid) {
        return_x = x;
        return_y = y;
        var updatex = db_doc.update ({tilt_x: return_x});
        var updatey = db_doc.update ({tilt_y: return_y});
        response.sendStatus(200);
    });
});

// Controls noble BLE scanning
noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning();
    } else {
        noble.stopScanning();
    }
});

// Starts Noble, sets up connections
function startNoble() {
    noble.on('discover', function(peripheral) {
        if (connect_sphero && peripheral.connectable &&
            peripheral.advertisement.localName === 'SK-E5FC') {
            bot = sphero(peripheral.uuid, {peripheral: peripheral});
            bot.connect(function(){});
            bot.ping();
            connect_sphero = false;
        }

        if (connect_wedo  && peripheral.connectable &&
            peripheral.advertisement.localName &&
            (peripheral.advertisement.localName.toLowerCase()).includes('hub')
            && !id_already_discovered(peripheral.uuid)) {   
                ids.push(peripheral.uuid);

                var wedo2 = new Wedo2(peripheral.uuid);

                wedo2.on('connected', function(uuid) {
                    var wedo_uuid = peripheral.uuid;
                    var curr_wedo = {};
                    curr_wedo.uuid = wedo_uuid;
                    curr_wedo.object = wedo2;
                    // Add new wedo to database
                    if (!wedo_already_connected(wedo_uuid)) {
                        var db_doc = classroom.doc((wedos.length).toString());
                        var setwedo = db_doc.set({
                            name: (wedos.length).toString(), uuid: wedo_uuid
                        });
                        curr_wedo.db_doc = db_doc;
                        wedos.push(curr_wedo);
                    }

                    // have to manually start scanning again on Raspberry Pi
                    // this line is not needed on Mac
                    noble.startScanning();
            });

            wedo2.on('disconnected', function (uuid) {
                // rescan if device disconnects
                noble.startScanning();
            });
        }
    });
}

// Checks if device has already been discovered
function id_already_discovered(uuid) {
    for (var i in ids) {
        if (ids[i] === uuid) {
            return true;
        }
    }

    return false;
}

// Checks if device has already been connected
function wedo_already_connected(uuid) {
    for (var i in wedos) {
        if (wedos[i].uuid === uuid) {
            return true;
        }
    }

    return false;
}

// Prints all connected wedos
function print_wedos() {
    for (var i in wedos) {
        console.log("Index: " + i);
        console.log("Object: " + wedos[i].object)
        console.log("UUID: " + wedos[i].uuid)
    }
}


app.listen(app.get('port'), function() {
    // console.log('Node app is running on port', app.get('port'));
});


// EVERYTHING BELOW HERE IS ABOUT SPHERO
// This code has not been fully tested and may not be functional
app.post('/spheroColor', function(request, response) {
    var r = request.body.r;
    var g = request.body.g;
    var b = request.body.b;
    console.log(r + ' ' + g + ' ' + b);

    bot.color({ red: r, green: g, blue: b });
    console.log('changing color');
    response.sendStatus(200);

});

app.post('/spheroMotor', function(request, response) {
    var direction = request.body.directon;
    var distance = request.body.distance;
    console.log('bing');
    bot.roll(distance, direction);
    console.log('bada');
    response.sendStatus(200);
});






