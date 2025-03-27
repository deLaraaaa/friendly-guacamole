import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: path.join(__dirname, "../.env"),
});

// Debug (remove after confirming it works)
console.info("[FTH-RL] DB_USER:", process.env.DB_USER);

export const DB_CONFIG = {
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: parseInt(process.env.PORT, 10) || 5432, // Make sure port is a number
};

export const TABLES = {
  ACCOUNT: {
    KIND: "Account",
    COLUMNS: ["id", "name", "email"],
  },
};

export const ERROR_MESSAGES = {
  INVALID_TABLE: "Invalid table name",
  MISSING_PARAMS: "Invalid parameters: table, filter, and data are required.",
  DB_CONNECTION: "Database connection error",
};