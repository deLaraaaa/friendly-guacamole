import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import exp from "constants";

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
      ROLE: {
        ADMIN: "ADMIN",
        RECEPCIONIST: "RECEPCIONIST",
        COOK: "COOK",
        WAITER: "WAITER"
      }
    },
    RESTAURANT: {
      KIND: "Restaurant",
      COLUMNS: {
        id: "id", namespace: "namespace", createdAt: "createdAt"
      },
    },
    INVENTORY_ITEMS: {
      KIND: "InventoryItems",
      COLUMNS: {
        id: "id",
        name: "name",
        quantity: "quantity",
        expirationDate: "expirationDate",
        category: "category",
        restaurantId: "restaurantId"
      },
      CATEGORY: [
        "Vegetable",
        "Fruit",
        "Meat",
        "Dairy",
        "Beverage",
        "Condiment",
        "Grain",
        "Frozen"
      ]
    },
    STOCK_ENTRIES: {
      KIND: "StockEntries",
      COLUMNS: {
        id: "id",
        itemId: "itemId",
        quantity: "quantity",
        invoiceUrl: "invoiceUrl",
        restaurantId: "restaurantId"
      },
    },
    STOCK_EXITS: {
      KIND: "StockExits",
      COLUMNS: {
        id: "id",
        itemId: "itemId",
        quantity: "quantity",
        destination: "destination",
        exitType: "exitType",
        exitDate: "exitDate",
        restaurantId: "restaurantId"
      },
      Destination: {
        KITCHEN: "KITCHEN",
        DELIVERY: "DELIVERY",
        WASTE: "WASTE",
        OTHER: "OTHER"
      },
      EXIT_TYPES: {
        USAGE: "USAGE",
        WASTE: "WASTE",
      }
    },
  },

  ERROR_MESSAGES: {
    INVALID_TABLE: "Invalid table name",
    MISSING_PARAMS: "Invalid parameters: table, filter, and data are required.",
    DB_CONNECTION: "Database connection error",
    MISSING_USER: "User is required",
    INVALID_KIND: "Invalid table name provided.",
  },
};

export default CONST;
