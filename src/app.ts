import express from "express";
import cors from "cors";
import classifyRouter from "./routes/classify.js";
import profilesRouter from "./routes/profiles.js";
import searchRouter from "./routes/search.js";
import { errorHandler } from "./utils/errors.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`, req.query);
  next();
});

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/classify", classifyRouter);
app.use("/api/profiles/search", searchRouter);
app.use("/api/profiles", profilesRouter);

app.use(errorHandler);

export default app;
