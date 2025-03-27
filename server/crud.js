import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: path.join(__dirname, ".env"),
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

const crud = {
  async create(table, data) {
    const keys = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

    const query = `INSERT INTO ${table} (${keys}) VALUES (${placeholders}) RETURNING *`;
    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    } finally {
      client.release();
    }
  },

  async list(table, filter = {}) {
    const keys = Object.keys(filter);
    const values = Object.values(filter);
    const whereClause = keys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(" AND ");

    const query = `SELECT * FROM ${table} ${keys.length ? `WHERE ${whereClause}` : ""}`;
    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error in list:", error);
      throw error;
    } finally {
      client.release();
    }
  },

  async read(table, filter) {
    const keys = Object.keys(filter);
    const values = Object.values(filter);
    const whereClause = keys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(" AND ");

    const query = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error in read:", error);
      throw error;
    } finally {
      client.release();
    }
  },

  async update(table, filter, data) {
    if (!table || !filter || !data) {
      throw new Error("Invalid parameters: table, filter, and data are required.");
    }

    const filterKeys = Object.keys(filter);
    const filterValues = Object.values(filter);
    const filterClause = filterKeys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(" AND ");

    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);
    const updateClause = dataKeys
      .map((key, i) => `${key} = $${i + 1 + filterKeys.length}`)
      .join(", ");

    const query = `UPDATE ${table} SET ${updateClause} WHERE ${filterClause} RETURNING *`;

    const client = await pool.connect();
    try {
      const result = await client.query(query, [...filterValues, ...dataValues]);
      console.info(`[FTH-RL][Line ${new Error().stack.split('\n')[1].split(':')[1]}]`, 'result.rows[0]:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Error in update:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }
};

export default crud;
