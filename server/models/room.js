module.exports = (sequelize, DataTypes) => {
    const Room = sequelize.define('Room', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    }, {
      tableName: 'rooms',
      timestamps: false,
    });
  
    Room.associate = (models) => {
      Room.belongsToMany(models.User, {
        through: 'UserRoom',
        foreignKey: 'roomId',
        otherKey: 'userId'
      });
    };
  
    return Room;
  };