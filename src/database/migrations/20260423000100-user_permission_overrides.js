/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_permission_overrides', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permission_key: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      effect: {
        type: Sequelize.ENUM('allow', 'deny'),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addConstraint('user_permission_overrides', {
      fields: ['user_id', 'permission_key'],
      type: 'unique',
      name: 'user_permission_overrides_user_permission_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_permission_overrides');
  },
};
