import app from "./app.js";
import { databaseConnection } from "./config/db.js";

const PORT = process.env.PORT || 5000;

// DB + Server start
const startServer = async () => {
  try {
    await databaseConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ DB connection failed:", error);
    process.exit(1);
  }
};

startServer();