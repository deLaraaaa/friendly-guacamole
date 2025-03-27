import express from "express";
import cors from "cors";
import crud from "./infra/crud.js";
import dotenv from "dotenv";
import process from "process";
dotenv.config();

const router = express();
const PORT = process.env.PORT || 3001;

router.use(cors({ origin: process.env.CORS_ORIGIN }));
router.use(express.json());

router.get("/api/accounts", async (req, res) => {
  try {
    const accounts = await crud.list("Account");
    res.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

export { router, PORT };
