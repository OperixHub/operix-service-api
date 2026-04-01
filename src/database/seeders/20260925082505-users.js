/** @type {import('sequelize-cli').Seeder} */
import argon2 from "argon2";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          tenant_id: 7,
          username: process.env.SEEDER_ADMIN_USERNAME,
          email: process.env.SEEDER_ADMIN_EMAIL,
          password: await argon2.hash(process.env.SEEDER_ADMIN_PASSWORD),
          root: process.env.SEEDER_ROOT_PERMISSION,
          admin: process.env.SEEDER_ADMIN_PERMISSION,
          createdAt: Sequelize.fn("NOW"),
          updatedAt: Sequelize.fn("NOW"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
