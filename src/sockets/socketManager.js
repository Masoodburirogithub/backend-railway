// backend/src/sockets/socketManager.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // console.log('New client connected:', socket.id);

    // Join user room based on sessionId
    socket.on('join-user', (sessionId) => {
      socket.join(sessionId);
      // console.log(`User ${sessionId} joined room`);
    });

    // Admin authentication
    socket.on('admin-auth', (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') {
          socket.join('admin-room');
          socket.isAdmin = true;
          // console.log('Admin authenticated:', socket.id);
        }
      } catch (error) {
        console.log('Admin auth failed');
      }
    });

    // User typing indicator
    socket.on('user-typing', ({ sessionId, isTyping }) => {
      socket.to('admin-room').emit('user-typing', { sessionId, isTyping });
    });

    // Admin typing indicator
    socket.on('admin-typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('admin-typing', { isTyping });
    });

    socket.on('disconnect', () => {
      // console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };