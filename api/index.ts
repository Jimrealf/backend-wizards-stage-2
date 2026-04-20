import type { IncomingMessage, ServerResponse } from "http";
import { initSchema } from "../src/utils/db.js";
import app from "../src/app.js";

const ready = initSchema();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ready;
  return app(req, res);
}
