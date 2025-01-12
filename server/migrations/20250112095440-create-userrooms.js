module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_rooms', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      roomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // Add composite primary key
    await queryInterface.addConstraint('user_rooms', {
      fields: ['userId', 'roomId'],
      type: 'primary key',
      name: 'user_rooms_pkey'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_rooms');
  }
};