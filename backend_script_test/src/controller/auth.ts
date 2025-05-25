import { Router } from "express";
import { AuthServices } from "../services/auth";
const router = Router();
router.post("/login", AuthServices.login);
router.post("/register", AuthServices.register);
export default router;
