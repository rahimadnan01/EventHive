import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
const app = express();
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
export { app };

import userRoute from "./routes/user.routes.js";
import adminRoute from "./routes/admin.routes.js";
import eventRoute from "./routes/event.routes.js";
app.use("/api/v1", adminRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", eventRoute);

app.use(errorHandler);
app.use(notFoundHandler);
