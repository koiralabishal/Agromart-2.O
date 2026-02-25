import express from "express";
import { getForecast } from "../controllers/forecastController.js";

const router = express.Router();

router.get("/", getForecast);

export default router;
