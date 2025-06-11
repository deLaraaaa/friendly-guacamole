import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import crud from "../infra/crud.js";
import CONST from "../infra/constants.js";
import nodemailer from "nodemailer";
import process from "process";

const resetTokens = new Map();

export default {
  async getRestaurantByNamespace(user, namespace) {
    const restaurant = await crud.read(user, CONST.TABLES.RESTAURANT.KIND, { namespace });

    if (!restaurant) {
      throw { status: 404, ...CONST.ERRORS.ERR_2005 };
    }
  },

  async restaurantRegister(user, data) {
    let { namespace } = data;
    namespace = validator.escape(namespace.trim());

    if (!namespace) {
      throw { status: 400, message: "Restaurant namespace is required" };
    }

    const existingRestaurant = await crud.read(user, CONST.TABLES.RESTAURANT.KIND, { namespace });
    if (existingRestaurant) {
      throw { status: 409, ...CONST.ERRORS.ERR_2005 };
    }

    const newRestaurant = await crud.create(user, CONST.TABLES.RESTAURANT.KIND, {
      namespace,
      createdAt: new Date()
    });

    return newRestaurant;
  },

  async register(user, data) {
    let {
      // eslint-disable-next-line prefer-const
      username, password, namespace, email, role
    } = data;

    username = validator.escape(username.trim());
    namespace = validator.escape(namespace.trim());
    email = validator.normalizeEmail(email.trim());
    role = role.toUpperCase();

    if (!username || !password || !namespace || !email || !role) {
      throw { status: 400, ...CONST.ERRORS.ERR_2000 };
    }

    if (!validator.isEmail(email)) {
      throw { status: 400, ...CONST.ERRORS.ERR_2001 };
    }

    const validRoles = Object.values(CONST.TABLES.ACCOUNT.ROLE);
    if (!validRoles.includes(role)) {
      throw { status: 400, ...CONST.ERRORS.ERR_2004 };
    }

    const restaurant = await this.getRestaurantByNamespace(user, namespace);
    const restaurantId = restaurant.id;

    const existingUserByUsername = await crud.read(user, CONST.TABLES.ACCOUNT.KIND, { username, namespace });
    if (existingUserByUsername) {
      throw { status: 409, ...CONST.ERRORS.ERR_2006 };
    }

    const existingUserByEmail = await crud.read(user, CONST.TABLES.ACCOUNT.KIND, { email });
    if (existingUserByEmail) {
      throw { status: 409, ...CONST.ERRORS.ERR_2007 };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await crud.create(user, CONST.TABLES.ACCOUNT.KIND, {
      username,
      password: hashedPassword,
      namespace,
      email,
      restaurantId,
      role,
      createdAt: new Date()
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async login(data) {
    try {
      const {
        login, password, rememberMe
      } = data;

      if (!login || !password) {
        throw { status: 400, ...CONST.ERRORS.ERR_2000 };
      }

      const loginParts = login.split("@");
      if (loginParts.length !== 2) {
        throw { status: 400, message: "Invalid login format. Use username@namespace" };
      }

      const [username, namespace] = loginParts;
      const account = await crud.readLogin(CONST.TABLES.ACCOUNT.KIND, { username, namespace });
      if (!account) {
        throw { status: 401, message: "Invalid credentials" };
      }

      const passwordMatch = await bcrypt.compare(password, account.password);
      if (!passwordMatch) {
        throw { status: 401, message: "Invalid credentials" };
      }

      const tokenExpiry = rememberMe ? "7d" : "1h";
      const token = jwt.sign(
        {
          id: account.id,
          username: account.username,
          namespace: account.namespace,
          restaurantId: account.restaurantId,
          role: account.role
        },
        process.env.JWT_SECRET,
        { expiresIn: tokenExpiry }
      );

      const { password: _, ...userWithoutPassword } = account;
      return { user: userWithoutPassword, token };
    } catch (error) {
      console.info(`[FTH-RL] (__filename:${new Error().stack.split("\n")[1].trim().split(":").reverse()[1]})`, "error:", error);
    }
  },

  async sendResetCode(email) {
    if (!email) {
      throw { status: 400, ...CONST.ERRORS.ERR_2000 };
    }

    email = validator.normalizeEmail(email.trim());
    if (!validator.isEmail(email)) {
      throw { status: 400, ...CONST.ERRORS.ERR_2001 };
    }

    const account = await crud.readLogin(CONST.TABLES.ACCOUNT.KIND, { email });
    if (!account) {
      throw { status: 404, message: "Account with this email does not exist" };
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    resetTokens.set(email, {
      token: resetToken,
      expiresAt: Date.now() + 15 * 60 * 1000
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetToken}`
    });

    // TODO: FTH.RL - REMOVER TOKEN
    return { message: "Reset token sent to email" };
  },

  async resetPassword(email, resetToken, newPassword) {
    if (!email || !resetToken || !newPassword) {
      throw { status: 400, ...CONST.ERRORS.ERR_2000 };
    }

    email = validator.normalizeEmail(email.trim());
    if (!validator.isEmail(email)) {
      throw { status: 400, ...CONST.ERRORS.ERR_2001 };
    }

    const tokenData = resetTokens.get(email);
    if (!tokenData || tokenData.token !== resetToken || Date.now() > tokenData.expiresAt) {
      throw { status: 400, ...CONST.ERRORS.ERR_2002 };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await crud.updateLogin(CONST.TABLES.ACCOUNT.KIND, { email }, { password: hashedPassword });

    resetTokens.delete(email);
    return { message: "Password reset successfully" };
  },

  async changeUserRole(user, data) {
    if (user.role !== CONST.TABLES.ACCOUNT.ROLE.ADMIN) throw { status: 404, ...CONST.ERRORS.ERR_1000 };
    const { userId, newRole } = data;
    const restaurantId = user.restaurantId;

    if (!userId || !newRole) {
      throw { status: 400, message: "UserId and newRole are required" };
    }

    const validRoles = Object.values(CONST.TABLES.ACCOUNT.ROLE);
    if (!validRoles.includes(newRole)) {
      throw { status: 400, ...CONST.ERRORS.ERR_2004 };
    }

    return await crud.update(user, CONST.TABLES.ACCOUNT.KIND, { id: userId, restaurantId }, { role: newRole });
  },

  async addInventoryItem(user, data) {
    console.info(`[FTH-RL] (__filename:${new Error().stack.split("\n")[1].trim().split(":").reverse()[1]})`, data);
    const {
      name, category, quantity, expirationDate,
    } = data;

    console.info(`[FTH-RL] (__filename:${new Error().stack.split("\n")[1].trim().split(":").reverse()[1]})`, user);

    if (user.role !== CONST.TABLES.ACCOUNT.ROLE.ADMIN) throw { status: 404, ...CONST.ERRORS.ERR_1001 };

    if (!name || !category || !quantity) {
      throw { status: 400, message: "Name, category and quantity are required" };
    }

    const restaurantId = user.restaurantId;

    return crud.create(user, CONST.TABLES.INVENTORY_ITEMS.KIND, {
      name, category, quantity, expirationDate, restaurantId
    });
  },

  async addStockEntry(user, data) {
    const {
      itemId, quantity, invoiceUrl, expirationDate
    } = data;
    const userId = user.id;
    const restaurantId = user.restaurantId;

    if (!itemId || !quantity || !userId || !restaurantId) {
      throw { status: 400, ...CONST.ERRORS.ERR_2000 };
    }

    const inventoryItem = await crud.read(user, CONST.TABLES.INVENTORY_ITEMS.KIND, { id: itemId, restaurantId });
    if (!inventoryItem) throw { status: 404, ...CONST.ERRORS.ERR_2008 };

    const updatedQuantity = inventoryItem.quantity + quantity;

    await crud.update(user, CONST.TABLES.INVENTORY_ITEMS.KIND, { id: itemId }, { quantity: updatedQuantity });

    return await crud.create(user, CONST.TABLES.STOCK_ENTRIES.KIND, {
      itemId, quantity, userId, invoiceUrl, restaurantId, expirationDate
    });
  },

  async listStockEntries(user, filters = {}) {
    if (!user) throw { status: 401, message: "Unauthorized" };
    const {
      dataInicio, dataFim, ...otherFilters
    } = filters;
    const restaurantId = user.restaurantId;

    // Se houver filtro de data, usar rawQuery
    if (dataInicio || dataFim) {
      const where = ["\"restaurantId\" = $1"];
      const params = [restaurantId];
      let paramIdx = 2;

      // Adiciona outros filtros
      for (const [key, value] of Object.entries(otherFilters)) {
        where.push(`"${key}" = $${paramIdx++}`);
        params.push(value);
      }

      // Filtro de intervalo de data
      if (dataInicio) {
        where.push(`"expirationDate" >= $${paramIdx}`);
        params.push(dataInicio);
        paramIdx++;
      }
      if (dataFim) {
        where.push(`"expirationDate" <= $${paramIdx}`);
        params.push(dataFim);
      }

      const query = `
        SELECT * FROM "StockEntries"
        WHERE ${where.join(" AND ")}
      `;
      return await crud.rawQuery(user, query, params);
    }

    // Caso não haja filtro de data, usa o list padrão
    const queryFilters = { ...otherFilters, restaurantId };
    return await crud.list(user, CONST.TABLES.STOCK_ENTRIES.KIND, queryFilters);
  },

  async addStockExit(user, data) {
    const {
      itemId, quantity, destination, exitType, exitDate
    } = data;
    const userId = user.id;
    const restaurantId = user.restaurantId;

    if (!itemId || !quantity || !restaurantId || !destination || !exitType || !exitDate) {
      throw { status: 400, ...CONST.ERRORS.ERR_2000 };
    }

    const inventoryItem = await crud.read(user, CONST.TABLES.INVENTORY_ITEMS.KIND, { id: itemId, restaurantId });
    if (!inventoryItem) {
      throw { status: 404, ...CONST.ERRORS.ERR_2008 };
    }

    const updatedQuantity = inventoryItem.quantity - quantity;
    if (updatedQuantity < 0) {
      throw { status: 400, ...CONST.ERRORS.ERR_2003 };
    };

    await crud.update(user, CONST.TABLES.INVENTORY_ITEMS.KIND, { id: itemId }, { quantity: updatedQuantity });

    const now = new Date();
    const entryDate = now.toISOString().replace("T", " ").replace("Z", "");

    return await crud.create(user, CONST.TABLES.STOCK_EXITS.KIND, {
      itemId,
      quantity,
      userId,
      destination,
      exitType,
      exitDate,
      entryDate,
      restaurantId
    });
  },

  async listStockExits(user, filters = {}) {
    if (!user) throw { status: 401, message: "Unauthorized" };
    const {
      dataInicio, dataFim, ...otherFilters
    } = filters;
    const restaurantId = user.restaurantId;

    // Se houver filtro de data, usar rawQuery
    if (dataInicio || dataFim) {
      const where = ["\"restaurantId\" = $1"];
      const params = [restaurantId];
      let paramIdx = 2;

      // Adiciona outros filtros
      for (const [key, value] of Object.entries(otherFilters)) {
        where.push(`"${key}" = $${paramIdx++}`);
        params.push(value);
      }

      // Filtro de intervalo de data
      if (dataInicio) {
        where.push(`"exitDate" >= $${paramIdx}`);
        params.push(dataInicio);
        paramIdx++;
      }
      if (dataFim) {
        where.push(`"exitDate" <= $${paramIdx}`);
        params.push(dataFim);
      }

      const query = `
        SELECT * FROM "StockExits"
        WHERE ${where.join(" AND ")}
      `;
      return await crud.rawQuery(user, query, params);
    }

    // Caso não haja filtro de data, usa o list padrão
    const queryFilters = { ...otherFilters, restaurantId };
    return await crud.list(user, CONST.TABLES.STOCK_ENTRIES.KIND, queryFilters);
  },

  async generateReport(user, data) {
    const {
      reportTitle, description, reportType
    } = data;
    const createdBy = user.id;
    const restaurantId = user.restaurantId;

    if (!reportTitle || !description || !reportType || !createdBy || !restaurantId) {
      throw { status: 400, ...CONST.ERRORS.ERR_2000 };
    }

    return await crud.create(user, CONST.TABLES.GENERAL_REPORTS.KIND, {
      reportTitle, description, reportType, createdBy, restaurantId
    });
  }
};
