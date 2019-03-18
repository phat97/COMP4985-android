const express = require("express");
const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = 4985;
const fs = require("fs");

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

io.sockets.on("connection", socket => {
  console.log("Client connecting");
  socket.on("send coordinates", data => {
    console.log("socket.io server recived: ", data);
    const filename = "data.JSON";

    new Promise((resolve, reject) => {
      //let cord = JSON.parse(data);
      data.time = getCurrentTime();
      if (data != "") {
        resolve(data);
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
              data.push(value);
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
