import app from "./app.js";
import { initSchema } from "./utils/db.js";

const PORT = process.env.PORT ?? 3000;

initSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Failed to initialize database schema:", err);
    process.exit(1);
  });
