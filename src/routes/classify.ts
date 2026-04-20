import { Router, Request, Response } from "express";
import { validateName } from "../utils/validation.js";
import { fetchGenderPrediction } from "../services/genderize.js";
import { notFound } from "../utils/errors.js";
import { ApiSuccessResponse } from "../types/api.js";

const MIN_PROBABILITY = 0.7;
const MIN_SAMPLE_SIZE = 100;

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const name = validateName(req.query.name);

  const prediction = await fetchGenderPrediction(name);

  if (prediction.gender === null || prediction.count === 0) {
    throw notFound("No prediction available for the provided name");
  }

  const body: ApiSuccessResponse = {
    status: "success",
    data: {
      name,
      gender: prediction.gender,
      probability: prediction.probability,
      sample_size: prediction.count,
      is_confident: prediction.probability >= MIN_PROBABILITY && prediction.count >= MIN_SAMPLE_SIZE,
      processed_at: new Date().toISOString(),
    },
  };

  res.json(body);
});

export default router;
