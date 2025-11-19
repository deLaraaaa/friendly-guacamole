import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

// eslint-disable-next-line new-cap
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const authenticateApiKey = (req, res, next) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Basic ")) {
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
    const [, password] = credentials.split(":");

    if (password === apiKey) {
      return next();
    }
  }

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token === apiKey) {
      return next();
    }
  }

  const customApiKey = req.headers["x-api-key"];
  if (customApiKey === apiKey) {
    return next();
  }

  res.status(401).json({ error: "Unauthorized: Invalid or missing API Key" });
};

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.debug("[Auth]", "Validating JWT token");
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
  const publicRoutesRequiringApiKey = [
    "/api/register_first_user",
    "/api/restaurant_register"
  ];

  const publicRoutes = [
    "/api/login",
    "/api/register",
    "/api/send_reset_code",
    "/api/reset_password"
  ];

  if (publicRoutesRequiringApiKey.includes(req.path)) {
    return authenticateApiKey(req, res, next);
  }

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  authenticate(req, res, next);
});

const routesDir = path.join(__dirname, "../api/routes");
(async () => {
  const files = await fs.promises.readdir(routesDir);
  for (const file of files) {
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
