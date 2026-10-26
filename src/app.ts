import express from "express";
import cors from "cors";
import profileRoutes from "./routes/profile.routes.js";
import { globalErrorHandler } from "./middleware/error.handler.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/profiles", profileRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

app.use(globalErrorHandler);

export default app;
