import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import httpStatus from "http-status";
import routes from "./routes/index.js";

const app = express();

// security headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors());

// API Routes
app.use("/api/v1", routes);

app.get("/api/v1/health", (req, res) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Server is running",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// 404 Route
app.use((req, res) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API route not found",
  });
});

export default app;
