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
          $scope.$apply();
        });

        socket.on('disUser', (data) => {
          const messageData = {
            type: 0, //info
            username: data.username,
            text: 'ayrıldı.',
          };
          $scope.messages.push(messageData);
          $scope.$apply();
        });

        socket.on('initPlayers', (players) => {
          $scope.players = players;
          $scope.$apply();
        });

        let animate = false;
        $scope.onClickPlayer = ($event) => {
          if (!animate) {
            animate = true;
            $(`#${socket.id}`).animate({ left: $event.offsetX, top: $event.offsetY }, () => {
              animate = false;
            });
          }
        };
      }).catch((err) => {
        console.log(err);
      });
  }
}]);
