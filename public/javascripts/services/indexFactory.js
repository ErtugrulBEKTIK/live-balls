app.factory('indexFactory', [() => {
  const connectSocket = (url, options) => new Promise((resolve, reject) => {
    const socket = io.connect(url, options);

    socket.on('connect', () => {
      resolve(socket);
    });

    socket.on('connection_error', () => {
      reject(new Error('connection error'));
    });
  });

  return {
    connectSocket
  };
}]);
