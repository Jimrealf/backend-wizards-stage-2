import { Router, Request, Response } from "express";
import { badRequest, unprocessable } from "../utils/errors.js";
import { parsePagination } from "../utils/pagination.js";
import { parseSorting } from "../utils/sorting.js";
import { parseQuery } from "../search/parser.js";
import { runProfileQuery } from "../utils/profileQuery.js";
import { ProfileListResponse } from "../types/api.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { q } = req.query;
  if (typeof q !== "string" || q.trim().length === 0) {
    throw badRequest("Invalid query parameters");
  }

  const filters = parseQuery(q);
  if (Object.keys(filters).length === 0) {
    throw unprocessable("Unable to interpret query");
  }

  const pagination = parsePagination(req.query);
  const sorting = parseSorting(req.query);
  const { rows, total } = await runProfileQuery(filters, sorting, pagination);

  const body: ProfileListResponse = {
    status: "success",
    page: pagination.page,
    limit: pagination.limit,
    total,
    data: rows,
  };
  res.json(body);
});

export default router;
