import express from "express";
import cors from "cors";
import crud from "../../infra/crud.js";
import dotenv from "dotenv";
import process from "process";
import rateLimit from "express-rate-limit";
import api from "../access.js";
import CONST from "../../infra/constants.js";
import { authenticate } from "../../infra/auth.js";

dotenv.config();

// eslint-disable-next-line new-cap
const router = express.Router();

router.use(cors({ origin: process.env.CORS_ORIGIN }));
router.use(express.json());

router.get("/api/accounts", async (req, res) => {
  try {
    const accounts = await crud.list(CONST.TABLES.ACCOUNT.KIND, {});
    res.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

router.post("/api/restaurant_register", async (req, res) => {
  try {
    const restaurant = await api.restaurantRegister(req.user, req.body);
    res.status(201).json(restaurant);
  } catch (error) {
    console.error("Error registering restaurant:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to register restaurant" });
  }
});

router.post("/api/register", async (req, res) => {
  try {
    const user = await api.register(req.user, req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to register user" });
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: { error: "Too many login attempts, please try again later" }
});

router.post("/api/login", async (req, res) => {
  try {
    const result = await api.login(req.body);
    console.info(`[FTH-RL] (__filename:${new Error().stack.split("\n")[1].trim().split(":").reverse()[1]})`, result);
    req.user = result.user;
    res.status(200).json(result);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(error.status || 500).json({ error: error.message || "Login failed" });
  }
});

router.post("/api/send_reset_code", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await api.sendResetCode(email);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error sending reset token:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to send reset token" });
  }
});

router.post("/api/reset_password", async (req, res) => {
  try {
    const {
      email, resetToken, newPassword
    } = req.body;
    const result = await api.resetPassword(email, resetToken, newPassword);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to reset password" });
  }
});

router.post("/api/add_item", authenticate, async (req, res) => {
  try {
    const result = await api.addInventoryItem(req.user, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error adding inventory item:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/inventory_items", authenticate, async (req, res) => {
  try {
    const filters = req.query;
    const items = await crud.list(req.user, CONST.TABLES.INVENTORY_ITEMS.KIND, {
      ...filters,
      restaurantId: req.user.restaurantId
    });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error listing inventory items:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to list inventory items" });
  }
});

router.post("/api/stock_entry", authenticate, async (req, res) => {
  try {
    const result = await api.addStockEntry(req.user, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding stock entry:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to add stock entry" });
  }
});

router.get("/api/list_stock_entries", authenticate, async (req, res) => {
  try {
    const filters = req.query;
    const entries = await api.listStockEntries(req.user, filters);
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error listing stock entries:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to list stock entries" });
  }
});

router.post("/api/stock_exits", authenticate, async (req, res) => {
  try {
    const result = await api.addStockExit(req.user, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding stock exit:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to add stock exit" });
  }
});

router.get("/api/list_stock_exits", authenticate, async (req, res) => {
  try {
    const filters = req.query;
    const exits = await api.listStockExits(req.user, filters);
    res.status(200).json(exits);
  } catch (error) {
    console.error("Error listing stock exits:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to list stock exits" });
  }
});

router.post("/api/movement", authenticate, async (req, res) => {
  try {
    const result = await api.addMovement(req.user, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding movement:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to add movement" });
  }
});

router.get("/api/movements", authenticate, async (req, res) => {
  try {
    const filters = req.query;
    const movements = await api.listMovements(req.user, filters);
    res.status(200).json(movements);
  } catch (error) {
    console.error("Error listing movements:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to list movements" });
  }
});

router.get("/api/metrics", authenticate, async (req, res) => {
  try {
    const metrics = await api.getMetrics(req.user);
    res.status(200).json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to fetch metrics" });
  }
});

router.get("/api/validate_token", authenticate, (req, res) => {
  try {
    const {
      id, username, namespace, restaurantId, role
    } = req.user;
    res.json({
      id, username, namespace, restaurantId, role
    });
  } catch (error) {
    console.error("Error in /api/validate_token:", error);
    res.status(500).json({ error: "Failed to fetch user information" });
  }
});

router.get("/api/users", authenticate, async (req, res) => {
  try {
    const users = await api.listUsers(req.user);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to list users" });
  }
});

router.post("/api/create_user", authenticate, async (req, res) => {
  try {
    const result = await api.createUser(req.user, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to create user" });
  }
});

router.post("/api/toggle_user_activation", authenticate, async (req, res) => {
  try {
    const result = await api.toggleUserActivation(req.user, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error toggling user activation:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to toggle user activation" });
  }
});

router.post("/api/force_password_change", async (req, res) => {
  try {
    const result = await api.forcePasswordChange(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error forcing password change:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to force password change" });
  }
});

router.post("/api/change_password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await api.changePassword(req.user, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to change password" });
  }
});

router.post("/api/delete_user", authenticate, async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await api.deleteUser(req.user, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to delete user" });
  }
});

export default router;
