/*--------------------------------------------------------------------------------------------
--	SOURCE FILE:	server.js 	  	This application receives coordinates and writes it into a JSON
--
--	PROGRAM:
--
--	FUNCTIONS:		getCurrentTime()
--
--
--
--	DATE:			March 19, 2019
--
--	REVISIONS:		(Date and Description)
--
--
--	DESIGNER:		Phat Le
--
--	PROGRAMMER:		Phat Le
--
--	NOTES:
--	This program listens to port 4985 and receives incoming coordinates from android app
--------------------------------------------------------------------------------------------*/

const express = require("express");
const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = 4985;
const fs = require("fs");
const filename = "data.JSON";

let ip = new Array();
let index = 0;

/*--------------------------------------------------------------------------------------------
--	FUNCTIONS:		server.listen			Open connection and listen on port 4985
--
--	DATE:		    	March 19, 2019
--
--	REVISIONS:		(Date and Description)
--
--	DESIGNER:		  Phat Le
--
--	PROGRAMMER:		Phat Le
--
--	INTERFACE:		server.listen(port, function())
--                  port: port number to listen on
--                  function(): Callback function to delete existing JSON on start
--                
--
--	RETURN:		    void
--
--	NOTES:
--  data.JSON is deleted at the start of running the server
--------------------------------------------------------------------------------------------*/
server.listen(port, () => {
  fs.stat(filename, function(err, stats) {
    if (err) {
      return console.error(err);
    }
    fs.unlink(filename, function(err) {
      if (err) return console.log(err);
      console.log("file deleted successfully");
    });
  });
  console.log(`Server listening at port ${port}`);
});

/*--------------------------------------------------------------------------------------------
--	FUNCTIONS:		io.sockets.on				On connection, store data into JSON when client connects
--
--	DATE:		    	March 19, 2019
--
--	REVISIONS:		(Date and Description)
--
--	DESIGNER:	  	Phat Le
--
--	PROGRAMMER:		Phat Le
--
--	INTERFACE:		io.sockets.on("connection", function(socket))
--						      "connection": string literal, parameter for client connection
--                  socket: the socket connection
--
--	RETURN:			  void
--
--	NOTES:
--  Once client connects, there is another function 'socket.on("send coorindates"), data =>{})
--  that will trigger when the client sends the coordinates. It will store data into data.JSON
--------------------------------------------------------------------------------------------*/
io.sockets.on("connection", socket => {
  console.log("Client connecting");
  socket.on("send coordinates", data => {
    let exist = false;
    console.log("socket.io server recived: ", data);

    new Promise((resolve, reject) => {
      let cord = JSON.parse(data);
      if (ip.length == 0) {
        console.log("Empty array");
        ip.push(cord.ip);
      } else {
        for (let i = 0; i < ip.length; i++) {
          if (ip[i] == cord.ip) {
            console.log("This exist");
            exist = true;
            index = i;
            break;
          }
        }
        console.log(exist);
        if (!exist) {
          ip.push(cord.ip);
        }
      }
      cord.time = getCurrentTime();
      if (cord != "") {
        resolve(cord);
      } else {
        reject("Data is empty");
      }
    }).then(
      value => {
        fs.open(filename, "r", (err, fd) => {
          if (err) {
            let json = new Array();
            json.push(value);
            fs.writeFile(filename, JSON.stringify(json), err => {
              if (err) {
                console.log(err);
              }
              console.log("wrote to file for first time");
            });
          } else {
            fs.readFile(filename, (err, cords) => {
              if (err) {
                console.log(err);
              }
              let data = JSON.parse(cords);
              if (exist) {
                data[index] = value;
              } else {
                console.log("Pushed");
                data.push(value);
              }
              fs.writeFile(filename, JSON.stringify(data), err => {
                if (err) {
                  console.log(err);
                }
              });
            });
          }
        });
      },
      reasons => {
        console.log(reasons);
      }
    );
  });

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });
});

/*--------------------------------------------------------------------------------------------
--	FUNCTIONS:		getCurrentTime()				Get the current time stamp in a readable format
--
--	DATE:		    	March 19, 2019
--
--	REVISIONS:		(Date and Description)
--
--	DESIGNER:	  	Phat Le
--
--	PROGRAMMER:		Phat Le
--
--	INTERFACE:		funtion getCurrentTime()
--
--	RETURN:			return the current time stamp in string format
--
--	NOTES:
--
--------------------------------------------------------------------------------------------*/
function getCurrentTime() {
  let date = new Date();
  let options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short"
  };
  return date.toLocaleDateString("en-US", options);
}
