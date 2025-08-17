import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  googleRefreshToken: String,
  phoneNumber: String,
  calledEventIds: {
  type: [String],
  default: [],
},
});

export default mongoose.models.User || mongoose.model("User", userSchema);
