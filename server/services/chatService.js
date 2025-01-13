const { User, Room, UserRoom } = require('../models');
const roomSubscriptions = new Map(); // to store room subscription calls.

class ChatServer {
  async joinRoom(call, callback) {
    const { username, roomName } = call.request;
  
    try {
      const [user] = await User.findOrCreate({
        where: { username },
      });
  
      console.log(user)
  
      const [room] = await Room.findOrCreate({
        where: { name: roomName || 'main' },
      });

      await UserRoom.findOrCreate({
        where: {
          userId: user.id,
          roomId: room.id,
        },
      });
  
      if (!roomSubscriptions.has(roomName)) {
        roomSubscriptions.set(roomName, new Map());
      }
      roomSubscriptions.get(roomName).set(username, call);
            
      call.on('cancelled', async () => {
        // Handle client disconnect herre
      });
  
      const joinMessage = {
        username: 'System',
        roomName,
        content: `${username} joined the room`,
      };
      this.broadcastToRoom(roomName, joinMessage)
    } catch (error) {
      console.error('Error connecting user to room:', error);
      callback({
        code: 500,
        message: 'Internal server error',
      });
    }
  };

  async sendMessage(call, callback) {
    const { username, roomName, content } = call.request;

    try {
      // Verify user is in room
      if (!roomSubscriptions.get(roomName)?.has(username)) {
        callback(new Error('User not in room'), null);
        return;
      }

      const message = {
        username,
        roomName,
        content
      };

      this.broadcastToRoom(roomName, message);
      callback(null, { success: true });

    } catch (error) {
      console.error('Error in sendMessage:', error);
      callback(error, null);
    }
  }

  broadcastToRoom(roomName, message) {
    const roomSubs = roomSubscriptions.get(roomName);
    if (roomSubs) {
      roomSubs.forEach(call => {
        call.write(message);
      });
    }
  }
}

module.exports = {
  ChatServer,
};
