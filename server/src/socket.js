const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:5174'
      ],
      credentials: true
    }
  });

  io.use((socket, next) => {
    let token = socket.handshake.auth?.token;
    if (!token && socket.handshake.headers?.authorization) {
      const parts = socket.handshake.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return next(new Error('Not authorized, token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Token invalid'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const role = socket.user.role;

    socket.join(`user_${userId}`);

    if (role === 'admin') {
      socket.join('admins');
    }

    socket.on('disconnect', () => {

    });
  });

  return io;
};

const getIO = () => io;

const emitNewTicket = (ticket) => {
  if (!io) return;
  io.to('admins').emit('new_ticket', {
    ticketId: ticket._id,
    subject: ticket.subject,
    priority: ticket.priority
  });
};

const emitTicketUpdated = (authorId, payload) => {
  if (!io || !authorId) return;
  io.to(`user_${authorId}`).emit('ticket_updated', payload);
};

module.exports = {
  initSocket,
  getIO,
  emitNewTicket,
  emitTicketUpdated
};
