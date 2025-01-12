const { User, Room, UserRoom } = require('../models');

/**
 * Connect a user to a room in the database.
 * @param {object} call - The gRPC call object.
 * @param {function} callback - The callback to return the response.
 */
async function joinRoom(call, callback) {
  const { username, roomName } = call.request;

  try {
    const [user] = await User.findOrCreate({
      where: { username },
    });
    
    console.log(user)

    const [room] = await Room.findOrCreate({
      where: { name: roomName || 'main' },
    });

    console.log(room);

    // Create the association in UserRoom
    await UserRoom.findOrCreate({
      where: {
        userId: user.id,
        roomId: room.id,
      },
    });

    // Respond with the user and room data
    callback(null, {
      message: `${username} connected to room: ${roomName}`,
      user: {
        id: user.id,
        username: user.username,
      },
      room: {
        id: room.id,
        name: room.name,
      },
    });
  } catch (error) {
    console.error('Error connecting user to room:', error);
    callback({
      code: 500,
      message: 'Internal server error',
    });
  }
}

module.exports = {
  joinRoom,
};
