import mongoose from "mongoose";
import dotenv from "dotenv";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("error connecting MongoDB", error);
    process.exit(1);
  }
};
   