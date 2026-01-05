import { UserRepository } from "../repositories/user.repository.js";
import { getLocationFromIP } from "./ip-location.service.js";

const userRepo = new UserRepository();

export class UserService {
  async createUser({ fullName, email, phone, ip }) {
    // 1️⃣ Fetch location from IP
    const location = await getLocationFromIP(ip);

    // 2️⃣ Save user
    return userRepo.create({
      fullName,
      email,
      phone,
      ipAddress: ip,
      location,
    });
  }
}
