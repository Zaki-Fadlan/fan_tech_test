import { Router } from "express";
import { PresenceService } from "../services/presence";
import { authenticateToken } from "../middlewares/auth";
const router = Router();
router.post("/", [authenticateToken], PresenceService.reqApproval);
router.get("/", [authenticateToken], PresenceService.getAllPresence);
router.put("/:id", [authenticateToken], PresenceService.resApproval);
router.get("/:id", [authenticateToken], PresenceService.getPresenceByUserId);
export default router;
