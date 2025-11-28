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

  async restaurantRegister(data) {
    let { namespace } = data;
    namespace = validator.escape(namespace.trim());

    if (!namespace) {
      throw { status: 400, message: "Restaurant namespace is required" };
    }

    const existingRestaurant = await crud.readLogin(CONST.TABLES.RESTAURANT.KIND, { namespace });
    if (existingRestaurant) {
      throw { status: 409, ...CONST.ERRORS.ERR_2005 };
    }

    const newRestaurant = await crud.createLogin(CONST.TABLES.RESTAURANT.KIND, {
      namespace,
      createdAt: new Date()
    });

    return newRestaurant;
  },

  async registerFirstUser(data) {
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

    const restaurant = await crud.readLogin(CONST.TABLES.RESTAURANT.KIND, { namespace });
    if (!restaurant) {
      throw { status: 404, message: "Restaurant not found. Create restaurant first using /api/restaurant_register" };
    }

    const restaurantId = restaurant.id;

    const existingUserByUsername = await crud.readLogin(CONST.TABLES.ACCOUNT.KIND, { username, namespace });
    if (existingUserByUsername) {
      throw { status: 409, ...CONST.ERRORS.ERR_2006 };
    }

    const existingUserByEmail = await crud.readLogin(CONST.TABLES.ACCOUNT.KIND, { email });
    if (existingUserByEmail) {
      throw { status: 409, ...CONST.ERRORS.ERR_2007 };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário sem autenticação (uso crud.createLogin)
    const newUser = await crud.createLogin(CONST.TABLES.ACCOUNT.KIND, {
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
      const account = await crud.readLogin(CONST.TABLES.ACCOUNT.KIND, { username, namespace, deleted: false });
      if (!account) {
        throw { status: 401, message: "Invalid credentials" };
      }

      if (!account.active) {
        throw { status: 403, message: "Account is deactivated" };
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

      crud.updateLogin(CONST.TABLES.ACCOUNT.KIND, { id: account.id }, { lastLogin: new Date() });

      const { password: _, ...userWithoutPassword } = account;
      return { user: userWithoutPassword, token };
    } catch (error) {
      console.error("Error during login:", error);
      const err = new Error("Internal server error");
      err.status = 500;
      throw err;
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

  async changePassword(user, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw { status: 400, message: "Current password and new password are required" };
    }

    const account = await crud.readLogin(CONST.TABLES.ACCOUNT.KIND, { id: user.id });
    if (!account) {
      throw { status: 404, message: "User not found" };
    }

    const passwordMatch = await bcrypt.compare(currentPassword, account.password);
    if (!passwordMatch) {
      throw { status: 401, message: "Current password is incorrect" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await crud.update(user, CONST.TABLES.ACCOUNT.KIND, { id: user.id }, { password: hashedPassword, firstLogin: false });

    return { message: "Password changed successfully" };
  },

  async changeUserRole(user, data) {
    if (user.role !== CONST.TABLES.ACCOUNT.ROLE.ADMIN) throw { status: 404, ...CONST.ERRORS.ERR_1000 };
    const { userId, newRole } = data;
    const restaurantId = user.restaurantId;

    if (!userId || !newRole) {
      throw { status: 400, message: "UserId and newRole are required" };
    }

    const targetUser = await crud.read(user, CONST.TABLES.ACCOUNT.KIND, { id: userId, restaurantId });
    if (targetUser && targetUser.role === CONST.TABLES.ACCOUNT.ROLE.ADMIN) {
      throw { status: 400, message: "Não é possível alterar o role de um administrador" };
    }

    const validRoles = Object.values(CONST.TABLES.ACCOUNT.ROLE);
    if (!validRoles.includes(newRole)) {
      throw { status: 400, ...CONST.ERRORS.ERR_2004 };
    }

    return await crud.update(user, CONST.TABLES.ACCOUNT.KIND, { id: userId, restaurantId }, { role: newRole });
  },

  async addInventoryItem(user, data) {
    const {
      name, category, quantity,
    } = data;

    if (user.role !== CONST.TABLES.ACCOUNT.ROLE.ADMIN) throw { status: 404, ...CONST.ERRORS.ERR_1001 };

    if (!name || !category) {
      throw { status: 400, message: "Name and category are required" };
    }

    const restaurantId = user.restaurantId;

    return crud.create(user, CONST.TABLES.INVENTORY_ITEMS.KIND, {
      name, category, quantity, restaurantId
    });
  },

  async updateInventoryItem(user, data) {
    if (user.role !== CONST.TABLES.ACCOUNT.ROLE.ADMIN) throw { status: 404, ...CONST.ERRORS.ERR_1001 };

    const { itemId, name, category } = data;
    const restaurantId = user.restaurantId;

    if (!itemId) {
      throw { status: 400, message: "ItemId is required" };
    }

    if (!name || !category) {
      throw { status: 400, message: "Name and category are required" };
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;

    return await crud.update(
      user,
      CONST.TABLES.INVENTORY_ITEMS.KIND,
      { id: itemId, restaurantId },
      updateData
    );
  },

  async addStockEntry(user, data) {
    const {
      itemId, quantity, invoiceUrl, expirationDate, price
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
      itemId,
      quantity,
      userId,
      invoiceUrl,
      restaurantId,
      expirationDate,
      price
    });
  },

  async listStockEntries(user, filters = {}) {
    if (!user) throw { status: 401, message: "Unauthorized" };
    const {
      dataInicio, dataFim, ...otherFilters
    } = filters;
    const restaurantId = user.restaurantId;

    if (dataInicio || dataFim) {
      const where = ["\"restaurantId\" = $1"];
      const params = [restaurantId];
      let paramIdx = 2;

      for (const [key, value] of Object.entries(otherFilters)) {
        where.push(`"${key}" = $${paramIdx++}`);
        params.push(value);
      }

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

    if (dataInicio || dataFim) {
      const where = ["\"restaurantId\" = $1"];
      const params = [restaurantId];
      let paramIdx = 2;

      for (const [key, value] of Object.entries(otherFilters)) {
        where.push(`"${key}" = $${paramIdx++}`);
        params.push(value);
      }

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

    const queryFilters = { ...otherFilters, restaurantId };
    return await crud.list(user, CONST.TABLES.STOCK_EXITS.KIND, queryFilters);
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
  },

  async listUsers(user) {
    if (user.role !== CONST.TABLES.ACCOUNT.ROLE.ADMIN) throw { status: 403, message: "Forbidden" };
    return await crud.list(user, CONST.TABLES.ACCOUNT.KIND, { restaurantId: user.restaurantId, deleted: false });
  },

  async createUser(user, data) {
    if (user.role !== CONST.TABLES.ACCOUNT.ROLE.ADMIN) throw { status: 403, message: "Forbidden" };
    const { username, email } = data;

    if (!username || !email) throw { status: 400, message: "Username and email are required" };

    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    await crud.create(user, CONST.TABLES.ACCOUNT.KIND, {
      username,
      email,
      password: hashedPassword,
      restaurantId: user.restaurantId,
      namespace: user.namespace,
      role: data.role,
      active: true,
      firstLogin: true,
      createdAt: new Date()
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Created",
      text: `Your account has been created. Username: ${username}@${user.namespace}, Password: ${password}`
    });

    return { message: "User created and email sent" };
  },

  async toggleUserActivation(user, data) {
    if (user.role !== CONST.TABLES.ACCOUNT.ROLE.ADMIN) throw { status: 403, message: "Forbidden" };
    const { userId, active } = data;

    if (typeof active !== "boolean") throw { status: 400, message: "Invalid active status" };

    return await crud.update(user, CONST.TABLES.ACCOUNT.KIND, { id: userId, restaurantId: user.restaurantId }, { active });
  },

  async deleteUser(user, userId) {
    if (user.role !== CONST.TABLES.ACCOUNT.ROLE.ADMIN) throw { status: 403, message: "Forbidden" };

    return await crud.update(user, CONST.TABLES.ACCOUNT.KIND, { id: userId, restaurantId: user.restaurantId }, { deleted: true, active: false });
  },

  async forcePasswordChange(data) {
    const { userId, newPassword } = data;

    if (!userId || !newPassword) throw { status: 400, message: "UserId and newPassword are required" };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await crud.update(null, CONST.TABLES.ACCOUNT.KIND, { id: userId }, { password: hashedPassword, firstLogin: false });

    return { message: "Password updated successfully" };
  },

  async addMovement(user, data) {
    const {
      itemId, type, quantity, invoiceUrl, price, offDate, destination
    } = data;
    const restaurantId = user.restaurantId;

    if (!itemId || !type || !quantity || !restaurantId) {
      throw { status: 400, ...CONST.ERRORS.ERR_2000 };
    }

    const inventoryItem = await crud.read(user, CONST.TABLES.INVENTORY_ITEMS.KIND, { id: itemId, restaurantId });
    if (!inventoryItem) throw { status: 404, ...CONST.ERRORS.ERR_2008 };

    let updatedQuantity;
    if (type === CONST.TABLES.MOVEMENT.TYPES.IN) {
      updatedQuantity = inventoryItem.quantity + quantity;
    } else if (type === CONST.TABLES.MOVEMENT.TYPES.OUT) {
      updatedQuantity = inventoryItem.quantity - quantity;
      if (updatedQuantity < 0) {
        throw { status: 400, ...CONST.ERRORS.ERR_2003 };
      }
    }

    await crud.update(user, CONST.TABLES.INVENTORY_ITEMS.KIND, { id: itemId }, { quantity: updatedQuantity });

    const movementData = {
      itemId,
      restaurantId,
      type,
      quantity,
      entryDate: new Date(),
    };

    if (type === CONST.TABLES.MOVEMENT.TYPES.IN) {
      if (offDate) movementData.offDate = offDate;
      if (price) movementData.price = price;
      if (invoiceUrl) movementData.invoiceUrl = invoiceUrl;
    } else if (type === CONST.TABLES.MOVEMENT.TYPES.OUT) {
      movementData.offDate = offDate || new Date().toISOString().split("T")[0];
      if (destination) movementData.destination = destination;
    }

    return await crud.create(user, CONST.TABLES.MOVEMENT.KIND, movementData);
  },

  async listMovements(user, filters = {}) {
    if (!user) throw { status: 401, message: "Unauthorized" };

    const {
      dataInicio, dataFim, type, ...otherFilters
    } = filters;
    const restaurantId = user.restaurantId;

    if (dataInicio || dataFim || type) {
      const where = ["\"restaurantId\" = $1"];
      const params = [restaurantId];
      let paramIdx = 2;

      for (const [key, value] of Object.entries(otherFilters)) {
        where.push(`"${key}" = $${paramIdx++}`);
        params.push(value);
      }

      if (type) {
        where.push(`"type" = $${paramIdx++}`);
        params.push(type);
      }

      if (dataInicio) {
        where.push(`"entryDate" >= $${paramIdx++}`);
        params.push(dataInicio);
      }
      if (dataFim) {
        where.push(`"entryDate" <= $${paramIdx++}`);
        params.push(dataFim);
      }

      const query = `
        SELECT * FROM "Movement"
        WHERE ${where.join(" AND ")}
        ORDER BY "entryDate" DESC
      `;
      return await crud.rawQuery(user, query, params);
    }

    const queryFilters = { ...otherFilters, restaurantId };
    return await crud.list(user, CONST.TABLES.MOVEMENT.KIND, queryFilters);
  }
};
