/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tenants", "cnpj", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await queryInterface.addColumn("tenants", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("tenants", "description");
    await queryInterface.removeColumn("tenants", "cnpj");
  },
};
