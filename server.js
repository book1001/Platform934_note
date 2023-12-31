var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var fs = require("fs");
var text;

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// server가 client 와 연결되면 함수 실행
io.on("connection", function (socket) {
  /* client connect event */
  // db.txt 파일에서 현재까지 저장된 text를 불러옴
  fs.readFile('./data/db.txt', 'UTF-8', (err, data) => {
    text = data;
    
    // sever가 방금 연결된 client로 db.txt에 저장된 값을 new_data event를 통해 전달 (client가 처음 접속했을 때만 실행)
    socket.emit("new_data", text);
  });
  
  /* keyboard event */
  // client 가 server로 new_data event를 보낼 경우
  socket.on("new_data", (data) => {
    text = data;
    // db.txt 파일에 해당 값을 저장
    fs.writeFile('./data/db.txt', text);

    // 메세지를 전달한 client 를 제외한 모든 client 에 new_data 값 전달
    socket.broadcast.emit("new_data", text);
  });

  
  /* Get concurrent number of people */
  // server가 모든 client에게 online event 전달 (하단에 현재 접속중인 유저 수를 알려주는 event)
  io.emit("online", Object.keys(io.sockets.connected).length);
  socket.on("disconnect", () => {
    io.emit("online", Object.keys(io.sockets.connected).length);
  });
});

http.listen(3000);
