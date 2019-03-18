const express = require("express");
const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = 4985;
const fs = require("fs");
const filename = "data.JSON";

let ip = new Array();
let index = 0;

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
