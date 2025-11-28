import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectToDatabase from "./database/database.js";

import userRoutes from "./routes/user.routes.js";

connectToDatabase();

const app = express();

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/v1/users", userRoutes);

export default app;
