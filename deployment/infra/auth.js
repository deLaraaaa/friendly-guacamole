import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

// eslint-disable-next-line new-cap
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.info(`[FTH-RL] (__filename:${new Error().stack.split('\n')[1].trim().split(':').reverse()[1]})`, authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

router.use((req, res, next) => {
  const publicRoutes = ["/api/login", "/api/register", "/api/restaurant_register", "/api/send_reset_code", "/api/reset_password"];
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  authenticate(req, res, next);
});

const routesDir = path.join(__dirname, "../api/routes");
(async () => {
  for (const file of fs.readdirSync(routesDir)) {
    if (file.endsWith(".js")) {
      const route = await import(path.join(routesDir, file));

      if (route.default && typeof route.default === "function") {
        router.use(route.default);
      } else {
        console.error(`Invalid route file: ${file}. It must export an express.Router instance.`);
      }
    }
  }
})();

export default router;
