import express from "express";
import cors from "cors";
import crud from "../../infra/crud.js";
import dotenv from "dotenv";
import process from "process";
import rateLimit from "express-rate-limit";
import api from "../access.js";
import CONST from "../../infra/constants.js";

dotenv.config();

// eslint-disable-next-line new-cap
const router = express.Router();

router.use(cors({ origin: process.env.CORS_ORIGIN }));
router.use(express.json());

router.get("/api/accounts", async (req, res) => {
  try {
    console.info(`[FTH-RL] (__filename:${new Error().stack.split('\n')[1].trim().split(':').reverse()[1]})`, req.user);
    const accounts = await crud.list(CONST.TABLES.ACCOUNT.KIND, {});
    res.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

router.post("/api/restaurant_register", async (req, res) => {
  try {
    const restaurant = await api.restaurantRegister(req.body);
    res.status(201).json(restaurant);
  } catch (error) {
    console.error("Error registering restaurant:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to register restaurant" });
  }
});

router.post("/api/register", async (req, res) => {
  try {
    const user = await api.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to register user" });
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many login attempts, please try again later" }
});

router.post("/api/login", authLimiter, async (req, res) => {
  try {
    const result = await api.login(req.body);
    req.user = result.user;
    console.info(`[FTH-RL] (__filename:${new Error().stack.split('\n')[1].trim().split(':').reverse()[1]})`, req.user);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(error.status || 500).json({ error: error.message || "Login failed" });
  }
});

export default router;
