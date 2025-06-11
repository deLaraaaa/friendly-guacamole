import express from "express";
import cors from "cors";
import router from "./api/routes/access_.js"; // seu loader de rotas + middleware

const app = express();

// Configure o CORS **antes** de usar o router
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // se você também usar cookies
  preflightContinue: false, // faz o cors enviar a resposta automática no preflight
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // responde automaticamente a qualquer OPTIONS

app.use(express.json());

app.use(router);

app.listen(process.env.PORT || 3001, () => {
  console.log("Server running on port", process.env.PORT || 3001);
});
