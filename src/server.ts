import app from "./src/app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on UTC: ${new Date().toISOString()}`);
  console.log(`Endpoint: http://localhost:${PORT}/api/profiles`);
});
