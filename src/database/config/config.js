import dotenv from "dotenv";

dotenv.config();

const config = {
  development: {
    dialect: "postgres",
    dialectOptions: {
      bigNumberStrings: true,
    },
    url: process.env.DATABASE_URL,
  },
  production: {
    dialect: "postgres",
    dialectOptions: {
      bigNumberStrings: true,
      ssl: false,
    },
    url: process.env.DATABASE_URL,
  },
};

export default config;