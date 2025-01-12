module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Room", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  };
  