module.exports = (sequelize, DataTypes) => {
    const UserRoom = sequelize.define('UserRoom', {
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      roomId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'rooms',
          key: 'id'
        }
      }
    }, {
      tableName: 'user_rooms',
      timestamps: false,
    });
  
    return UserRoom;
  };