import express from "express";
import authRoutes from "./controller/auth";
import presenceRoutes from "./controller/presence";
import dotenv from "dotenv";
import { sendError } from "./utils/response";
dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/presences", presenceRoutes);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (res.headersSent) {
      return next(err); // Pass the error to the default error handler
    }
    console.error(err.stack);
    sendError(res, 500, "Something went wrong!");
  }
);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
