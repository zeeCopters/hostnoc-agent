import { UserService } from "../services/user.service.js";

const userService = new UserService();

export class UserController {
  static async createUser(req, res) {
    try {
      const { fullName, email, phone } = req.body;

      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;

      const user = await userService.createUser({
        fullName,
        email,
        phone,
        ip,
      });

      return res.status(201).json({ id: user._id });
    } catch (err) {
      console.error("❌ createUser error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
