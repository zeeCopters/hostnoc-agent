import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    ip: String,
    countryCode: String,
    countryName: String,
    regionName: String,
    cityName: String,
    latitude: Number,
    longitude: Number,
    zipCode: String,
    timeZone: String,
    asn: String,
    as: String,
    isProxy: Boolean,
  },
  { _id: false }
);

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
    location: LocationSchema,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
