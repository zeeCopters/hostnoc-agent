import { UserRepository } from "../repositories/user.repository.js";

const userRepo = new UserRepository();

export class UserService {
  async createUser({ fullName, email, phone, ipAddress }) {
    return await userRepo.create({
      fullName,
      email,
      phone,
      ipAddress,
    });
  }
}
