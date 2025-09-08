// Script para profiling do servidor
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

// Middleware para medir performance de requests - DEVE VIR ANTES DAS ROTAS
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.debug(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);

    // Log de alertas de performance
    if (duration > 1000) {
      console.debug(`⚠️  SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
});

// Agora adicionamos as rotas DEPOIS do middleware de profiling
app.use(router);

// Endpoint para teste de performance
app.get("/api/performance-test", (req, res) => {
  const start = performance.now();

  // Simular operação pesada
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.random();
  }

  const duration = performance.now() - start;
  res.json({
    result: result,
    duration: `${duration.toFixed(2)}ms`,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.debug(`🚀 Servidor rodando na porta ${PORT} com profiling ativado`);
  console.debug(`📊 Acesse http://localhost:${PORT}/api/performance-test para teste`);
});
