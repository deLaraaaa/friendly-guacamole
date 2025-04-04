import CONST from "./infra/constants.js";
import crud from "./infra/crud.js";
import express from "express";
import dotenv from "dotenv";
import apiRouter from "./api/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  testDatabase();
});

async function testDatabase() {
  try {
    const user = await crud.read(CONST.TABLES.ACCOUNT.KIND, { username: "rafael", namespace: "aguadoce" });
    console.log("User read:", user);
  } catch (error) {
    console.error(error);
  }
}
