# THE HUB QUICK START GUIDE

## Installation
1. Git clone the repo: https://github.com/cloppenheimer/TheHub.git
2. Install npm if needed
3. Install node v8.11.1
4. Run “npm install” to install dependencies

## How to Run
1. Run “node hub.js”
2. Make a POST request to the /connect endpoint
   The curl command for enabling WeDo connections is:
   curl -d "deviceType=wedo"IP:5000/connect -X POST
4. To connect a WeDo, press the button on the brick and wait for the light to stop flashing and turn blue
5. After calling the /connect endpoint once, you can make any other POST requests

## Important Notes
1. When connecting WeDos the order of connection is how they get their device ids. The first device id is 0. 
2. Make sure the WeDos are charged! 

