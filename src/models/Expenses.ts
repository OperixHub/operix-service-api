// @ts-nocheck
import connection from "../database/connection.js";

const reloadSocketData = async () => {
  const data = await getAll();
  const mod = await import("../app.js");
  const app = mod.default || mod;
  const { io } = app;
  io.emit("reloadDataExpenses", data);
  return true;
};

const getAll = async () => {
  const connect = await connection.connect();
  const expenses = await connect.query("SELECT * FROM expenses");
  connect.release();
  return expenses.rows;
};

const create = async (request) => {
  const { date, type, description, value } = request;
  const query = "INSERT INTO expenses (date, type, description, value) VALUES ($1, $2, $3, $4)";

  const values = [date, type, description, value];

  const connect = await connection.connect();
  const created = await connect.query(query, values);
  connect.release();

  await reloadSocketData();

  return created.rowCount;
};

const remove = async (id) => {
  const connect = await connection.connect();
  const removed = await connect.query("DELETE FROM expenses WHERE id = $1", [id]);
  connect.release();
  return removed.rowCount;
};

export default {
  getAll,
  create,
  remove,
};
