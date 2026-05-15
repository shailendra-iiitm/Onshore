import express from "express";
import { fetchBusinesses } from "../controllers/buisness.controller.js";

const router = express.Router();

router.get("/", fetchBusinesses);

export default router;