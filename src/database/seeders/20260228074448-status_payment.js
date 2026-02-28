/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "status_payment",
      [
        {
          name: "Pendente",
        },
        {
          name: "Parcial",
        },
        {
          name: "Pago",
        },
        {
          name: "Cancelado",
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("status_payment", null, {});
  }
};
