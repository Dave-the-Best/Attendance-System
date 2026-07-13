const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) socket.user = user;
      next();
    } catch {
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
      if (socket.user.role === 'admin') socket.join('admins');
    }

    socket.on('chat:message', (msg) => {
      if (!socket.user) return;
      io.emit('chat:message', {
        from: socket.user.name,
        role: socket.user.role,
        message: msg,
        time: new Date(),
      });
    });

    socket.on('disconnect', () => {});
  });
};

module.exports = initSocket;
