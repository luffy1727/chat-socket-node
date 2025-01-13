const { User, Room, UserRoom } = require('../models');
const roomSubscriptions = new Map();
const dmSubscriptions = new Map();

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
      console.error('Error in sending message:', error);
      callback(error, null);
    }
  }

  async sendDirectMessage(call, callback) {
    const { fromUser, toUser, content } = call.request;

    try {
      const [sender, receiver] = await Promise.all([
        User.findOne({ where: { username: fromUser } }),
        User.findOne({ where: { username: toUser } })
      ]);

      if (!sender || !receiver) {
        callback(null, { 
          success: false, 
          error: 'User not found' 
        });
        return;
      }

      const message = {
        fromUser,
        toUser,
        content
      };

      const recipientCall = dmSubscriptions.get(toUser);
      if (recipientCall) {
        recipientCall.write(message);
      }
      callback(null, { success: true });
    } catch (error) {
      console.error('Error in sending dm:', error);
      callback(null, { 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  async subscribeToDMs(call, callback) {
    const { username } = call.request;

    try {
      const user = await User.findOrCreate({ 
        where: { username } 
      });

      // Store the subscription
      dmSubscriptions.set(username, call);

      call.on('cancelled', () => {
        dmSubscriptions.delete(username);
      });

    } catch (error) {
      console.error('Error in subscribeToDirectMessages:', error);
      callback({
        code: 500,
        message: 'Internal server error'
      });
    }
  }

  async leaveRoom(call, callback) {
    const { username, roomName } = call.request;
    const leaveMessage = {
      username: 'System',
      roomName,
      content: `${username} left the room`,
    };

    this.broadcastToRoom(roomName, leaveMessage);
    try {
      await this.handleDisconnect(username, roomName, call);
      callback(null, { success: true });
    } catch (error) {
      console.error('Error in leaveRoom:', error);
      callback(error, null);
    }
  }

  async handleDisconnect(username, roomName) {
    try {  
      const roomSubs = roomSubscriptions.get(roomName);
      if (roomSubs) {
        roomSubs.delete(username);
        if (roomSubs.size === 0) {
          roomSubscriptions.delete(roomName);
        }
      }
      dmSubscriptions.delete(username);

      const [user, room] = await Promise.all([
        models.User.findOne({ where: { username } }),
        models.Room.findOne({ where: { name: roomName } })
      ]);

      if (user && room) {
        await models.UserRoom.destroy({
          where: { userId: user.id, roomId: room.id }
        });
      }
    } catch (error) {
      console.error('Error in handleDisconnect:', error);
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
