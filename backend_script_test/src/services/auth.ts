import { Request, Response } from "express";
import { sendResponse, sendError } from "../utils/response";
import { AuthRepository } from "../repository/auth.repository";
import { generateToken, comparePasswords } from "../utils/auth";
export class AuthServices {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;

      const existingUserMail = await AuthRepository.findByEmail(userData.email);
      const existingUserNpp = await AuthRepository.findByNpp(userData.npp);
      if (existingUserMail || existingUserNpp) {
        sendError(res, 400, "User already exists");
        return;
      }

      if (userData.npp_supervisor) {
        if (userData.npp_supervisor.trim() === "") {
          sendError(res, 400, "Supervisor NPP cannot be empty");
          return;
        }
        const existingspv = await AuthRepository.findByNpp(
          userData.npp_supervisor
        );
        if (!existingspv) {
          sendError(res, 400, "Spv Not Found");
          return;
        }
      }

      const user = await AuthRepository.create(userData);
      const token = generateToken({
        id: user.id,
        email: user.email,
        npp: user.npp,
      });
      sendResponse(res, 201, "User registered successfully", {
        token,
        user: {
          id: user.id,
          email: user.email,
          npp: user.npp,
        },
      });
    } catch (error) {
      sendError(res, 500, error);
    }
  }
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const user = await AuthRepository.findByEmail(userData.email);
      if (!user) {
        sendError(res, 401, "Invalid credentials");
        return;
      }
      // Verify password
      const isValidPassword = await comparePasswords(
        userData.password,
        user.password
      );
      if (!isValidPassword) {
        sendError(res, 401, "Invalid credentials");
        return;
      }
      const token = generateToken({
        id: user.id,
        email: user.email,
        npp: user.npp,
      });
      sendResponse(res, 200, "Login successful", {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      sendError(res, 500, "Internal server error");
    }
  }
}
