import { users } from "../database/generated/prisma";
import { hashPassword } from "../utils/auth";
import { prisma } from "../utils/prisma";
export class AuthRepository {
  static async create(userData: Omit<users, "id">) {
    try {
      const hashedPassword = await hashPassword(userData.password);
      const newUser = await prisma.users.create({
        data: {
          name: userData.name,
          email: userData.email,
          npp: userData.npp,
          npp_supervisor: userData.npp_supervisor,
          password: hashedPassword,
        },
      });
      return newUser;
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("Email or npp already exists");
      }
      throw error;
    }
  }
  static async findUserById(usser_id: number) {
    try {
      const user = await prisma.users.findUnique({
        where: {
          id: usser_id,
        },
      });
      return user;
    } catch (error: any) {
      throw error;
    }
  }
  static async findByEmail(email: string) {
    try {
      const user = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });
      return user;
    } catch (error: any) {
      throw error;
    }
  }
  static async findByNpp(npp: string) {
    try {
      const user = await prisma.users.findUnique({
        where: {
          npp: npp,
        },
      });
      return user;
    } catch (error: any) {
      throw error;
    }
  }
}
