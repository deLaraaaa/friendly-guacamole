import express from "express";
import dotenv from "dotenv";
import apiRouter from "./infra/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
