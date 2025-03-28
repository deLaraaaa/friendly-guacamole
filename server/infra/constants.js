import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env"), });

const CONST = {
  DB_CONFIG: {
    user: process.env.DB_USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: parseInt(process.env.DB_PORT)
  },

  SERVER_CONFIG: {
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  },

  TABLES: {
    ACCOUNT: {
      KIND: "Accounts",
      COLUMNS: {
        id: "id",
        username: "username",
        password: "password",
        namespace: "namespace",
        restaurantId: "restaurantId",
        email: "email",
        role: "role",
        createdAt: "createdAt"
      },
    },
    RESTAURANT: {
      KIND: "Restaurant",
      COLUMNS: ["id", "namespace", "createdAt"],
    },
  },

  ERROR_MESSAGES: {
    INVALID_TABLE: "Invalid table name",
    MISSING_PARAMS: "Invalid parameters: table, filter, and data are required.",
    DB_CONNECTION: "Database connection error",
  },
};

export default CONST;
