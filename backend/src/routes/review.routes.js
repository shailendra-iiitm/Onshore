import express from "express";
import { fetchReviews } from "../controllers/review.controller.js";

const router = express.Router();

router.get("/", fetchReviews);

export default router;