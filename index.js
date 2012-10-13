var express = require('express')
  , app =  express()
  , _ =  require('underscore')
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));

var allUsers = {};

io.sockets.on('connection', function (socket) {

  var  sendUsers= function(broadcast){
    console.log("sending user");
    console.log(allUsers);
    console.log(_.keys(allUsers));
    _.each(_.keys(allUsers), function(user){
        console.log(user)
        console.log(_.extend({name:user}, allUsers[user]));
        if(broadcast){
          console.log("broadcasting to everyone")
          socket.broadcast.emit("user_join", _.extend({name:user}, allUsers[user]));
        } else {
          console.log("broadcasting to this ws connection")
          socket.emit("user_join", _.extend({name:user}, allUsers[user]));
        }
      });
  };

  socket.on('user_move', function (data) {
    console.log("User has moved" + data.name);
    socket.broadcast.emit("user_move", data);
    allUsers[data.name] = _.omit(data, 'name');
  });

  socket.on('user_message', function (data) {
    console.log("User has messaged" + data.name + " " + data.message);
    socket.broadcast.emit("user_message", data);
    socket.emit("user_message", data);
  });

  socket.on('user_join', function (data) {
    console.log("User has joined" + data.name);
    if(!data.color){
      data.color ="#" + _.random(0, 16777215).toString(16);
    }
    socket.broadcast.emit("user_join", data);
    allUsers[data.name] = _.omit(data, 'name', 'me');
    socket.emit("user_join", data);
    console.log(allUsers);
    sendUsers(true);
  });

  sendUsers(false);
  console.log("New Connection");
});
