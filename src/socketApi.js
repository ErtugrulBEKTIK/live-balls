const socketio = require('socket.io');
const io = socketio();

const socketApi = {};
socketApi.io = io;

const users = {};

// Helpers
const randomColor = require('../helpers/randomColor');

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('newUser', (data) => {
    const defaultData = {
      id: socket.id,
      position: {
        x: 0,
        y: 0
      },
      color: randomColor()
    };
    users[socket.id] = Object.assign(data, defaultData);

    socket.broadcast.emit('newUser', users[socket.id]);
    socket.emit('initPlayers', users);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('disUser', users[socket.id]);
    delete users[socket.id];
  });

  socket.on('animate', (data) => {
    try {
      users[socket.id].position.x = data.x;
      users[socket.id].position.y = data.y;

      socket.broadcast.emit('animate', {
        socketId: socket.id,
        x: data.x,
        y: data.y
      });
    } catch (e) {
      console.log(e);
    }
  });

  socket.on('newMessage', (message) => {
    const messageData = Object.assign({ socketId: socket.id }, message);
    socket.broadcast.emit('newMessage', messageData);
  });
});

module.exports = socketApi;
