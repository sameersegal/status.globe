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

  socket.on('user_move', function (data) {
    console.log("User has moved" + data.name);
    socket.broadcast.emit("user_move", data);
    allUsers[data.name] = _.omit(data, 'name');
  });

  socket.on('user_message', function (data) {
    console.log("User has messaged" + data.name + " " + data.message);
    socket.broadcast.emit("user_message", data);
  });

  socket.on('user_join', function (data) {
    console.log("User has joined" + data.name);
    socket.broadcast.emit("user_join", data);
    allUsers[data.name] = _.omit(data, 'name', 'me');
    socket.emit("user_join", data);
    _.each(allUsers.keys, function(user){
      console.log(user)
      console.log(_.merge({name:user}, allUsers[user]));
      socket.emit("user_join", _.merge({name:user}, allUsers[user]));
    });
  });
  console.log("New Connection");
});
