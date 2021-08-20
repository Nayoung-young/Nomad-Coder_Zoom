import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set('view engine', "pug");
app.set('views', __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res)=> res.render("home")); 
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// 두 http, ws 서버를 같은 port에서 처리할 수 있게 하기 위함 
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // htttp 서버 위에 webSocket 서버 생성 
// 꼭 이렇게 두 개 다 안 만들어도 됨 

server.listen(3000, handleListen);

