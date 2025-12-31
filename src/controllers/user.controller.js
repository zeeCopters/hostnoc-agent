import { UserService } from "../services/user.service.js";

const userService = new UserService();

export class UserController {
  static async create(req, res) {
    try {
      const { fullName, email, phone } = req.body;

      if (!fullName || !email || !phone) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // ✅ Capture IP WITHOUT request params
      const ipAddress =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        req.ip;

      const user = await userService.createUser({
        fullName,
        email,
        phone,
        ipAddress,
      });

      res.status(201).json({
        id: user._id,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
