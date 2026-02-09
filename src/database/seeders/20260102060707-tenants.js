/** @type {import('sequelize-cli').Seeder} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "tenants",
      [
        {
          name: process.env.SEEDER_ADMIN_NAME_TENANT,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tenants", null, {});
  },
};
