function headerClick(element) {
    var allHeaders = document.getElementsByClassName("header");
    for (var i = 0; i < allHeaders.length; i++){
        allHeaders[i].classList.remove("selected");
    }
    element.classList.add("selected");
}

function showSection(toShow) {
    switch (toShow) {
        case 'home':
            document.getElementById("home").style.display = "block";
            document.getElementById("setup").style.display = "none";
            document.getElementById("connect").style.display = "none";
            document.getElementById("team").style.display = "none";
            break;
        case 'setup':
            document.getElementById("home").style.display = "none";
            document.getElementById("setup").style.display = "block";
            document.getElementById("connect").style.display = "none";
            document.getElementById("team").style.display = "none";
            break;
        case 'connect':
            document.getElementById("home").style.display = "none";
            document.getElementById("setup").style.display = "none";
            document.getElementById("connect").style.display = "block";
            document.getElementById("team").style.display = "none";
            break;
        case 'team':
            document.getElementById("home").style.display = "none";
            document.getElementById("setup").style.display = "none";
            document.getElementById("connect").style.display = "none";
            document.getElementById("team").style.display = "block";
            break;
        default:
    }

}

window.onload = function() {
    var allHeaders = document.getElementsByClassName("header");
    for (var i = 0; i < allHeaders.length; i++){
        allHeaders[i].addEventListener("click", function() {
            headerClick(this);
        });
    }
}

// ------------------------------- PI -----------------------------------

//var get_url = "http://10.3.1.145:5000/testGet"
var connect_post_url = "http://10.3.1.145:5000/connect"
function getPi() {
    $.get(get_url, function(response) {writeMessage("received", response)})
}

function postPi() {
    $.post(post_url, { deviceType: "sphero"},
        function(response) {writeMessage("sent", response)})
}
// ------------------------------- Display -----------------------------------
function writeMessage(element, msg) {
    var msgDiv = document.getElementById(element);
    msgDiv.innerHTML = msg;
}

// ------------------------------- Connect -----------------------------------
var connectPost = "http://10.3.1.145:5000/connect"
function connectDevice(type) {
    if (type == "wedo") {
        $.post(connectPost, { deviceType: type}, function(response) {
            if (response == "OK") {
                writeMessage("receivedWedo", "Connected to WeDo Succesfully")
            }})
    } else if (type == "sphero") {
        $.post(connectPost, { deviceType: type}, function(response) {
            if (response == "OK") {
                writeMessage("receivedSphero", "Connected to Sphero Succesfully")
            }})
    }
}

// ------------------------------- Disconnect -----------------------------------
var disconnectPost = "http://10.3.1.145:5000/disconnect"
function disconnectDevice(type) {
    if (type == "wedo") {
        $.post(disconnectPost, { deviceType: type}, function(response) {
            if (response == "OK") {
                writeMessage("receivedWedo", "Disconnected to WeDo Succesfully")
            }})
    } else if (type == "sphero") {
        $.post(disconnectPost, { deviceType: type}, function(response) {
            if (response == "OK") {
                writeMessage("receivedSphero", "Disconnected to Sphero Succesfully")
            }})
    }
}

// ------------------------------- WeDo Move -----------------------------------
var wedoMovePost = "http://10.3.1.145:5000/wedoMove"
function wedoMove() {
    var port = prompt("Enter Port Number (1 or 2)", "1");
    var speed = prompt("Enter Speed", "10");

    if (port == null || port == "" || speed == null || speed == "") {
        msg = "Invalid input: " + port + " and " + speed;
        writeMessage("receivedWedo", msg)
    } else {
        $.post(wedoMovePost, { port:parseInt(port), speed:parseInt(speed)}, function(response) {
            if (response == "OK") {
                writeMessage("receivedWedo", "Speed Changed to " + speed + " on Port Number: " + port + " Succesfully")
            }})
    }

}

// ------------------------------- Sphero Move -----------------------------------
var spheroMovePost = "http://10.3.1.145:5000/spheroMotor"
function spheroMove() {
    var direction = prompt("Enter Direction in degress (0 - 360)", "250");
    var distance = prompt("Enter Distance(0 - 10000)", "3000");

    if (direction == null || direction == "" || distance == null || distance == "") {
        msg = "Invalid input: " + direction + " " + distance;
        writeMessage("receivedSphero", msg)
    } else {
        $.post(spheroMovePost, { direction:parseInt(direction), distance:parseInt(distance)}, function(response) {
            if (response == "OK") {
                writeMessage("receivedSphero", "Direction Changed to " + direction + " with Distance " + distance + " Succesfully")
            }})
    }
}
// ------------------------------- Wedo Color ----------------------------------
var wedoColorPost = "http://10.3.1.145:5000/wedoColor"
function wedoColor() {
    var msg;
    var red = prompt("Enter Red Value (0 - 255)", "153");
    var green = prompt("Enter Green Value (0 - 255)", "204");
    var blue = prompt("Enter Blue Value (0 - 255)", "50");

    if (red == null || red == "" || blue == null
                        || blue == "" || green == null || green == "") {
        msg = "Invalid input: " + red + "-" + green + "-" + blue;
        writeMessage("receivedWedo", msg)
    } else {
        $.post(wedoColorPost, { r:parseInt(red), g:parseInt(green), b:parseInt(blue)}, function(response) {
            if (response == "OK") {
                writeMessage("receivedWedo", "Color Changed to " + red + "-" + green + "-" + blue + " Succesfully")
            }})
    }}

// ------------------------------- Sphero Color --------------------------------
var spheroColorPost = "http://10.3.1.145:5000/spheroColor"
function spheroColor() {
    var msg;
    var red = prompt("Enter Red Value (0 - 255)", "153");
    var green = prompt("Enter Green Value (0 - 255)", "204");
    var blue = prompt("Enter Blue Value (0 - 255)", "50");


    if (red == null || red == "" || blue == null
                        || blue == "" || green == null || green == "") {
        msg = "Invalid input: " + red + "-" + green + "-" + blue;
        writeMessage("receivedSphero", msg)
    } else {
        $.post(spheroColorPost, { r:parseInt(red), g:parseInt(green), b:parseInt(blue)}, function(response) {
            if (response == "OK") {
                writeMessage("receivedSphero", "Color Changed to " + red + "-" + green + "-" + blue + " Succesfully")
            }})
    }
}

// ------------------------------- Sphero Color --------------------------------
var wedoDistanceGet = "http://10.3.1.145:5000/wedoDistance"
function wedoDistance() {
    $.get(wedoDistanceGet, function(response) {writeMessage("receivedWedo", response)})
}
