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
      throw { status: 404, message: "Restaurant with this namespace does not exist" };
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
      throw { status: 409, message: "Restaurant with this namespace already exists" };
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
      throw { status: 400, message: "Username, password, namespace, email, and role are required" };
    }

    if (!validator.isEmail(email)) {
      throw { status: 400, message: "Invalid email format" };
    }

    const validRoles = ["ADMIN", "RECEPCIONIST", "COOK", "WAITER"];
    if (!validRoles.includes(role)) {
      throw { status: 400, message: `Role must be one of: ${validRoles.join(", ")}` };
    }

    const restaurant = await this.getRestaurantByNamespace(user, namespace);
    const restaurantId = restaurant.id;

    const existingUserByUsername = await crud.read(user, CONST.TABLES.ACCOUNT.KIND, { username, namespace });
    if (existingUserByUsername) {
      throw { status: 409, message: "User already exists with this username and namespace" };
    }

    const existingUserByEmail = await crud.read(user, CONST.TABLES.ACCOUNT.KIND, { email });
    if (existingUserByEmail) {
      throw { status: 409, message: "User already exists with this email" };
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
    const { login, password } = data;

    if (!login || !password) {
      throw { status: 400, message: "Login and password are required" };
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

    const token = jwt.sign(
      {
        id: account.id,
        username: account.username,
        namespace: account.namespace,
        restaurantId: account.restaurantId,
        role: account.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...userWithoutPassword } = account;
    return { user: userWithoutPassword, token };
  },

  async sendResetCode(user, email) {
    if (!email) {
      throw { status: 400, message: "Email is required" };
    }

    email = validator.normalizeEmail(email.trim());
    if (!validator.isEmail(email)) {
      throw { status: 400, message: "Invalid email format" };
    }

    const account = await crud.read(user, CONST.TABLES.ACCOUNT.KIND, { email });
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

  async resetPassword(user, email, resetToken, newPassword) {
    console.info(`[FTH-RL] (__filename:${new Error().stack.split("\n")[1].trim().split(":").reverse()[1]})`, email, resetToken, newPassword);
    if (!email || !resetToken || !newPassword) {
      throw { status: 400, message: "Email, reset token, and new password are required" };
    }

    email = validator.normalizeEmail(email.trim());
    if (!validator.isEmail(email)) {
      throw { status: 400, message: "Invalid email format" };
    }

    const tokenData = resetTokens.get(email);
    if (!tokenData || tokenData.token !== resetToken || Date.now() > tokenData.expiresAt) {
      throw { status: 400, message: "Invalid or expired reset token" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await crud.update(user, CONST.TABLES.ACCOUNT.KIND, { email }, { password: hashedPassword });

    resetTokens.delete(email);
    return { message: "Password reset successfully" };
  },

  async addInventoryItem(user, data) {
    console.info(`[FTH-RL] (__filename:${new Error().stack.split("\n")[1].trim().split(":").reverse()[1]})`, data);
    const {
      name, category, quantity, expirationDate,
    } = data;

    console.info(`[FTH-RL] (__filename:${new Error().stack.split("\n")[1].trim().split(":").reverse()[1]})`, user);

    if (user.role !== CONST.TABLES.ACCOUNT.ROLE.ADMIN) {
      throw { status: 403, message: "Only admins can add inventory items" };
    }

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
      itemId, quantity, invoiceUrl
    } = data;
    const userId = user.id;
    const restaurantId = user.restaurantId;

    if (!itemId || !quantity || !userId || !restaurantId) {
      throw { status: 400, message: "ItemId, quantity, userId, and restaurantId are required" };
    }

    const inventoryItem = await crud.read(user, CONST.TABLES.INVENTORY_ITEMS.KIND, { id: itemId, restaurantId });
    if (!inventoryItem) {
      throw { status: 404, message: "Inventory item not found" };
    }

    const updatedQuantity = inventoryItem.quantity + quantity;

    await crud.update(user, CONST.TABLES.INVENTORY_ITEMS.KIND, { id: itemId }, { quantity: updatedQuantity });

    return await crud.create(user, CONST.TABLES.STOCK_ENTRIES.KIND, {
      itemId, quantity, userId, invoiceUrl, restaurantId
    });
  },

  async addStockExit(user, data) {
    const {
      itemId, quantity, destination, exitType, exitDate
    } = data;
    const userId = user.id;
    const restaurantId = user.restaurantId;

    if (!itemId || !quantity || !restaurantId || !destination || !exitType || !exitDate) {
      throw { status: 400, message: "ItemId, quantity, userId, restaurantId, destination, exitType and exitDate are required" };
    }

    const inventoryItem = await crud.read(user, CONST.TABLES.INVENTORY_ITEMS.KIND, { id: itemId, restaurantId });
    if (!inventoryItem) {
      throw { status: 404, message: "Inventory item not found" };
    }

    const updatedQuantity = inventoryItem.quantity - quantity;
    if (updatedQuantity < 0) {
      throw { status: 400, message: "Insufficient stock for this operation" };
    };

    await crud.update(user, CONST.TABLES.INVENTORY_ITEMS.KIND, { id: itemId }, { quantity: updatedQuantity });

    return await crud.create(user, CONST.TABLES.STOCK_EXITS.KIND, {
      itemId, quantity, userId, destination, exitType, exitDate, restaurantId
    });
  },

  async generateReport(user, data) {
    const {
      reportTitle, description, reportType
    } = data;
    const createdBy = user.id;
    const restaurantId = user.restaurantId;

    if (!reportTitle || !description || !reportType || !createdBy || !restaurantId) {
      throw { status: 400, message: "ReportTitle, description, reportType, createdBy, and restaurantId are required" };
    }

    return await crud.create(user, CONST.TABLES.GENERAL_REPORTS.KIND, {
      reportTitle, description, reportType, createdBy, restaurantId
    });
  }
};
