import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env"), });

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: Number.parseInt(process.env.DB_PORT)
};

if (process.env.REQUIRE_SSL === "true") {
  dbConfig.ssl = { rejectUnauthorized: false };
}

const CONST = {
  DB_CONFIG: dbConfig,

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
    MOVEMENT: {
      KIND: "Movement",
      COLUMNS: {
        id: "id",
        itemId: "itemId",
        restaurantId: "restaurantId",
        type: "type",
        quantity: "quantity",
        invoiceUrl: "invoiceUrl",
        entryDate: "entryDate",
        price: "price",
        offDate: "offDate",
        destination: "destination"
      },
      TYPES: {
        IN: "IN",
        OUT: "OUT"
      },
      DESTINATIONS: {
        KITCHEN: "KITCHEN",
        DELIVERY: "DELIVERY",
        WASTE: "WASTE",
        OTHER: "OTHER"
      }
    },
  },

  ERRORS: {
    ERR_0000: { Code: "0000", Message: "Missing user" },
    ERR_1000: { Code: "1000", Message: "Only admins can change User Roles" },
    ERR_1001: { Code: "1001", Message: "Only admins can add inventory items" },
    ERR_2000: { Code: "2000", Message: "Missing required fields" },
    ERR_2001: { Code: "2001", Message: "Invalid email format" },
    ERR_2002: { Code: "2002", Message: "Invalid or expired reset token" },
    ERR_2003: { Code: "2003", Message: "Insufficient stock for this operation" },
    ERR_2004: { Code: "2004", Message: "Invalid role specified" },
    ERR_2005: { Code: "2005", Message: "Restaurant with this namespace already exists" },
    ERR_2006: { Code: "2006", Message: "User already exists with this username and namespace" },
    ERR_2007: { Code: "2007", Message: "User already exists with this email" },
    ERR_2008: { Code: "2008", Message: "Inventory item not found" },
  },
};

export default CONST;
