import express from "express";
import cors from "cors";
import router from "./api/routes/access_.js";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.use(router);

app.listen(process.env.PORT || 3001, () => {
  console.log("Server running on port", process.env.PORT || 3001);
});
