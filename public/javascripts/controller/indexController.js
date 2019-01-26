app.controller('indexController', ['$scope', 'indexFactory', 'configFactory', ($scope, indexFactory, configFactory) => {
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
  function showBubble(id, message) {
    $(`#${id}`).find('.message').html(message).show()
      .delay(2000)
      .fadeOut(500);
  }

  async function initSocket(username) {
    const connectionOptions = {
      reconnectionAttempts: 3,
      reconnectionDelay: 600
    };

    try {
      const socketUrl = await configFactory.getConfig();
      const socket = await indexFactory.connectSocket(socketUrl.data.socketUrl, connectionOptions);

      socket.emit('newUser', {username});
      socket.on('newUser', (data) => {
        const messageData = {
          type: 0, //info
          username: data.username,
          text: 'katıldı.',
        };
        $scope.messages.push(messageData);
        $scope.players[data.id] = data;
        $scope.$apply();
        scrollTop();
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
        scrollTop();
      });

      socket.on('initPlayers', (players) => {
        $scope.players = players;
        $scope.$apply();
      });

      socket.on('animate', (data) => {
        $(`#${data.socketId}`).animate({left: data.x, top: data.y}, () => {
          animate = false;
        });
      });

      let animate = false;
      $scope.onClickPlayer = ($event) => {
        if (!animate) {
          const area = $('.gameArea');
          const areaW = area.width();
          const areaH = area.height() + 30;
          console.log(areaH);
          let x = $event.offsetX - 40;
          let y = $event.offsetY - 40;
          if (x < 40) {
            x += 40;
          } else if (x > areaW - 40) {
            x = areaW - 50;
          }
          if (y < 40) {
            y += 40;
          } else if (y > areaH - 80) {
            y -= 40;
          }

          socket.emit('animate', {x, y});

          animate = true;
          $(`#${socket.id}`).animate({left: x, top: y}, () => {
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
        showBubble(socket.id, message);
        scrollTop();
      };

      socket.on('newMessage', (message) => {
        $scope.messages.push(message);
        $scope.$apply();
        showBubble(message.socketId, message.text);
        scrollTop();
      });
    } catch (err) {
      console.log(err);
    }
  }
}]);
