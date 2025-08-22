import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const connectDB = async () => {
  try {
    let connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}`);
    console.log(
      `Successfully connected to DATABASE: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Failed to Connect to DB", error.message);
    process.exit(1);
  }
};
