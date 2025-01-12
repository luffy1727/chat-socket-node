module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      }
    }, {
      tableName: 'users',
      timestamps: false,
    });
  
    User.associate = (models) => {
      User.belongsToMany(models.Room, {
        through: 'UserRoom',
        foreignKey: 'userId',
        otherKey: 'roomId'
      });
    };
  
    return User;
  };