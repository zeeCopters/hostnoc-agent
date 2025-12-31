import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
