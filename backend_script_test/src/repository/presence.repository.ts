import { epresences } from "../database/generated/prisma";
import { prisma } from "../utils/prisma";

export class PresenceRepository {
  static async create(presenceData: Omit<epresences, "id">) {
    try {
      const newPresence = await prisma.epresences.create({
        data: {
          id_users: presenceData.id_users,
          type: presenceData.type,
          waktu: presenceData.waktu,
        },
      });
      return newPresence;
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("Email or npp already exists");
      }
      throw error;
    }
  }
  static async updatePresenceById(is_approve: boolean, id_presence: number) {
    try {
      const newPresence = await prisma.epresences.update({
        data: {
          is_approve: is_approve,
        },
        where: {
          id: id_presence,
        },
      });
      return newPresence;
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("Email or npp already exists");
      }
      throw error;
    }
  }
  static async getPresenceById(id_presence: number) {
    try {
      const existingPresence = await prisma.epresences.findUnique({
        select: {
          id: true,
          id_users: true,
          type: true,
          is_approve: true,
          waktu: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        where: {
          id: id_presence,
        },
      });
      return existingPresence;
    } catch (error: any) {
      throw error;
    }
  }
  static async checkPresencedUserOnDate(presenceData: epresences) {
    try {
      const { waktu, id_users, type } = presenceData;
      const startOfDay = new Date(waktu);
      startOfDay.setHours(0, 0, 0, 0); // Set to start of day (00:00:00)

      const endOfDay = new Date(waktu);
      endOfDay.setHours(23, 59, 59, 999); // Set to end of day (23:59:59.999)

      const existingPresence = await prisma.epresences.findMany({
        where: {
          id_users: id_users,
          type: type,
          // Memeriksa apakah waktunya di hari yang sama
          waktu: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });
      return existingPresence;
    } catch (error: any) {
      throw error;
    }
  }
  static async getAllPresences() {
    try {
      const presences = await prisma.epresences.findMany({
        select: {
          id: true,
          id_users: true,
          type: true,
          is_approve: true,
          waktu: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });
      return presences;
    } catch (error: any) {
      throw error;
    }
  }
  static async getPresenceByUserId(userId: number) {
    try {
      const presences = await prisma.epresences.findMany({
        select: {
          id: true,
          id_users: true,
          type: true,
          is_approve: true,
          waktu: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        where: {
          id_users: userId,
        },
      });
      return presences;
    } catch (error: any) {
      throw error;
    }
  }

  // Helper function to get status from is_approve value
  static getStatus(is_approve: boolean | null) {
    if (is_approve === null) return "Pending";
    if (is_approve === true) return "APPROVED";
    return "REJECT";
  }
}
