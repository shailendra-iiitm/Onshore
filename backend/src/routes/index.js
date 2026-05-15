import express from "express";

import businessRoutes from "./buisness.routes.js";
import reviewRoutes from "./review.routes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API v1 Running",
  });
});

router.use("/business", businessRoutes);
router.use("/reviews", reviewRoutes);

export default router;