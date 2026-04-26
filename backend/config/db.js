import mongoose from "mongoose";

export const databaseConnection = async () => {
  try {
    const connect = await mongoose.connect(
      `${process.env.MONGOOSE_URI}/${process.env.DB_Name}`
    );
    console.log("Server Connected Successfully");
  } catch (error) {
    console.log("Database not connected");
    throw error; // Re-throw to prevent server start
  }
};


