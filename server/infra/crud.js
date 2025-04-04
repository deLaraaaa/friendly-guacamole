import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import CONST from "./constants.js";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env"), });

const pool = new Pool(CONST.DB_CONFIG);

// TODO: FTH.RL - REMOVE CONSOLE.ERROR
const crud = {
  async create(kind, data) {
    const table = `"${kind}"`;

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

  async list(kind, filter = {}, limit = 100) {
    const table = `"${kind}"`;

    const keys = Object.keys(filter).filter(k => k !== "limit");
    const values = keys.map(k => filter[k]);

    let query = `SELECT * FROM ${table}`;
    if (keys.length > 0) {
      const whereClause = keys
        .map((key, i) => `${key} = $${i + 1}`)
        .join(" AND ");
      query += ` WHERE ${whereClause}`;
    }

    if (limit) {
      const paramPosition = values.length + 1;
      query += ` LIMIT $${paramPosition}`;
      values.push(parseInt(limit, 10));
    }

    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error in list:", error, "Query:", query, "Values:", values);
      throw error;
    } finally {
      client.release();
    }
  },

  async read(kind, filter) {
    const client = await pool.connect();
    try {
      const table = `"${kind}"`;

      const keys = Object.keys(filter);
      const values = Object.values(filter);
      const whereClause = keys
        .map((key, i) => `${key} = $${i + 1}`)
        .join(" AND ");
      const query = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error in read:", error);
      throw error;
    } finally {
      client.release();
    }
  },

  async update(kind, filter, data) {
    if (!kind || !filter || !data) {
      throw new Error(CONST.ERROR_MESSAGES.MISSING_PARAMS);
    }
    const table = `"${kind}"`;

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
      return result.rows[0];
    } catch (error) {
      console.error("Error in update:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  async searchLike(kind, field, value) {
    const table = `"${kind}"`;
    const query = `SELECT * FROM ${table} WHERE ${field} ILIKE $1`;
    const searchPattern = `%${value}%`;

    const client = await pool.connect();
    try {
      const result = await client.query(query, [searchPattern]);
      return result.rows;
    } catch (error) {
      console.error("Error in searchLike:", error);
      throw error;
    } finally {
      client.release();
    }
  }
};

export default crud;
