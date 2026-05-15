import express from "express";
import cors from "cors";

import apiRoutes from "./src/routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Onshore Backend Running",
  });
});

app.use("/api/v1", apiRoutes);

export default app;