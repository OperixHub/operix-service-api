/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tenants", "logo_url", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("tenants", "plan_key", {
      type: Sequelize.STRING(80),
      allowNull: false,
      defaultValue: "trial",
    });

    await queryInterface.addColumn("tenants", "subscription_status", {
      type: Sequelize.STRING(40),
      allowNull: false,
      defaultValue: "trialing",
    });

    await queryInterface.addColumn("tenants", "trial_started_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    });

    await queryInterface.addColumn("tenants", "trial_ends_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("NOW() + INTERVAL '30 days'"),
    });

    await queryInterface.addColumn("tenants", "enabled_modules", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });

    await queryInterface.addColumn("users", "avatar_url", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "role_title", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });

    await queryInterface.addColumn("users", "active", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn("users", "preferences", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "preferences");
    await queryInterface.removeColumn("users", "active");
    await queryInterface.removeColumn("users", "role_title");
    await queryInterface.removeColumn("users", "avatar_url");
    await queryInterface.removeColumn("tenants", "enabled_modules");
    await queryInterface.removeColumn("tenants", "trial_ends_at");
    await queryInterface.removeColumn("tenants", "trial_started_at");
    await queryInterface.removeColumn("tenants", "subscription_status");
    await queryInterface.removeColumn("tenants", "plan_key");
    await queryInterface.removeColumn("tenants", "logo_url");
  },
};
