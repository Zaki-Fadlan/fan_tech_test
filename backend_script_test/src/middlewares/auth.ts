import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendResponse, sendError } from "../utils/response";
dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    npp: string;
  };
}
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      sendResponse(res, 401, "Authentication token required");
      return;
    }
    if (!process.env.JWT_SECRET) {
      sendResponse(res, 500, "Server configuration error");
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: number;
      email: string;
      npp: string;
    };
    req.user = decoded;
    if (res.headersSent) return;

    next();
  } catch (error) {
    sendError(res, 403, "Invalid or expired token");
  }
};
