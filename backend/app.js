import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.router.js";

const app = express();


// Redis Client Setup
import { Redis } from "@upstash/redis";

const redisURL = process.env.REDIS_URL;
const redisToken = process.env.REDIS_TOKEN;

if (!redisURL || !redisToken) {
  console.error("❌ REDIS_URL or REDIS_TOKEN is not defined in environment variables.");
  process.exit(1);
}

export const redisClient = new Redis({
  url: redisURL,
  token: redisToken,
});

console.log("✅ Redis client initialized");


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());







// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(origin => origin.trim()) || [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`❌ CORS Error: Origin ${origin} not allowed`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use("/user", userRouter);


app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;