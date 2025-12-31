import User from "../models/User.js";

export class UserRepository {
  async create(data) {
    const user = new User(data);
    return await user.save();
  }
}
