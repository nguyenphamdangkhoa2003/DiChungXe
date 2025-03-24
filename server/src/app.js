import express from "express";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import MongoStore from "connect-mongo";
import authRouter from "./api/auth/auth.route.js";
import userRouter from "./api/user/user.route.js";
import { errorHandler } from "./middleware/errorHandler.js";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import passport from "passport";

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "You have sent too many requests, please try again later!",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware cơ bản
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(mongoSanitize());
app.use(limiter);
app.use(xssClean());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to our API!",
    version: "1.0.0",
    status: "running",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use(errorHandler);

export default app;
