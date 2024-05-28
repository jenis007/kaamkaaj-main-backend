const socketIO = require('socket.io');
const { getChatMessagesById } = require('./helper');

let io;

function initSocket(server) {
  io = socketIO(server);

  io.on('connection', (socket) => {
    socket.on('loadChatMessages', async (data) => {
      try {
        const { chatId } = data;
        const chatData = await getChatMessagesById(chatId)
        io.emit('chatMessagesLoaded', chatData);

      } catch (error) {
        io.emit('chatMessagesLoadError', { error: error.message });
      }
    });
  });
}

function getSocketDataUsingId(data) {
  if (!data.id) {
    io.emit('socketError', { message: 'ID not found' });
    return;
  }
  
  io.emit(data.id, data);
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

module.exports = { initSocket, getIo, getSocketDataUsingId }; 