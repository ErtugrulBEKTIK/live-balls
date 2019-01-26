app.controller('indexController', ['$scope', 'indexFactory', ($scope, indexFactory) => {
  $scope.messages = [];
  $scope.players = {};
  $scope.init = () => {
    const username = prompt('please enter username');
    if (username) {
      initSocket(username);
    } else {
      return false;
    }
  };

  function scrollTop() {
    setTimeout(() => {
      const element = document.getElementById('chat-area');
      element.scrollTop = element.scrollHeight;
    });
  }

  function initSocket(username) {
    const connectionOptions = {
      reconnectionAttempts: 3,
      reconnectionDelay: 600
    };

    indexFactory.connectSocket('http://localhost:3000', connectionOptions)
      .then((socket) => {
        socket.emit('newUser', { username });
        socket.on('newUser', (data) => {
          const messageData = {
            type: 0, //info
            username: data.username,
            text: 'katıldı.',
          };
          $scope.messages.push(messageData);
          $scope.players[data.id] = data;
          $scope.$apply();
        });

        socket.on('disUser', (data) => {
          const messageData = {
            type: 0, //info
            username: data.username,
            text: 'ayrıldı.',
          };
          $scope.messages.push(messageData);
          delete $scope.players[data.id];
          $scope.$apply();
        });

        socket.on('initPlayers', (players) => {
          $scope.players = players;
          $scope.$apply();
        });

        socket.on('animate', (data) => {
          $(`#${data.socketId}`).animate({ left: data.x, top: data.y }, () => {
            animate = false;
          });
        });

        let animate = false;
        $scope.onClickPlayer = ($event) => {
          if (!animate) {
            const x = $event.offsetX;
            const y = $event.offsetY;

            socket.emit('animate', { x, y });

            animate = true;
            $(`#${socket.id}`).animate({ left: x, top: y }, () => {
              animate = false;
            });
          }
        };

        $scope.newMessage = () => {
          const message = $scope.message;
          const messageData = {
            type: 1, //info
            username,
            text: message,
          };
          socket.emit('newMessage', messageData);

          $scope.messages.push(messageData);
          $scope.message = '';
          scrollTop();
        };

        socket.on('newMessage', (message) => {
          $scope.messages.push(message);
          $scope.$apply();
          scrollTop();
        });
      }).catch((err) => {
        console.log(err);
      });
  }
}]);
