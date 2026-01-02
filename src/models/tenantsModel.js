const connection = require("../database/connection");

const tableName = "tenants";

const getAll = async () => {
  const connect = await connection.connect();
  const tenants = await connect.query(`SELECT * FROM ${tableName}`);
  connect.release();
  return tenants.rows;
};

const create = async (tenantname) => {
  const query =
    `INSERT INTO ${tableName} (name) VALUES ($1)`;

  const values = [
    tenantname
  ];

  const connect = await connection.connect();
  const created = await connect.query(query, values);
  connect.release();

  return created.rowCount;
};

const remove = async (id) => {
  const connect = await connection.connect();
  const removed = await connect.query(
    `DELETE FROM ${tableName} WHERE id = $1`,
    [id]
  );
  connect.release();
  return removed.rowCount;
};

module.exports = {
  getAll,
  create,
  remove,
};
