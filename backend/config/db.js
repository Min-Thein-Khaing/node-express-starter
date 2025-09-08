import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    const dbWithMongoose = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log(`MongoDB Connected: ${dbWithMongoose.connection.host}`);
  } catch (err) {
    console.log(err);
     process.exit(1);
  }
};
