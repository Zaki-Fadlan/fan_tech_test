import { Request, Response } from "express";
import { sendResponse, sendError } from "../utils/response";
import { AuthRequest } from "../middlewares/auth";
import { PresenceRepository } from "../repository/presence.repository";
import { parsedDate } from "../utils/dateparser";
import { GroupedPresences } from "../types/presence";
import { AuthRepository } from "../repository/auth.repository";

export class PresenceService {
  static async reqApproval(req: AuthRequest, res: Response): Promise<void> {
    try {
      const reqData = req.body;
      const userId = req.user?.id;
      const { type, waktu } = reqData;
      if (type !== "IN" && type !== "OUT") {
        return sendError(res, 400, "Invalid type. Expected 'IN' or 'OUT'.");
      }
      // Parse waktu input ke objek Date
      const parsedWaktu = parsedDate(waktu);

      // Validasi apakah waktu valid
      if (!parsedWaktu) {
        sendError(
          res,
          400,
          "Invalid date format for waktu. Expected format: yyyy-MM-dd HH:mm:ss"
        );
        return;
      }
      const presenceData = {
        ...reqData,
        id_users: userId, // Menambahkan userId
        waktu: parsedWaktu,
      };
      const existingPresence =
        await PresenceRepository.checkPresencedUserOnDate(presenceData);
      // Jika sudah ada data IN atau OUT, kirim pesan yang sesuai
      if (existingPresence.length > 0) {
        // Cek jika type adalah 'IN'
        if (type === "IN") {
          return sendResponse(
            res,
            200,
            `Already check-in at ${parsedWaktu.toLocaleString()}`
          );
        }

        // Cek jika type adalah 'OUT'
        if (type === "OUT") {
          return sendResponse(
            res,
            200,
            `Already check-out at ${parsedWaktu.toLocaleString()}`
          );
        }
      }
      const newPresence = await PresenceRepository.create(presenceData);
      sendResponse(res, 200, "Req Approval Routes", newPresence);
    } catch (error) {
      sendError(res, 500, error);
    }
  }
  static async resApproval(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id_presence = parseInt(req.params.id, 10);
      if (isNaN(id_presence)) {
        sendError(res, 400, "Bad Request: Invalid ID format");
        return;
      }

      const userNpp = req.user?.npp;
      // Validasi nilai is_approve
      const { is_approve } = req.query;
      if (!is_approve) {
        sendError(res, 400, "Bad Request: Parameter 'is_approve' is required");
        return;
      }
      if (
        is_approve.toString().toLowerCase() !== "true" &&
        is_approve.toString().toLowerCase() !== "false"
      ) {
        sendError(
          res,
          400,
          "Bad Request: Parameter 'is_approve' must be 'true' or 'false'"
        );
        return;
      }

      const approveStatus = is_approve.toString().toLowerCase() === "true"; // convert ke boolean

      const presenceData = await PresenceRepository.getPresenceById(
        id_presence
      );
      // Jika presence data tidak ditemukan
      if (!presenceData) {
        sendError(res, 404, `Presence with ID ${id_presence} not found.`);
        return;
      }

      const userData = await AuthRepository.findUserById(presenceData.id_users);
      // apakah npp user ini direspon oleh spv berwenang
      if (!userData || userData.npp_supervisor !== userNpp) {
        sendError(res, 401, `User Unauthorized to access this resource`);
        return;
      }

      // Update presence status approval
      const updatedPresenceData = await PresenceRepository.updatePresenceById(
        approveStatus,
        presenceData.id
      );
      sendResponse(
        res,
        200,
        `Res Approval Routes untuk ID ${id_presence}`,
        updatedPresenceData
      );
      return;
    } catch (error) {
      sendError(res, 500, `Internal Server Error: ${error}`);
    }
  }

  static async getAllPresence(req: Request, res: Response): Promise<void> {
    try {
      const presences = await PresenceRepository.getAllPresences();
      // Kelompokkan berdasarkan userId dan tanggal
      const groupedPresences: GroupedPresences = presences.reduce(
        (acc: GroupedPresences, presence) => {
          const date = presence.waktu.toISOString().split("T")[0]; // ambil hanya bagian tanggal (yyyy-mm-dd)
          if (!acc[date]) acc[date] = {};

          if (!acc[date][presence.id_users]) {
            acc[date][presence.id_users] = {
              nama_user: presence.user.name,
              waktu_masuk: null,
              waktu_pulang: null,
              status_masuk: "Pending",
              status_pulang: "Pending",
            };
          }

          // Tentukan waktu_masuk dan waktu_pulang berdasarkan tipe presensi
          const localTime = new Date(presence.waktu); // Waktu UTC dari DB
          const formattedTime = localTime.toLocaleTimeString("en-US", {
            timeZone: "Asia/Jakarta",
            hour12: false,
          }); // Konversi waktu UTC ke WIB dan format ke HH:mm:ss

          if (presence.type === "IN") {
            acc[date][presence.id_users].waktu_masuk = formattedTime;
            acc[date][presence.id_users].status_masuk =
              PresenceRepository.getStatus(presence.is_approve);
          }

          if (presence.type === "OUT") {
            acc[date][presence.id_users].waktu_pulang = formattedTime;
            acc[date][presence.id_users].status_pulang =
              PresenceRepository.getStatus(presence.is_approve);
          }

          return acc;
        },
        {}
      );

      // Formatkan hasil sesuai kebutuhan
      const formattedResults = Object.keys(groupedPresences)
        .map((date) => {
          return Object.keys(groupedPresences[date]).map((userId) => {
            const userPresence = groupedPresences[date][parseInt(userId)];
            return {
              id_user: parseInt(userId),
              nama_user: userPresence.nama_user,
              tanggal: date,
              waktu_masuk: userPresence.waktu_masuk || "Belum Masuk",
              waktu_pulang: userPresence.waktu_pulang || "Belum Pulang",
              status_masuk: userPresence.status_masuk,
              status_pulang: userPresence.status_pulang,
            };
          });
        })
        .flat();

      sendResponse(
        res,
        200,
        "Success Get All Presences data",
        formattedResults
      );
    } catch (error) {
      sendError(res, 500, error);
    }
  }
  static async getPresenceByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      const presences = await PresenceRepository.getPresenceByUserId(userId);
      // Kelompokkan berdasarkan userId dan tanggal
      const groupedPresences: GroupedPresences = presences.reduce(
        (acc: GroupedPresences, presence) => {
          const date = presence.waktu.toISOString().split("T")[0]; // ambil hanya bagian tanggal (yyyy-mm-dd)
          if (!acc[date]) acc[date] = {};

          if (!acc[date][presence.id_users]) {
            acc[date][presence.id_users] = {
              nama_user: presence.user.name,
              waktu_masuk: null,
              waktu_pulang: null,
              status_masuk: "Pending",
              status_pulang: "Pending",
            };
          }

          // Tentukan waktu_masuk dan waktu_pulang berdasarkan tipe presensi
          const localTime = new Date(presence.waktu); // Waktu UTC dari DB
          const formattedTime = localTime.toLocaleTimeString("en-US", {
            timeZone: "Asia/Jakarta",
            hour12: false,
          }); // Konversi waktu UTC ke WIB dan format ke HH:mm:ss

          if (presence.type === "IN") {
            acc[date][presence.id_users].waktu_masuk = formattedTime;
            acc[date][presence.id_users].status_masuk =
              PresenceRepository.getStatus(presence.is_approve);
          }

          if (presence.type === "OUT") {
            acc[date][presence.id_users].waktu_pulang = formattedTime;
            acc[date][presence.id_users].status_pulang =
              PresenceRepository.getStatus(presence.is_approve);
          }

          return acc;
        },
        {}
      );

      // Formatkan hasil sesuai kebutuhan
      const formattedResults = Object.keys(groupedPresences)
        .map((date) => {
          return Object.keys(groupedPresences[date]).map((userId) => {
            const userPresence = groupedPresences[date][parseInt(userId)];
            return {
              id_user: parseInt(userId),
              nama_user: userPresence.nama_user,
              tanggal: date,
              waktu_masuk: userPresence.waktu_masuk || "Belum Masuk",
              waktu_pulang: userPresence.waktu_pulang || "Belum Pulang",
              status_masuk: userPresence.status_masuk,
              status_pulang: userPresence.status_pulang,
            };
          });
        })
        .flat();

      sendResponse(
        res,
        200,
        "Success Get All Presences data",
        formattedResults
      );
    } catch (error) {
      sendError(res, 500, error);
    }
  }
}
