import http from "http";
/*import WebSocket from "ws";*/
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set('view engine', "pug");
app.set('views', __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Wow! Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms() {
    const {
        sockets: {
          adapter: { sids, rooms },
        },
      } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";

    socket.onAny((event) => { // socket에 있는 event 확인 
        console.log(wsServer.sockets.adapter);
        console.log(`socket event: ${event}`);
    })
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms()); // send a msg to all sockets
    });
    socket.on("disconnecting", () => {
        // happen shortly before the socket leaves the room 
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1));
        //wsServer.sockets.emit("room_change", publicRooms()); // send a msg to all sockets
    })
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms()); // send a msg to all sockets
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
        done();
    });
    socket.on("nickname", nickname => (socket["nickname"] = nickname));
});


/*
const wss = new WebSocket.Server({ server }); 
const sockets = [];
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser");
    socket.on("close", () => {
        console.log("Disconnected to Browser");
    })

    socket.on("message", (msg) => {
        const translatedMsg = msg.toString('utf-8');
        const message = JSON.parse(translatedMsg);

        switch(message.type) {
            case "new_message": 
                sockets.forEach((aSocket)  => aSocket.send(`${socket.nickname}: ${message.payload}`));
            case "nickname": 
                socket["nickname"] = message.payload;
        }

    });
});*/

httpServer.listen(3000, handleListen);

