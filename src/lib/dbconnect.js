import mongoose from "mongoose";

// Use a global variable to persist connection state across hot reloads
let globalWithMongoose = global;
let cached = globalWithMongoose.mongoose || { conn: null, promise: null };

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        dbName: "eventnotifyapp",
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log("MongoDB connected");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }
  cached.conn = await cached.promise;
  globalWithMongoose.mongoose = cached;
  return cached.conn;
}
