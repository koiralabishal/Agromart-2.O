import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Create backup connection immediately so it's available for models
const backupUri = process.env.MONGODB_URI.replace(
  /\/[^/?]+(\?|$)/,
  "/backup_agromart_2$1"
);
const backupConnection = mongoose.createConnection(backupUri);

backupConnection.on("connected", () => console.log("Backup MongoDB Connected"));
backupConnection.on("error", (err) =>
  console.error("Backup MongoDB Connection Error:", err)
);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Main MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Main DB Error: ${error.message}`);
    process.exit(1);
  }
};

export { backupConnection };
export default connectDB;
